'use client';

import { useState, useCallback, useRef } from 'react';
import { Vaga, Resume, MatchResult, Candidato } from '@/lib/api/types';
import { matchesService } from '@/lib/api/services/matches.service';
import { resumesService } from '@/lib/api/services/resumes.service';
import { candidatosService } from '@/lib/api/services/candidatos.service';

export type AIMatchStatus =
  | 'idle'
  | 'loading-model'
  | 'analyzing'
  | 'done'
  | 'error'
  | 'no-webgpu';

interface UseAIMatchReturn {
  matchResult: MatchResult | null;
  status: AIMatchStatus;
  progress: string;
  runMatch: (userId: string, job: Vaga) => Promise<void>;
  cachedMatch: MatchResult | null;
  loadCachedMatch: (userId: string, jobId: string) => Promise<void>;
}

export function useAIMatch(): UseAIMatchReturn {
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [cachedMatch, setCachedMatch] = useState<MatchResult | null>(null);
  const [status, setStatus] = useState<AIMatchStatus>('idle');
  const [progress, setProgress] = useState('');
  const engineRef = useRef<any>(null);

  const loadCachedMatch = useCallback(async (userId: string, jobId: string) => {
    try {
      const existing = await matchesService.getMatch(userId, jobId);
      if (existing) {
        setCachedMatch(existing);
        setMatchResult(existing);
        setStatus('done');
      }
    } catch (error) {
      console.error('Error loading cached match:', error);
    }
  }, []);

  const runMatch = useCallback(async (userId: string, job: Vaga) => {
    try {
      // Check WebGPU support
      if (typeof navigator === 'undefined' || !('gpu' in navigator)) {
        setStatus('no-webgpu');
        setProgress(
          'WebGPU não é suportado neste navegador. Use Chrome 113+ ou Edge 113+.',
        );
        return;
      }

      setStatus('loading-model');
      setProgress('Carregando modelo de IA no navegador...');

      // Dynamically import web-llm to avoid SSR issues
      const webllm = await import('@mlc-ai/web-llm');

      // Use a small, fast model
      const selectedModel = 'SmolLM2-360M-Instruct-q4f16_1-MLC';

      if (!engineRef.current) {
        const engine = await webllm.CreateMLCEngine(selectedModel, {
          initProgressCallback: (report: any) => {
            const pct = Math.round(report.progress * 100);
            setProgress(`Baixando modelo (${pct}%)... ${report.text || ''}`);
          },
        });
        engineRef.current = engine;
      }

      setStatus('analyzing');
      setProgress('Analisando compatibilidade com a vaga...');

      // Get the user's resume from BOTH candidatos profile AND resumes collection
      let resume: Resume | null = null;
      try {
        const [resumeData, candidateData] = await Promise.allSettled([
          resumesService.getResume(userId),
          candidatosService.getById(userId),
        ]);

        const existingResume =
          resumeData.status === 'fulfilled' ? resumeData.value : null;
        const candidate =
          candidateData.status === 'fulfilled' ? candidateData.value : null;

        // Merge candidate profile data with resume data
        resume = {
          id: userId,
          hardSkills: [
            ...(existingResume?.hardSkills || []),
            ...(candidate?.habilidades || []),
          ].filter((v, i, a) => a.indexOf(v) === i), // dedupe
          softSkills: existingResume?.softSkills || [],
          experiencias: [
            ...(existingResume?.experiencias || []),
            ...(candidate?.experienciaProfissional || []),
          ],
          formacao: existingResume?.formacao || [],
          cursosConcluidos: existingResume?.cursosConcluidos || [],
          keywords: existingResume?.keywords || [],
          updatedAt: existingResume?.updatedAt || new Date().toISOString(),
        };

        // If candidate has no data at all, set resume to null
        if (
          resume.hardSkills.length === 0 &&
          resume.experiencias.length === 0 &&
          resume.cursosConcluidos.length === 0
        ) {
          resume = null;
        }
      } catch {
        // Resume/profile may not exist yet
      }

      let parsed: any = null;

      // Try AI analysis, but fall back to algorithmic matching
      try {
        const prompt = buildMatchPrompt(job, resume);

        const response = await engineRef.current.chat.completions.create({
          messages: [
            {
              role: 'system',
              content:
                'You are an AI model specialized in Recruitment. Respond ONLY with valid JSON, no markdown or extra text.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.1,
          max_tokens: 512,
        });

        const content = response.choices[0]?.message?.content || '';

        // Try multiple extraction strategies
        try {
          parsed = JSON.parse(content);
        } catch {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              parsed = JSON.parse(jsonMatch[0]);
            } catch {
              parsed = null;
            }
          }
        }
      } catch (aiError) {
        console.warn(
          'AI inference failed, using algorithmic fallback:',
          aiError,
        );
      }

      // If AI didn't return valid data, use algorithmic matching
      if (!parsed || typeof parsed.match_score !== 'number') {
        parsed = computeAlgorithmicMatch(job, resume);
      }

      const result: MatchResult = {
        uid: userId,
        jobId: job.id,
        matchScore: Math.min(100, Math.max(0, parsed.match_score || 50)),
        recomendacao:
          parsed.recomendacao ||
          (parsed.match_score >= 75
            ? 'forte'
            : parsed.match_score >= 50
              ? 'medio'
              : 'fraco'),
        motivosMatch: parsed.motivos_match || [],
        gaps: parsed.gaps || [],
        palavrasChaveIdentificadas: parsed.palavras_chave_identificadas || [],
        sugestoesMelhorarCurriculo: parsed.sugestoes_melhorar_curriculo || [],
        model: parsed._algorithmic ? 'algoritmo-ats-v1' : selectedModel,
        updatedAt: new Date().toISOString(),
      };

      setMatchResult(result);
      setStatus('done');
      setProgress('');

      // Save to Firestore for caching
      try {
        await matchesService.saveMatch(result);
      } catch (e) {
        console.error('Error saving match to Firestore:', e);
      }
    } catch (error: any) {
      console.error('AI Match Error:', error);
      setStatus('error');
      setProgress(error.message || 'Erro ao executar análise de IA');
    }
  }, []);

  return {
    matchResult,
    status,
    progress,
    runMatch,
    cachedMatch,
    loadCachedMatch,
  };
}

function buildMatchPrompt(job: Vaga, resume: Resume | null): string {
  const vagaData = {
    titulo: job.titulo,
    descricao: job.descricao,
    requisitos: job.requisitos.map((r) => r.descricao),
    beneficios: job.beneficios,
    localizacao: job.localizacao,
    tipoContrato: job.tipoContrato,
    modalidade: job.modalidade,
  };

  const curriculoData = resume
    ? {
        hard_skills: resume.hardSkills || [],
        soft_skills: resume.softSkills || [],
        experiencias: resume.experiencias || [],
        formacao: resume.formacao || [],
        cursos_concluidos: resume.cursosConcluidos || [],
      }
    : {
        hard_skills: [],
        soft_skills: [],
        experiencias: [],
        formacao: [],
        cursos_concluidos: [],
      };

  return `Analyze the compatibility between the job and the candidate's resume. Return ONLY a JSON object.

Job: ${JSON.stringify(vagaData)}

Resume: ${JSON.stringify(curriculoData)}

Return this JSON: {"match_score": 0-100, "recomendacao": "forte"|"medio"|"fraco", "motivos_match": ["reason"], "gaps": ["gap"], "palavras_chave_identificadas": ["keyword"], "sugestoes_melhorar_curriculo": ["suggestion"]}`;
}

/**
 * Algorithmic fallback when the AI model fails to return valid JSON.
 * Uses keyword matching between job requirements and resume data.
 */
function computeAlgorithmicMatch(job: Vaga, resume: Resume | null) {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  // Extract job keywords from requirements and description
  const jobKeywords = [
    ...job.requisitos.map((r) => normalize(r.descricao)),
    ...normalize(job.descricao)
      .split(/\s+/)
      .filter((w) => w.length > 4),
    normalize(job.titulo),
  ];

  // Extract resume keywords
  const resumeKeywords = resume
    ? [
        ...resume.hardSkills.map(normalize),
        ...resume.softSkills.map(normalize),
        ...resume.cursosConcluidos.map((c) => normalize(c.nome)),
        ...resume.experiencias.map((e) => normalize(e.cargo)),
        ...resume.keywords.map(normalize),
      ]
    : [];

  // Count matches
  const matchedKeywords: string[] = [];
  const unmatchedReqs: string[] = [];

  for (const req of job.requisitos) {
    const reqNorm = normalize(req.descricao);
    const found = resumeKeywords.some(
      (rk) => rk.includes(reqNorm) || reqNorm.includes(rk),
    );
    if (found) {
      matchedKeywords.push(req.descricao);
    } else {
      unmatchedReqs.push(req.descricao);
    }
  }

  const totalReqs = job.requisitos.length || 1;
  const matchRatio = matchedKeywords.length / totalReqs;

  // Base score: 30 (having a profile) + up to 60 for keyword matches + up to 10 for courses
  let score = 30;
  score += Math.round(matchRatio * 60);
  if (resume && resume.cursosConcluidos.length > 0) {
    score += Math.min(10, resume.cursosConcluidos.length * 3);
  }
  if (!resume) score = 25; // Low score if no resume

  score = Math.min(98, Math.max(10, score));

  const recomendacao = score >= 75 ? 'forte' : score >= 50 ? 'medio' : 'fraco';

  return {
    _algorithmic: true,
    match_score: score,
    recomendacao,
    motivos_match: [
      ...(matchedKeywords.length > 0
        ? [
            `Possui ${matchedKeywords.length} de ${totalReqs} requisitos da vaga`,
          ]
        : []),
      ...(resume && resume.cursosConcluidos.length > 0
        ? [`Completou ${resume.cursosConcluidos.length} curso(s) relevante(s)`]
        : []),
      ...(resume && resume.experiencias.length > 0
        ? [
            `${resume.experiencias.length} experiência(s) profissional(is) registrada(s)`,
          ]
        : []),
    ],
    gaps: unmatchedReqs
      .slice(0, 3)
      .map((r) => `Requisito não encontrado: ${r}`),
    palavras_chave_identificadas: matchedKeywords.slice(0, 5),
    sugestoes_melhorar_curriculo: [
      'Mantenha seu perfil atualizado com habilidades e experiências recentes',
      ...(unmatchedReqs.length > 0
        ? [
            `Desenvolva competências em: ${unmatchedReqs.slice(0, 2).join(', ')}`,
          ]
        : []),
    ],
  };
}

'use client';

import { useState, useCallback, useRef } from 'react';
import { Resume, ExperienciaProfissional, Formacao } from '@/lib/api/types';
import { resumesService } from '@/lib/api/services/resumes.service';

export type ParserStatus =
  | 'idle'
  | 'extracting-text'
  | 'loading-model'
  | 'analyzing'
  | 'saving'
  | 'done'
  | 'error';

interface UseResumeParserReturn {
  status: ParserStatus;
  progress: string;
  parsedResume: Resume | null;
  parseResume: (file: File, userId: string) => Promise<void>;
}

/**
 * Hook to parse a PDF resume: extract text with pdf.js, then analyze
 * with WebLLM to produce structured resume data saved to Firestore.
 */
export function useResumeParser(): UseResumeParserReturn {
  const [status, setStatus] = useState<ParserStatus>('idle');
  const [progress, setProgress] = useState('');
  const [parsedResume, setParsedResume] = useState<Resume | null>(null);
  const engineRef = useRef<any>(null);

  const parseResume = useCallback(async (file: File, userId: string) => {
    try {
      // ---- Step 1: Extract text from PDF ----
      setStatus('extracting-text');
      setProgress('Extraindo texto do currículo...');

      const text = await extractPDFText(file);

      if (!text || text.trim().length < 50) {
        setStatus('error');
        setProgress(
          'Não foi possível extrair texto do PDF. Verifique se o arquivo não é uma imagem escaneada.',
        );
        return;
      }

      // ---- Step 2: Extract data using keyword matching (reliable) ----
      setStatus('analyzing');
      setProgress('Analisando conteúdo do currículo...');

      const resume = extractBasicResume(text, userId);

      // ---- Step 3: Try LLM enhancement if WebGPU is available ----
      if (typeof navigator !== 'undefined' && 'gpu' in navigator) {
        try {
          setProgress('Aprimorando análise com IA...');
          const webllm = await import('@mlc-ai/web-llm');
          const selectedModel = 'SmolLM2-360M-Instruct-q4f16_1-MLC';

          if (!engineRef.current) {
            setStatus('loading-model');
            const engine = await webllm.CreateMLCEngine(selectedModel, {
              initProgressCallback: (report: any) => {
                const pct = Math.round(report.progress * 100);
                setProgress(`Baixando modelo (${pct}%)...`);
              },
            });
            engineRef.current = engine;
            setStatus('analyzing');
          }

          setProgress('IA analisando seu currículo...');

          const prompt = `Analyze this resume and extract ONLY real data found in the text. Return JSON.

TEXT:
${text.slice(0, 2000)}

Return: {"skills": ["actual skill found"], "experiences": [{"role": "actual role", "company": "actual company"}], "education": [{"degree": "actual degree", "school": "actual school"}]}

IMPORTANT: Only include data that actually appears in the text above. Do NOT use placeholder values.`;

          const response = await engineRef.current.chat.completions.create({
            messages: [
              {
                role: 'system',
                content:
                  'Extract real data from the resume. Return ONLY valid JSON with actual values found in the text.',
              },
              { role: 'user', content: prompt },
            ],
            temperature: 0.1,
            max_tokens: 512,
          });

          const content = response.choices[0]?.message?.content || '';
          let parsed: any = null;

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

          // Validate: check that LLM didn't return template/placeholder values
          if (parsed && !isPlaceholderData(parsed)) {
            if (parsed.skills?.length) {
              const validSkills = parsed.skills.filter(
                (s: string) =>
                  s.length > 1 &&
                  !['skill1', 'skill', 'example'].includes(s.toLowerCase()),
              );
              if (validSkills.length > 0) {
                resume.hardSkills = [
                  ...new Set([...resume.hardSkills, ...validSkills]),
                ];
              }
            }
            if (parsed.experiences?.length) {
              const validExp = parsed.experiences.filter(
                (e: any) =>
                  e.role &&
                  !['title', 'cargo', 'role'].includes(e.role.toLowerCase()),
              );
              if (validExp.length > 0 && resume.experiencias.length === 0) {
                resume.experiencias = validExp.map((e: any) => ({
                  cargo: e.role || e.cargo || '',
                  empresa: e.company || e.empresa || '',
                  dataInicio: '',
                }));
              }
            }
            if (parsed.education?.length) {
              const validEdu = parsed.education.filter(
                (f: any) =>
                  f.degree &&
                  !['degree', 'curso'].includes(f.degree.toLowerCase()),
              );
              if (validEdu.length > 0 && resume.formacao.length === 0) {
                resume.formacao = validEdu.map((f: any) => ({
                  curso: f.degree || f.curso || '',
                  instituicao: f.school || f.instituicao || '',
                  conclusao: '',
                }));
              }
            }
          }
        } catch (e) {
          console.warn(
            'LLM enhancement failed, using keyword extraction only:',
            e,
          );
        }
      }

      // ---- Step 4: Save to Firestore ----
      setStatus('saving');
      setProgress('Salvando dados do currículo...');

      await resumesService.saveResume(userId, resume);
      setParsedResume(resume);
      setStatus('done');
      setProgress('Currículo processado e salvo com sucesso!');
    } catch (error: any) {
      console.error('Resume parse error:', error);
      setStatus('error');
      setProgress(error.message || 'Erro ao processar currículo');
    }
  }, []);

  return { status, progress, parsedResume, parseResume };
}

/**
 * Extract text from a PDF file using pdf.js in the browser.
 */
async function extractPDFText(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');

  // Point to worker via CDN
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((item: any) => item.str).join(' ');
    pages.push(text);
  }

  return pages.join('\n');
}

/**
 * Check if the LLM returned placeholder/template data.
 */
function isPlaceholderData(parsed: any): boolean {
  const placeholders = [
    'skill1',
    'skill',
    'title',
    'company',
    'degree',
    'school',
    'keyword1',
    'example',
    'actual skill found',
    'actual role',
    'actual company',
    'actual degree',
    'actual school',
  ];
  const check = (val: string) =>
    placeholders.includes(val.toLowerCase().trim());

  if (parsed.skills?.some(check)) return true;
  if (parsed.hard_skills?.some(check)) return true;
  if (
    parsed.experiences?.some(
      (e: any) => check(e.role || '') || check(e.company || ''),
    )
  )
    return true;
  if (
    parsed.education?.some(
      (e: any) => check(e.degree || '') || check(e.school || ''),
    )
  )
    return true;

  return false;
}

/**
 * Extract resume data using keyword matching and regex patterns.
 */
function extractBasicResume(text: string, userId: string): Resume {
  const lower = text.toLowerCase();

  // --- Tech skills ---
  const techSkills = [
    'javascript',
    'typescript',
    'python',
    'java',
    'c#',
    'c++',
    'go',
    'golang',
    'rust',
    'php',
    'ruby',
    'swift',
    'kotlin',
    'react',
    'angular',
    'vue',
    'vue.js',
    'next.js',
    'nextjs',
    'nuxt',
    'svelte',
    'node.js',
    'nodejs',
    'express',
    'nestjs',
    'fastify',
    'spring',
    'django',
    'flask',
    'laravel',
    'html',
    'css',
    'tailwind',
    'tailwindcss',
    'sass',
    'bootstrap',
    'styled-components',
    'sql',
    'postgresql',
    'postgres',
    'mysql',
    'mongodb',
    'redis',
    'firebase',
    'dynamodb',
    'elasticsearch',
    'docker',
    'kubernetes',
    'k8s',
    'aws',
    'azure',
    'gcp',
    'terraform',
    'ansible',
    'jenkins',
    'git',
    'github',
    'gitlab',
    'bitbucket',
    'ci/cd',
    'devops',
    'rest',
    'restful',
    'graphql',
    'grpc',
    'api',
    'microservices',
    'microsserviços',
    'figma',
    'photoshop',
    'illustrator',
    'ui/ux',
    'design system',
    'scrum',
    'agile',
    'kanban',
    'jira',
    'confluence',
    'linux',
    'ubuntu',
    'nginx',
    'apache',
    'machine learning',
    'deep learning',
    'data science',
    'pandas',
    'numpy',
    'tensorflow',
    'pytorch',
    'excel',
    'power bi',
    'tableau',
    'powerpoint',
    'kafka',
    'rabbitmq',
    'sqs',
    'sns',
    'clean architecture',
    'ddd',
    'domain-driven',
    'solid',
    'design patterns',
    'tdd',
    'bdd',
    'jest',
    'mocha',
    'cypress',
    'selenium',
    'observability',
    'monitoring',
    'grafana',
    'datadog',
    'new relic',
    'prometheus',
    'clean code',
    'mvc',
    'mvvm',
    'arquitetura',
    'oracle',
    'sap',
    'erp',
    'netlify',
    'vercel',
    'heroku',
    'cloudflare',
    'websocket',
    'socket.io',
    'webrtc',
    'redux',
    'zustand',
    'mobx',
    'rxjs',
    'prisma',
    'typeorm',
    'sequelize',
    'mongoose',
    'sass',
    'less',
    'material ui',
    'chakra',
    'reliability',
    'sre',
    'incident management',
  ];

  const softSkills = [
    'liderança',
    'comunicação',
    'trabalho em equipe',
    'proativo',
    'proatividade',
    'organização',
    'resolução de problemas',
    'criatividade',
    'inovação',
    'adaptabilidade',
    'gestão de tempo',
    'negociação',
    'empatia',
    'pensamento crítico',
    'colaboração',
    'mentoria',
    'autonomia',
    'leadership',
    'communication',
    'teamwork',
    'proactive',
    'problem solving',
    'creativity',
    'innovation',
    'collaboration',
  ];

  const foundTech = techSkills.filter((s) => lower.includes(s));
  const foundSoft = softSkills.filter((s) => lower.includes(s));

  // --- Experience extraction via patterns ---
  const experiencias: ExperienciaProfissional[] = [];

  const rolePatterns = [
    /(?:senior|sr\.?|pleno|júnior|jr\.?|lead|principal|staff|head)?\s*(?:engenheiro|desenvolvedor|analista|arquiteto|gerente|coordenador|diretor|tech lead|techlead|scrum master|product owner|devops|sre|backend|frontend|full[- ]?stack|software engineer|developer|engineer|manager)\s*(?:de\s+)?(?:software|sistemas|dados|ti|tecnologia|backend|frontend|full[- ]?stack|devops|sre|qa|qualidade)?/gi,
  ];

  for (const pattern of rolePatterns) {
    const matches = text.match(pattern);
    if (matches) {
      for (const m of matches) {
        const cleaned = m.trim();
        if (
          cleaned.length > 3 &&
          !experiencias.some((e) => e.cargo === cleaned)
        ) {
          experiencias.push({
            cargo: cleaned,
            empresa: '',
            dataInicio: '',
          });
        }
      }
    }
  }

  // --- Education extraction ---
  const formacao: Formacao[] = [];

  const eduPatterns = [
    /(?:bacharel(?:ado)?|licenciatura|tecnólogo|mestrado|doutorado|mba|pós[- ]?graduação|especialização|graduação)\s+(?:em\s+)?([^\n.;,]{3,50})/gi,
    /(?:ciência|engenharia|sistemas|análise|tecnologia|administração|gestão)\s+(?:da?\s+)?(?:computação|informação|informática|software|dados|sistemas)/gi,
  ];

  for (const pattern of eduPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      for (const m of matches) {
        const cleaned = m.trim();
        if (cleaned.length > 5 && !formacao.some((f) => f.curso === cleaned)) {
          formacao.push({ curso: cleaned, instituicao: '', conclusao: '' });
        }
      }
    }
  }

  // --- Keywords (frequent meaningful words) ---
  const stopWords = new Set([
    'sobre',
    'para',
    'como',
    'mais',
    'muito',
    'entre',
    'desde',
    'todos',
    'cada',
    'durante',
    'ainda',
    'também',
    'outro',
    'outros',
    'outras',
    'about',
    'with',
    'from',
    'that',
    'this',
    'have',
    'been',
    'will',
    'their',
    'would',
    'could',
    'which',
    'through',
    'under',
    'sendo',
    'dessa',
    'desse',
    'nesse',
    'nessa',
    'assim',
    'então',
    'porém',
    'contudo',
    'entretanto',
    'portanto',
    'quanto',
    'quando',
    'onde',
    'sempre',
    'nunca',
    'apenas',
    'somente',
    'porque',
    'pois',
  ]);

  const words = lower.match(/\b[a-záéíóúãõçê]{5,}\b/g) || [];
  const wordFreq = new Map<string, number>();
  for (const w of words) {
    if (!stopWords.has(w)) {
      wordFreq.set(w, (wordFreq.get(w) || 0) + 1);
    }
  }

  const keywords = [...wordFreq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([w]) => w);

  return {
    id: userId,
    hardSkills: foundTech,
    softSkills: foundSoft,
    experiencias,
    formacao,
    cursosConcluidos: [],
    keywords,
    updatedAt: new Date().toISOString(),
  };
}

'use client';

import { useCallback, useRef, useState } from 'react';
import { Resume } from '@/lib/api/types';
import { resumesService } from '@/lib/api/services/resumes.service';

export type SkillsUpdateStatus =
  | 'idle'
  | 'loading-model'
  | 'analyzing'
  | 'saving'
  | 'done'
  | 'error';

/**
 * Hook that uses WebLLM to analyze a completed course and update the resume with new competencies.
 */
export function useResumeSkillsUpdater() {
  const [status, setStatus] = useState<SkillsUpdateStatus>('idle');
  const [progress, setProgress] = useState('');
  const engineRef = useRef<any>(null);

  const updateSkillsFromCourse = useCallback(
    async (
      userId: string,
      courseTitle: string,
      courseDescription: string,
      courseModules: string[],
    ) => {
      try {
        setStatus('analyzing');
        setProgress('Analisando competências do curso...');

        // Build course context for analysis
        const courseContext = `
Curso: ${courseTitle}
Descrição: ${courseDescription}
Módulos: ${courseModules.join(', ')}
      `.trim();

        // First, extract skills using keyword matching (always reliable)
        const extractedSkills = extractSkillsFromCourse(
          courseTitle,
          courseDescription,
          courseModules,
        );

        // Try WebLLM enhancement
        if (typeof navigator !== 'undefined' && 'gpu' in navigator) {
          try {
            setStatus('loading-model');
            setProgress('Carregando IA para análise de competências...');

            const webllm = await import('@mlc-ai/web-llm');
            const selectedModel = 'SmolLM2-360M-Instruct-q4f16_1-MLC';

            if (!engineRef.current) {
              const engine = await webllm.CreateMLCEngine(selectedModel, {
                initProgressCallback: (report: any) => {
                  const pct = Math.round(report.progress * 100);
                  setProgress(`Baixando modelo (${pct}%)...`);
                },
              });
              engineRef.current = engine;
            }

            setStatus('analyzing');
            setProgress('IA analisando competências adquiridas...');

            const prompt = `Based on this completed course, list the specific technical skills and competencies the student has gained.

Course: ${courseTitle}
Description: ${courseDescription}
Modules: ${courseModules.slice(0, 10).join(', ')}

Return ONLY a JSON array of skill strings, e.g.: ["React", "State Management", "REST APIs"]
Return ONLY real skills related to this specific course. Do NOT return generic or placeholder values.`;

            const response = await engineRef.current.chat.completions.create({
              messages: [
                {
                  role: 'system',
                  content:
                    'Extract technical skills from the course. Return ONLY a JSON array of strings.',
                },
                { role: 'user', content: prompt },
              ],
              temperature: 0.1,
              max_tokens: 256,
            });

            const content = response.choices[0]?.message?.content || '';
            try {
              const parsed = JSON.parse(content);
              if (Array.isArray(parsed)) {
                const validSkills = parsed.filter(
                  (s: string) =>
                    typeof s === 'string' &&
                    s.length > 1 &&
                    !['skill', 'skill1', 'example', 'placeholder'].includes(
                      s.toLowerCase(),
                    ),
                );
                if (validSkills.length > 0) {
                  extractedSkills.push(...validSkills);
                }
              }
            } catch {
              // LLM didn't return valid JSON, use keyword extraction only
              const arrayMatch = content.match(/\[[\s\S]*\]/);
              if (arrayMatch) {
                try {
                  const parsed = JSON.parse(arrayMatch[0]);
                  if (Array.isArray(parsed)) {
                    const validSkills = parsed.filter(
                      (s: string) => typeof s === 'string' && s.length > 1,
                    );
                    extractedSkills.push(...validSkills);
                  }
                } catch {
                  /* ignore */
                }
              }
            }
          } catch (e) {
            console.warn(
              'WebLLM skills extraction failed, using keyword extraction:',
              e,
            );
          }
        }

        // Deduplicate skills
        const uniqueSkills = [
          ...new Set(extractedSkills.map((s) => s.toLowerCase())),
        ];

        if (uniqueSkills.length === 0) {
          setStatus('done');
          setProgress(
            'Curso concluído! Nenhuma nova competência identificada.',
          );
          return;
        }

        // Save to resume
        setStatus('saving');
        setProgress('Atualizando currículo com novas competências...');

        // Fetch existing resume and merge
        let existingResume: Resume | null = null;
        try {
          existingResume = await resumesService.getResume(userId);
        } catch {
          // No existing resume, create new
        }

        const updatedResume: Resume = {
          id: userId,
          hardSkills: [
            ...new Set([
              ...(existingResume?.hardSkills || []),
              ...uniqueSkills,
            ]),
          ],
          softSkills: existingResume?.softSkills || [],
          experiencias: existingResume?.experiencias || [],
          formacao: existingResume?.formacao || [],
          cursosConcluidos: existingResume?.cursosConcluidos || [],
          keywords: [
            ...new Set([
              ...(existingResume?.keywords || []),
              ...uniqueSkills.slice(0, 5),
            ]),
          ],
          updatedAt: new Date().toISOString(),
        };

        await resumesService.saveResume(userId, updatedResume);

        setStatus('done');
        setProgress(
          `Currículo atualizado com ${uniqueSkills.length} competências!`,
        );
      } catch (error: any) {
        console.error('Skills update error:', error);
        setStatus('error');
        setProgress(error.message || 'Erro ao atualizar competências');
      }
    },
    [],
  );

  return { status, progress, updateSkillsFromCourse };
}

/**
 * Extract skills from course metadata using keyword matching.
 */
function extractSkillsFromCourse(
  title: string,
  description: string,
  modules: string[],
): string[] {
  const text = `${title} ${description} ${modules.join(' ')}`.toLowerCase();

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
    'ci/cd',
    'devops',
    'rest',
    'restful',
    'graphql',
    'grpc',
    'api',
    'microservices',
    'figma',
    'ui/ux',
    'design system',
    'scrum',
    'agile',
    'kanban',
    'linux',
    'nginx',
    'apache',
    'machine learning',
    'deep learning',
    'data science',
    'pandas',
    'numpy',
    'tensorflow',
    'pytorch',
    'kafka',
    'rabbitmq',
    'clean architecture',
    'ddd',
    'solid',
    'design patterns',
    'tdd',
    'jest',
    'cypress',
    'selenium',
    'observability',
    'monitoring',
    'grafana',
    'prometheus',
    'websocket',
    'socket.io',
    'redux',
    'zustand',
    'rxjs',
    'prisma',
    'typeorm',
    'sequelize',
    'mongoose',
    'excel',
    'power bi',
    'tableau',
    'sre',
    'reliability',
  ];

  return techSkills.filter((s) => text.includes(s));
}

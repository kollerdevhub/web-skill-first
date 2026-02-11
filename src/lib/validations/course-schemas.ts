import { z } from 'zod';

// ============================================================================
// Course Schema
// ============================================================================

export const courseSchema = z.object({
  titulo: z
    .string()
    .min(3, 'O título deve ter pelo menos 3 caracteres')
    .max(120, 'O título deve ter no máximo 120 caracteres'),
  descricao: z
    .string()
    .min(10, 'A descrição deve ter pelo menos 10 caracteres'),
  categoria: z.enum(
    ['tecnico', 'comportamental', 'idiomas', 'gestao', 'outros'],
    {
      message: 'Selecione uma categoria',
    },
  ),
  nivel: z.enum(['basico', 'intermediario', 'avancado'], {
    message: 'Selecione um nível',
  }),
  cargaHoraria: z
    .number({ message: 'Informe a carga horária' })
    .min(1, 'A carga horária deve ser pelo menos 1 hora'),
  slug: z.string().optional(),
  language: z.string().optional(),
  tags: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published']).optional(),
});

export type CourseFormValues = z.infer<typeof courseSchema>;

// ============================================================================
// Module (Section) Schema
// ============================================================================

export const moduleSchema = z.object({
  titulo: z
    .string()
    .min(2, 'O título do módulo deve ter pelo menos 2 caracteres')
    .max(100, 'O título deve ter no máximo 100 caracteres'),
  ordem: z
    .number({ message: 'Informe a ordem' })
    .int('A ordem deve ser um número inteiro')
    .min(1, 'A ordem deve ser pelo menos 1'),
});

export type ModuleFormValues = z.infer<typeof moduleSchema>;

// ============================================================================
// Lesson Schema
// ============================================================================

export const lessonSchema = z.object({
  sectionTitle: z
    .string()
    .min(2, 'O nome do módulo deve ter pelo menos 2 caracteres'),
  titulo: z
    .string()
    .min(2, 'O título da aula deve ter pelo menos 2 caracteres')
    .max(150, 'O título deve ter no máximo 150 caracteres'),
  descricao: z.string().optional(),
  tipoConteudo: z.enum(['video', 'texto', 'quiz', 'avaliacao'], {
    message: 'Selecione o tipo de conteúdo',
  }),
  ordem: z
    .number({ message: 'Informe a ordem' })
    .int()
    .min(1, 'A ordem deve ser pelo menos 1'),
  duracaoEstimada: z
    .number()
    .min(0, 'A duração não pode ser negativa')
    .optional(),
  conteudoTexto: z.string().optional(),
  obrigatorio: z.boolean().optional().default(true),
});

export type LessonFormValues = z.infer<typeof lessonSchema>;

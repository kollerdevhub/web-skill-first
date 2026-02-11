// ====================
// Common Types
// ====================

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

// ====================
// Auth Types
// ====================

export type UserRole = 'candidato' | 'recrutador' | 'gestor' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

// ====================
// Address Types
// ====================

export interface Endereco {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

// ====================
// Candidato (Candidate) Types
// ====================

export interface ExperienciaProfissional {
  empresa: string;
  cargo: string;
  dataInicio: string;
  dataFim?: string;
  descricao?: string;
}

export interface Formacao {
  curso: string;
  instituicao: string;
  conclusao: string;
}

export interface CursoConcluido {
  nome: string;
  instituicao: string;
  cargaHoraria: number;
  dataConclusao: string;
}

export interface Resume {
  id: string; // Same as userId
  hardSkills: string[];
  softSkills: string[];
  experiencias: ExperienciaProfissional[];
  formacao: Formacao[];
  cursosConcluidos: CursoConcluido[];
  keywords: string[];
  updatedAt: string;
}

export interface MatchResult {
  id?: string; // composite uid_jobId
  uid: string;
  jobId: string;
  matchScore: number;
  recomendacao: 'forte' | 'medio' | 'fraco';
  motivosMatch: string[];
  gaps: string[];
  palavrasChaveIdentificadas: string[];
  sugestoesMelhorarCurriculo: string[];
  model?: string;
  updatedAt: string;
}

export interface Candidato {
  id: string;
  userId: string;
  nome: string;
  cpf: string;
  telefone: string;
  dataNascimento: string;
  endereco: Endereco;
  experienciaProfissional: ExperienciaProfissional[];
  habilidades: string[];
  curriculoUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCandidatoDTO {
  nome: string;
  cpf: string;
  telefone: string;
  dataNascimento: string;
  endereco: Endereco;
  experienciaProfissional?: ExperienciaProfissional[];
  habilidades?: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
}

export type UpdateCandidatoDTO = Partial<CreateCandidatoDTO>;

// ====================
// Empresa (Company) Types
// ====================

export interface Empresa {
  id: string;
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco?: Endereco;
  logoUrl?: string;
  descricao?: string;
  ativa: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateEmpresaDTO {
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco?: Endereco;
  descricao?: string;
}

export type UpdateEmpresaDTO = Partial<CreateEmpresaDTO>;

export interface EmpresaVagasCount {
  ativas: number;
  total: number;
}

// ====================
// Vaga (Job) Types
// ====================

export type VagaStatus =
  | 'rascunho'
  | 'aberta'
  | 'pausada'
  | 'fechada'
  | 'cancelada';
export type TipoContrato = 'clt' | 'pj' | 'estagio' | 'temporario';
export type Modalidade = 'presencial' | 'remoto' | 'hibrido';

export interface Requisito {
  tipo: 'obrigatorio' | 'desejavel';
  descricao: string;
}

export interface EmpresaResumida {
  id: string;
  nome: string;
  logoUrl?: string;
}

export interface Vaga {
  id: string;
  empresaId?: string;
  empresaNome?: string;
  empresa?: EmpresaResumida;
  titulo: string;
  descricao: string;
  requisitos: Requisito[];
  localizacao: string;
  tipoContrato: TipoContrato;
  modalidade: Modalidade;
  salarioMin?: number;
  salarioMax?: number;
  beneficios: string[];
  status: VagaStatus;
  testeObrigatorio: boolean;
  dataPublicacao?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateVagaDTO {
  empresaId?: string;
  empresaNome?: string;
  titulo: string;
  descricao: string;
  requisitos: Requisito[];
  localizacao: string;
  tipoContrato: TipoContrato;
  modalidade: Modalidade;
  salarioMin?: number;
  salarioMax?: number;
  beneficios?: string[];
  testeObrigatorio?: boolean;
}

export type UpdateVagaDTO = Partial<CreateVagaDTO>;

export interface VagaSearchParams {
  page?: number;
  limit?: number;
  keyword?: string;
  localizacao?: string;
  tipoContrato?: TipoContrato;
  modalidade?: Modalidade;
  salarioMin?: number;
  status?: VagaStatus;
}

export interface VagaCandidaturasCount {
  total: number;
  byStatus: {
    pendente: number;
    em_analise: number;
    aprovado_triagem: number;
    entrevista: number;
    aprovado?: number;
    reprovado?: number;
  };
}

// ====================
// Candidatura (Application) Types
// ====================

export type CandidaturaStatus =
  | 'pendente'
  | 'em_analise'
  | 'aprovado_triagem'
  | 'entrevista'
  | 'aprovado'
  | 'reprovado';

export interface VagaResumida {
  id: string;
  titulo: string;
  empresa: { nome: string; logoUrl?: string };
  localizacao?: string;
}

export interface Candidatura {
  id: string;
  vagaId: string;
  vaga?: VagaResumida;
  candidatoId?: string;
  candidato?: Candidato;
  dataInscricao: string;
  pontuacaoCompatibilidade?: number;
  pontuacaoTeste?: number;
  pontuacaoFinal?: number;
  status: CandidaturaStatus;
  feedbackEnviado: boolean;
  feedbackMensagem?: string;
  notasRecrutador?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateCandidaturaStatusDTO {
  status: CandidaturaStatus;
  notasRecrutador?: string;
}

export interface ConvidarEntrevistaDTO {
  dataEntrevista: string;
  local: string;
  mensagem?: string;
}

export interface ConvidarEntrevistaResponse {
  enviado: boolean;
  canal: 'whatsapp' | 'email';
  mensagem: string;
}

// ====================
// Teste (Test/Assessment) Types
// ====================

export interface Alternativa {
  letra: string;
  texto: string;
}

export interface QuestaoTeste {
  enunciado: string;
  alternativas: Alternativa[];
  respostaCorreta?: string; // Only visible to recruiters
  pontos?: number;
}

export interface Teste {
  id: string;
  vagaId: string;
  titulo: string;
  descricao?: string;
  tempoLimiteMinutos: number;
  notaMinima: number;
  questoes: QuestaoTeste[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTesteDTO {
  vagaId: string;
  titulo: string;
  descricao?: string;
  tempoLimiteMinutos: number;
  notaMinima: number;
  questoes: QuestaoTeste[];
}

export type UpdateTesteDTO = Partial<Omit<CreateTesteDTO, 'vagaId'>>;

export interface RespostaTeste {
  questaoIndex: number;
  resposta: string;
}

export interface SubmeterTesteDTO {
  testeId: string;
  candidaturaId: string;
  respostas: RespostaTeste[];
}

export interface SubmeterTesteResponse {
  nota: number;
  aprovado: boolean;
  totalQuestoes: number;
  totalAcertos: number;
}

// ====================
// Curso (Course) Types
// ====================

export type CursoCategoria =
  | 'tecnico'
  | 'comportamental'
  | 'idiomas'
  | 'gestao'
  | 'outros';
export type CursoNivel = 'basico' | 'intermediario' | 'avancado';
export type TipoConteudo = 'video' | 'texto' | 'quiz' | 'avaliacao';
export type InscricaoStatus = 'em_andamento' | 'concluido' | 'cancelado';

export interface Attachment {
  name: string;
  url: string;
  type?: string;
  size?: number;
  kind?: 'code' | 'pdf' | 'zip' | 'subtitle' | 'transcript' | 'other';
  language?: string;
}

export interface Curso {
  id: string;
  titulo: string;
  descricao: string;
  categoria: CursoCategoria;
  nivel: CursoNivel;
  cargaHoraria: number;
  thumbnailUrl?: string;
  habilidadesDesenvolvidas: string[];
  requisitosPrevios?: string;
  destaque: boolean;
  ativo: boolean;
  totalModulos?: number;
  totalInscritos?: number;
  dataPublicacao?: string;
  createdAt: string;
  updatedAt?: string;
  // extended fields
  slug?: string | null;
  status?: 'draft' | 'published';
  releaseDate?: string | null;
  language?: string | null;
  author?: string | null;
  tags?: string[];
  prerequisites?: string[];
  seoDescription?: string | null;
  heroVideoUrl?: string | null;
  attachments?: Attachment[];
}

export interface CreateCursoDTO {
  titulo: string;
  descricao: string;
  categoria: CursoCategoria;
  nivel: CursoNivel;
  cargaHoraria: number;
  habilidadesDesenvolvidas?: string[];
  requisitosPrevios?: string;
  destaque?: boolean;
  slug?: string;
  status?: 'draft' | 'published';
  releaseDate?: string | null;
  language?: string | null;
  author?: string | null;
  tags?: string[];
  prerequisites?: string[];
  seoDescription?: string | null;
  heroVideoUrl?: string | null;
  attachments?: Attachment[];
}

export type UpdateCursoDTO = Partial<CreateCursoDTO>;

export interface CursoSearchParams {
  page?: number;
  limit?: number;
  q?: string;
  keyword?: string;
  categoria?: CursoCategoria;
  nivel?: CursoNivel;
}

export interface CursoEstatisticas {
  totalInscritos: number;
  concluidos: number;
  emAndamento: number;
  mediaNotas: number;
}

// ====================
// Modulo (Module) Types
// ====================

export interface QuestaoQuiz {
  enunciado: string;
  alternativas: Alternativa[];
  respostaCorreta: string;
}

export interface Modulo {
  id: string;
  cursoId: string;
  titulo: string;
  descricao?: string;
  ordem: number;
  tipoConteudo: TipoConteudo;
  videoUrl?: string;
  videoDuracao?: number;
  videoPublicId?: string;
  conteudoTexto?: string;
  duracaoEstimada?: number;
  ativo: boolean;
  obrigatorio: boolean;
  questoesQuiz?: QuestaoQuiz[];
  createdAt: string;
  updatedAt?: string;
  attachments?: Attachment[];
  resources?: { label: string; url: string }[];
  transcriptUrl?: string | null;
  subtitleUrl?: string | null;
}

export interface CreateModuloDTO {
  titulo: string;
  descricao?: string;
  ordem: number;
  tipoConteudo: TipoConteudo;
  conteudoTexto?: string;
  duracaoEstimada?: number;
  obrigatorio?: boolean;
  questoesQuiz?: QuestaoQuiz[];
  attachments?: Attachment[];
  resources?: { label: string; url: string }[];
  transcriptUrl?: string | null;
  subtitleUrl?: string | null;
  videoUrl?: string | null;
  videoPublicId?: string | null;
}

export type UpdateModuloDTO = Partial<CreateModuloDTO>;

// ====================
// Inscricao (Enrollment) Types
// ====================

export interface CursoResumido {
  id: string;
  titulo: string;
  thumbnailUrl?: string;
  totalModulos?: number;
  categoria?: string;
  cargaHoraria?: number;
}

export interface ModuloProgresso {
  moduloId: string;
  concluido: boolean;
  dataInicio?: string;
  dataConclusao?: string;
  tempoAssistido?: number;
  tentativasQuiz?: number;
  notaQuiz?: number;
}

export interface Inscricao {
  id: string;
  candidatoId: string;
  cursoId: string;
  curso?: CursoResumido;
  status: InscricaoStatus;
  dataInscricao: string;
  dataConclusao?: string;
  progressoPercentual: number;
  ultimoModuloAcessado?: string;
  ultimoAcesso?: string;
  notaAvaliacaoFinal?: number;
  certificadoEmitido: boolean;
  modulosProgresso?: ModuloProgresso[];
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateProgressoDTO {
  moduloId: string;
  concluido: boolean;
  tempoAssistido?: number;
}

export interface SubmitQuizDTO {
  moduloId: string;
  respostas: RespostaTeste[];
}

export interface SubmitQuizResponse {
  nota: number;
  aprovado: boolean;
  totalQuestoes?: number;
  totalAcertos?: number;
}

// ====================
// Certificado (Certificate) Types
// ====================

export interface CertificadoCurso {
  id: string;
  titulo: string;
  categoria: CursoCategoria;
  nivel: CursoNivel;
}

export interface CertificadoCandidato {
  id: string;
  nome: string;
}

export interface Certificado {
  id: string;
  codigo: string;
  candidatoId: string;
  cursoId: string;
  curso?: CertificadoCurso;
  candidato?: CertificadoCandidato;
  dataEmissao: string;
  dataValidade?: string;
  cargaHoraria: number;
  notaFinal?: number;
  pdfUrl?: string;
  validationUrl?: string;
  ativo: boolean;
  createdAt: string;
}

export interface ValidateCertificadoResponse {
  valido: boolean;
  certificado?: Certificado;
  mensagem?: string;
}

// ====================
// Home Types
// ====================

export interface VagaDestaque {
  id: string;
  titulo: string;
  empresa: EmpresaResumida;
  localizacao: string;
  modalidade: Modalidade;
  tipoContrato: TipoContrato;
}

export interface CursoPopular {
  id: string;
  titulo: string;
  categoria: CursoCategoria;
  nivel: CursoNivel;
  thumbnailUrl?: string;
  totalInscritos: number;
}

export interface HomeEstatisticas {
  totalVagas: number;
  totalCursos: number;
  totalCandidatos: number;
}

export interface HomeData {
  vagasDestaque: VagaDestaque[];
  cursosPopulares: CursoPopular[];
  estatisticas: HomeEstatisticas;
}

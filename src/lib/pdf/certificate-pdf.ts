interface CertificatePdfData {
  codigo: string;
  studentName: string;
  courseTitle: string;
  issuedAt: string;
  workloadHours: number;
  validationUrl?: string;
}

const PAGE_WIDTH = 842;
const PAGE_HEIGHT = 595;

function stripDiacritics(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function toAscii(value: string): string {
  return stripDiacritics(value).replace(/[^\x20-\x7E]/g, ' ');
}

function escapePdfText(value: string): string {
  return toAscii(value)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function formatIssuedDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '-';
  return toAscii(
    date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
  );
}

type PdfFont = 'F1' | 'F2';

function estimateTextWidth(text: string, size: number, font: PdfFont): number {
  const weight = font === 'F2' ? 0.56 : 0.52;
  return text.length * size * weight;
}

function breakToken(
  token: string,
  maxWidth: number,
  size: number,
  font: PdfFont,
): string[] {
  if (estimateTextWidth(token, size, font) <= maxWidth) {
    return [token];
  }

  const chunks: string[] = [];
  let current = '';

  for (const char of token) {
    const next = `${current}${char}`;
    if (!current || estimateTextWidth(next, size, font) <= maxWidth) {
      current = next;
      continue;
    }
    chunks.push(current);
    current = char;
  }

  if (current) chunks.push(current);
  return chunks;
}

function wrapText(
  text: string,
  maxWidth: number,
  size: number,
  font: PdfFont,
): string[] {
  const safe = toAscii(text).trim();
  if (!safe) return ['-'];

  const tokens = safe.split(/\s+/).flatMap((token) => {
    return breakToken(token, maxWidth, size, font);
  });

  const lines: string[] = [];
  let current = '';

  for (const token of tokens) {
    const candidate = current ? `${current} ${token}` : token;
    if (!current || estimateTextWidth(candidate, size, font) <= maxWidth) {
      current = candidate;
      continue;
    }
    lines.push(current);
    current = token;
  }

  if (current) lines.push(current);
  return lines;
}

function formatHours(value: number): string {
  if (!Number.isFinite(value)) return '0 hora';
  if (value === 1) return '1 hora';
  return `${value} horas`;
}

function asColor(values: [number, number, number]): string {
  return values.map((value) => value.toFixed(3)).join(' ');
}

function textCommand(args: {
  text: string;
  x: number;
  y: number;
  size: number;
  font: PdfFont;
  color: [number, number, number];
}): string {
  const { text, x, y, size, font, color } = args;
  return [
    `${asColor(color)} rg`,
    'BT',
    `/${font} ${size} Tf`,
    `1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm`,
    `(${escapePdfText(text)}) Tj`,
    'ET',
  ].join('\n');
}

function centeredTextCommand(args: {
  text: string;
  y: number;
  size: number;
  font: PdfFont;
  color: [number, number, number];
}): string {
  const { text, y, size, font, color } = args;
  const x = (PAGE_WIDTH - estimateTextWidth(text, size, font)) / 2;
  return textCommand({ text, x, y, size, font, color });
}

function filledRectCommand(
  x: number,
  y: number,
  width: number,
  height: number,
  color: [number, number, number],
): string {
  return [`${asColor(color)} rg`, `${x} ${y} ${width} ${height} re`, 'f'].join(
    '\n',
  );
}

function strokedRectCommand(
  x: number,
  y: number,
  width: number,
  height: number,
  color: [number, number, number],
  lineWidth: number,
): string {
  return [
    `${asColor(color)} RG`,
    `${lineWidth.toFixed(2)} w`,
    `${x} ${y} ${width} ${height} re`,
    'S',
  ].join('\n');
}

function strokedLineCommand(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: [number, number, number],
  lineWidth: number,
): string {
  return [
    `${asColor(color)} RG`,
    `${lineWidth.toFixed(2)} w`,
    `${x1.toFixed(2)} ${y1.toFixed(2)} m`,
    `${x2.toFixed(2)} ${y2.toFixed(2)} l`,
    'S',
  ].join('\n');
}

function buildCertificatePdf(data: CertificatePdfData): string {
  const studentName = toAscii(data.studentName || 'Aluno');
  const courseTitle = toAscii(data.courseTitle || 'Curso');
  const issueDate = formatIssuedDate(data.issuedAt);
  const workload = formatHours(data.workloadHours || 0);
  const code = toAscii(data.codigo || '-');
  const validationUrl = toAscii(data.validationUrl || 'Nao disponivel');

  const content: string[] = [];

  // Background + decorative bars
  content.push(filledRectCommand(0, 0, PAGE_WIDTH, PAGE_HEIGHT, [0.968, 0.976, 0.996]));
  content.push(filledRectCommand(0, PAGE_HEIGHT - 118, PAGE_WIDTH, 118, [0.098, 0.204, 0.475]));
  content.push(filledRectCommand(0, 0, PAGE_WIDTH, 26, [0.925, 0.792, 0.302]));

  // Certificate frame
  content.push(strokedRectCommand(24, 24, PAGE_WIDTH - 48, PAGE_HEIGHT - 48, [0.122, 0.267, 0.600], 2.8));
  content.push(strokedRectCommand(34, 34, PAGE_WIDTH - 68, PAGE_HEIGHT - 68, [0.824, 0.667, 0.220], 1.1));

  // Header
  content.push(
    centeredTextCommand({
      text: 'CERTIFICADO DE CONCLUSAO',
      y: 520,
      size: 32,
      font: 'F2',
      color: [1, 1, 1],
    }),
  );
  content.push(
    centeredTextCommand({
      text: 'WEB SKILL FIRST EDUCATION',
      y: 494,
      size: 12,
      font: 'F1',
      color: [0.886, 0.914, 0.996],
    }),
  );

  // Student and course
  content.push(
    centeredTextCommand({
      text: 'Certificamos que',
      y: 445,
      size: 16,
      font: 'F1',
      color: [0.286, 0.325, 0.400],
    }),
  );

  const nameLines = wrapText(studentName, 620, 42, 'F2').slice(0, 2);
  const nameStartY = 395 + (nameLines.length - 1) * 22;
  nameLines.forEach((line, index) => {
    content.push(
      centeredTextCommand({
        text: line,
        y: nameStartY - index * 50,
        size: 42,
        font: 'F2',
        color: [0.059, 0.180, 0.459],
      }),
    );
  });

  const dividerY = nameStartY - nameLines.length * 50 + 18;
  content.push(strokedLineCommand(140, dividerY, PAGE_WIDTH - 140, dividerY, [0.780, 0.831, 0.961], 1.6));

  content.push(
    centeredTextCommand({
      text: 'concluiu com exito o curso',
      y: dividerY - 36,
      size: 15,
      font: 'F1',
      color: [0.286, 0.325, 0.400],
    }),
  );

  const courseLines = wrapText(courseTitle.toUpperCase(), 640, 25, 'F2').slice(0, 2);
  const courseStartY = dividerY - 72 + (courseLines.length - 1) * 15;
  courseLines.forEach((line, index) => {
    content.push(
      centeredTextCommand({
        text: line,
        y: courseStartY - index * 32,
        size: 25,
        font: 'F2',
        color: [0.843, 0.631, 0.161],
      }),
    );
  });

  // Metadata cards
  const cardY = 118;
  const cardHeight = 74;
  const cardGap = 16;
  const cardWidth = (PAGE_WIDTH - 120 - cardGap * 2) / 3;
  const cardX1 = 60;
  const cardX2 = cardX1 + cardWidth + cardGap;
  const cardX3 = cardX2 + cardWidth + cardGap;

  [
    { x: cardX1, title: 'CARGA HORARIA', value: workload },
    { x: cardX2, title: 'EMISSAO', value: issueDate },
    { x: cardX3, title: 'CODIGO', value: code },
  ].forEach((card) => {
    content.push(filledRectCommand(card.x, cardY, cardWidth, cardHeight, [1, 1, 1]));
    content.push(strokedRectCommand(card.x, cardY, cardWidth, cardHeight, [0.824, 0.843, 0.886], 1));
    content.push(
      textCommand({
        text: card.title,
        x: card.x + 16,
        y: cardY + 50,
        size: 10,
        font: 'F1',
        color: [0.435, 0.486, 0.569],
      }),
    );
    content.push(
      textCommand({
        text: card.value,
        x: card.x + 16,
        y: cardY + 25,
        size: 15,
        font: 'F2',
        color: [0.059, 0.180, 0.459],
      }),
    );
  });

  // Validation
  content.push(
    centeredTextCommand({
      text: 'Validacao online',
      y: 82,
      size: 10,
      font: 'F1',
      color: [0.404, 0.447, 0.525],
    }),
  );

  const validationLines = wrapText(validationUrl, PAGE_WIDTH - 120, 9, 'F1').slice(0, 2);
  validationLines.forEach((line, index) => {
    content.push(
      centeredTextCommand({
        text: line,
        y: 67 - index * 12,
        size: 9,
        font: 'F1',
        color: [0.200, 0.243, 0.322],
      }),
    );
  });

  // Signatures
  content.push(strokedLineCommand(94, 50, 314, 50, [0.675, 0.718, 0.796], 1));
  content.push(strokedLineCommand(PAGE_WIDTH - 314, 50, PAGE_WIDTH - 94, 50, [0.675, 0.718, 0.796], 1));
  content.push(
    textCommand({
      text: 'Web Skill First',
      x: 157,
      y: 36,
      size: 10,
      font: 'F2',
      color: [0.349, 0.396, 0.486],
    }),
  );
  content.push(
    textCommand({
      text: 'Diretoria Academica',
      x: PAGE_WIDTH - 271,
      y: 36,
      size: 10,
      font: 'F2',
      color: [0.349, 0.396, 0.486],
    }),
  );

  const objects = [
    {
      id: 1,
      body: '<< /Type /Catalog /Pages 2 0 R >>',
    },
    {
      id: 2,
      body: '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    },
    {
      id: 3,
      body:
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 4 0 R /F2 6 0 R >> >> /Contents 5 0 R >>`,
    },
    {
      id: 4,
      body: '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    },
    {
      id: 5,
      body: `<< /Length ${new TextEncoder().encode(content.join('\n')).length} >>\nstream\n${content.join('\n')}\nendstream`,
    },
    {
      id: 6,
      body: '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    },
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: Record<number, number> = {};

  for (const object of objects) {
    offsets[object.id] = pdf.length;
    pdf += `${object.id} 0 obj\n${object.body}\nendobj\n`;
  }

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';

  for (const object of objects) {
    pdf += `${String(offsets[object.id]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return pdf;
}

function sanitizeFileNamePart(value: string): string {
  return toAscii(value)
    .trim()
    .replace(/[^a-zA-Z0-9-_ ]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

export function downloadCertificatePdf(data: CertificatePdfData): void {
  const pdf = buildCertificatePdf(data);
  const blob = new Blob([pdf], { type: 'application/pdf' });
  const fileName = `certificado-${sanitizeFileNamePart(data.studentName || 'aluno')}-${sanitizeFileNamePart(data.courseTitle || 'curso')}.pdf`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

#!/usr/bin/env bash
set -euo pipefail

# Lightweight seeder for the local API (http://localhost:3000/api/v1)
# Creates sample courses and modules so you can browse/inscrever no front.
# Assumes the backend is running locally and uses the shared JWT secret from .env.

API_URL="${API_URL:-http://localhost:3000/api/v1}"
JWT_SECRET="${JWT_SECRET:-S0B2HqLuUXQYeiv9bFfamjgAn3KoRzFgB23XpTcRBPQ}"

timestamp() { date -u +"%Y-%m-%dT%H:%M:%SZ"; }

generate_token() {
  node - <<'NODE'
    const crypto = require('crypto');
    const secret = process.env.JWT_SECRET;
    const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
    const now = Math.floor(Date.now() / 1000);
    const header = b64({ alg: 'HS256', typ: 'JWT' });
    const payload = b64({
      sub: 'debug-admin',
      email: 'debug-admin@example.com',
      role: 'admin',
      iat: now,
      exp: now + 3600,
    });
    const sig = crypto
      .createHmac('sha256', secret)
      .update(header + '.' + payload)
      .digest('base64url');
    console.log(`${header}.${payload}.${sig}`);
NODE
}

TOKEN="$(JWT_SECRET="$JWT_SECRET" generate_token)"
AUTH_HEADER="Authorization: Bearer $TOKEN"

post_course() {
  local title="$1"
  local desc="$2"
  local categoria="$3"
  local nivel="$4"
  local carga="$5"
  jq -n \
    --arg titulo "$title" \
    --arg descricao "$desc" \
    --arg categoria "$categoria" \
    --arg nivel "$nivel" \
    --arg thumbnail "https://picsum.photos/seed/${title// /-}/800/450" \
    --argjson carga "$carga" \
    '{
      titulo: $titulo,
      descricao: $descricao,
      categoria: $categoria,
      nivel: $nivel,
      cargaHoraria: $carga,
      destaque: false,
      thumbnailUrl: $thumbnail
    }' |
    curl -sS -X POST "$API_URL/cursos" \
      -H "Content-Type: application/json" \
      -H "$AUTH_HEADER" \
      --data-binary @-
}

post_modulo() {
  local course_id="$1"
  local ordem="$2"
  local titulo="$3"
  local tipo="$4"
  local dur="$5"
  local video="$6"
  local texto="$7"
  jq -n \
    --arg cursoId "$course_id" \
    --arg titulo "$titulo" \
    --arg desc "Módulo $ordem de $titulo" \
    --arg tipo "$tipo" \
    --arg videoUrl "$video" \
    --arg texto "$texto" \
    --argjson ordem "$ordem" \
    --argjson dur "$dur" \
    '{
      cursoId: $cursoId,
      titulo: $titulo,
      descricao: $desc,
      ordem: $ordem,
      tipoConteudo: $tipo,
      videoUrl: ($videoUrl | select(. != "")),
      conteudoTexto: ($texto | select(. != "")),
      duracaoEstimada: $dur,
      obrigatorio: true
    }' |
    curl -sS -X POST "$API_URL/cursos/$course_id/modulos" \
      -H "Content-Type: application/json" \
      -H "$AUTH_HEADER" \
      --data-binary @-
}

echo "Usando API_URL=$API_URL"
echo "Gerando token admin curto-lived..."
echo "${TOKEN:0:20}..."

echo "Criando cursos demo..."
COURSE1=$(post_course "Intro Kubernetes" "Fundamentos e prática para operar clusters e fazer deploy com confiança." "tecnico" "basico" 1 | jq -r '.id // .data.id // empty')
COURSE2=$(post_course "React + TypeScript" "Construindo SPA performáticas com React 19 e TypeScript." "tecnico" "intermediario" 2 | jq -r '.id // .data.id // empty')
COURSE3=$(post_course "DevOps CI/CD" "Pipelines, Docker e observabilidade focados em times ágeis." "tecnico" "avancado" 3 | jq -r '.id // .data.id // empty')

if [ -z "$COURSE1$COURSE2$COURSE3" ]; then
  echo "Falha ao criar cursos. Respostas acima." >&2
  exit 1
fi

echo "Cursos criados: $COURSE1 $COURSE2 $COURSE3"

echo "Criando módulos..."
post_modulo "$COURSE1" 1 "Módulo 1 :: O que é Kubernetes" "video" 12 "https://res.cloudinary.com/demo/video/upload/dog.mp4" ""
post_modulo "$COURSE1" 2 "Módulo 1 :: Deploy de API" "video" 14 "https://res.cloudinary.com/demo/video/upload/video_demo.mp4" ""
post_modulo "$COURSE1" 3 "Módulo 1 :: Checklist de produção" "texto" 8 "" "Checklist de produção, namespaces, quotas e health checks."

post_modulo "$COURSE2" 1 "Módulo 1 :: Fundamentos React 19" "video" 10 "https://res.cloudinary.com/demo/video/upload/v1689697988/samples/cld-sample-video.mp4" ""
post_modulo "$COURSE2" 2 "Módulo 1 :: Hooks e Estado" "texto" 7 "" "Exemplos de useState, useEffect e padrões de dados."
post_modulo "$COURSE2" 3 "Módulo 2 :: Formulários + React Query" "video" 11 "https://res.cloudinary.com/demo/video/upload/video_demo.mp4" ""

post_modulo "$COURSE3" 1 "Módulo 1 :: Pipelines CI" "texto" 9 "" "Estrutura de pipelines YAML, gates e approvals."
post_modulo "$COURSE3" 2 "Módulo 1 :: Docker avançado" "video" 13 "https://res.cloudinary.com/demo/video/upload/dog.mp4" ""
post_modulo "$COURSE3" 3 "Módulo 2 :: Monitoring 101" "texto" 8 "" "KPIs, SLIs, SLOs e alertas úteis."

echo "Seed concluído."

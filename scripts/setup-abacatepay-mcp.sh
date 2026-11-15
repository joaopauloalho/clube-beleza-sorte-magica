#!/usr/bin/env bash
# Clona o MCP local da AbacatePay para uma pasta gitignored e instala as dependências.
# A chave não entra neste script: o Cursor lê ABACATE_PAY_API_KEY do ambiente.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="$ROOT/tools/abacatepay-mcp"

mkdir -p "$ROOT/tools"

if [[ ! -d "$DEST/.git" ]]; then
  git clone --depth 1 https://github.com/AbacatePay/abacatepay-mcp.git "$DEST"
else
  git -C "$DEST" pull --ff-only
fi

if ! command -v bun >/dev/null 2>&1; then
  echo "O bun não está instalado. Instale em https://bun.sh e rode de novo." >&2
  exit 1
fi

(cd "$DEST" && bun install)

echo "MCP local pronto em ${DEST}/src/index.ts"
echo "Exporte ABACATE_PAY_API_KEY com uma chave v2 de devMode antes de usar o servidor no Cursor."

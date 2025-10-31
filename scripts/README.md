Scripts para o repositório de conteúdo (scroll-repository)

Este diretório contém scripts prontos para uso no repositório de conteúdo, gerando a pasta `generated/` na raiz do repositório (sem depender de arquivo de categorias).

Principais pontos:
- Categorias são derivadas automaticamente a partir do campo `category` dos estudos.
- Não gera mais `categories.json`.
- Gera os arquivos: `generated/index.json`, `generated/estudos.json`, `generated/pregacoes.json`, `generated/devocionais.json`, `generated/atualidades.json`, `generated/metadata.json`.

Uso (no repositório de conteúdo):
- Copie esta pasta para a raiz do repo `scroll-repository`.
- Build normal (processa apenas arquivos novos desde o último build): `node scripts/build.js`
- Build em modo reparo (força correção de todos os pares JSON/MD): `node scripts/build.js --repair`
- Reparo geral (script dedicado, corrige tudo e reseta versão): `node scripts/repair.js`

Observação:
- Se a pasta `content/` não existir, o script usa a raiz do repositório como base (ex.: `estudos/`, `pregacoes/`, etc.).
- Versionamento: por padrão, a cada build bem-sucedido o script incrementa o PATCH (ex.: 1.0.19 → 1.0.20) com base na versão anterior em `generated/index.json` (ou em `metadata/versions.json` se for o primeiro build). Também suporta versões com 4 partes (ex.: 1.0.0.1 → 1.0.0.2). Para fixar uma versão específica, use a env `SCROLL_VERSION`:
- `SCROLL_VERSION=1.0.19 node scripts/build.js`
- O script de reparo geral (`scripts/repair.js`) reseta a versão em `generated/index.json` para `1.0.0.1`.

Estrutura esperada do repo de conteúdo:
- `content/estudos/*.json|.md` (plano; `category` define a categoria)
- `content/pregacoes/*.json|.md`
- `content/atualidades/*.json|.md`
- `content/devocionais/**/[slug].json|.md` (organização por data é suportada)
- `content/metadata/*.json` (authors, tags, versions...)

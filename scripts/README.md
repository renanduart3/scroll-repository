Scripts para o repositório de conteúdo (scroll-repository)

Este diretório contém scripts prontos para uso no repositório de conteúdo, gerando a pasta `generated/` na raiz do repositório (sem depender de arquivo de categorias).

Principais pontos:
- Categorias são derivadas automaticamente a partir do campo `category` dos estudos.
- Não gera mais `categories.json`.
- Gera os arquivos: `generated/index.json`, `generated/estudos.json`, `generated/pregacoes.json`, `generated/devocionais.json`, `generated/atualidades.json`, `generated/metadata.json`.

Uso (no repositório de conteúdo):
- Copie esta pasta para a raiz do repo `scroll-repository`.
- Execute: `node scripts/build.js`

Observação:
- Se a pasta `content/` não existir, o script usa a raiz do repositório como base (ex.: `estudos/`, `pregacoes/`, etc.).

Estrutura esperada do repo de conteúdo:
- `content/estudos/*.json|.md` (plano; `category` define a categoria)
- `content/pregacoes/*.json|.md`
- `content/atualidades/*.json|.md`
- `content/devocionais/**/[slug].json|.md` (organização por data é suportada)
- `content/metadata/*.json` (authors, tags, versions...)

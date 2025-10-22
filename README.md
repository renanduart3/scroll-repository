# Faith Scroll - Sistema de Conteúdo

Este diretório contém todo o conteúdo do aplicativo Faith Scroll, organizado de forma estruturada para facilitar a manutenção e futura migração para um repositório separado.

## 📁 Estrutura de Diretórios

```
content/
├── categories/           # Categorias de estudos
├── estudos/             # Estudos bíblicos organizados por categoria
├── pregacoes/           # Pregações e sermões
├── devocionais/         # Devocionais diários organizados por data
├── metadata/            # Metadados (autores, tags, versões)
├── scripts/             # Scripts de build e validação
└── docs/               # Documentação
```

## 📋 Tipos de Conteúdo

### Estudos Bíblicos
- **Localização**: `estudos/[categoria]/`
- **Formato**: JSON + Markdown
- **Estrutura**: Cada estudo tem um arquivo `.json` com metadados e um `.md` com o conteúdo

### Pregações
- **Localização**: `pregacoes/`
- **Formato**: JSON + Markdown
- **Estrutura**: Cada pregação tem um arquivo `.json` com metadados e um `.md` com o conteúdo

### Devocionais
- **Localização**: `devocionais/[ano]/[mes]/[dia]/`
- **Formato**: JSON + Markdown
- **Estrutura**: Organizados por data para facilitar a navegação

## 🔧 Metadados

### Autores (`metadata/authors.json`)
Informações sobre os autores do conteúdo, incluindo biografia, especialidades e contato.

### Tags (`metadata/tags.json`)
Sistema de tags para categorização e busca, com cores e categorias.

### Versões (`metadata/versions.json`)
Controle de versão do conteúdo e histórico de mudanças.

## 📝 Convenções

### Nomenclatura de Arquivos
- **JSON**: `kebab-case.json` (ex: `joao-3-16.json`)
- **Markdown**: `kebab-case.md` (ex: `joao-3-16.md`)
- **Pastas**: `kebab-case` (ex: `temas-gerais`)

### Estrutura de Metadados
Todos os arquivos JSON seguem um padrão consistente com campos obrigatórios:
- `id`: Identificador único
- `title`: Título do conteúdo
- `description`: Descrição breve
- `author`: Autor do conteúdo
- `date`: Data de criação
- `tags`: Array de tags
- `content_file`: Nome do arquivo Markdown
- `version`: Versão do conteúdo
- `status`: Status de publicação

## 🚀 Scripts

### Build (`scripts/build.js`)
Script para processar todo o conteúdo e gerar índices otimizados.

### Validação (`scripts/validate.js`)
Script para validar a estrutura e integridade do conteúdo.

### Deploy (`scripts/deploy.js`)
Script para preparar o conteúdo para deploy.

## 📚 Documentação

- `docs/CONTRIBUTING.md`: Guia para contribuidores
- `docs/CONTENT_GUIDELINES.md`: Diretrizes para criação de conteúdo
- `docs/API.md`: Documentação da API de conteúdo

## 🔄 Migração Futura

Esta estrutura foi projetada para facilitar a migração para um repositório Git separado. Quando necessário, todo o conteúdo pode ser facilmente transferido mantendo a organização e integridade.

## 📊 Estatísticas

- **Categorias**: 11
- **Estudos**: 3
- **Pregações**: 1
- **Devocionais**: 1
- **Autores**: 5
- **Tags**: 14

---

*Última atualização: 22 de Janeiro de 2024*

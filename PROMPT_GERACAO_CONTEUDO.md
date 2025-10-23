# Prompt para Geração de Conteúdo - Faith Scroll

Este documento contém instruções completas para agentes de IA gerarem novos tópicos de conteúdo para o aplicativo Faith Scroll.

## 📋 Visão Geral

O Faith Scroll é um aplicativo de conteúdo cristão que organiza estudos bíblicos, pregações e devocionais em categorias específicas. Cada item de conteúdo deve seguir uma estrutura padronizada com arquivos JSON (metadados) e Markdown (conteúdo).

## 🏗️ Estrutura do Projeto

```
content/
├── categories/           # Categorias de estudos (index.json)
├── estudos/             # Estudos bíblicos por categoria
│   ├── lideranca/       # Exemplo: estudos/lideranca/
│   ├── familia/         # Exemplo: estudos/familia/
│   └── temas-gerais/    # Exemplo: estudos/temas-gerais/
├── pregacoes/           # Pregações e sermões
├── atualidades/         # Notícias e atualizações
├── devocionais/         # Devocionais diários
├── metadata/            # Autores, tags e versões
└── generated/           # Arquivos gerados automaticamente
```

## 📝 Tipos de Conteúdo

### 1. Estudos Bíblicos
- **Localização**: `content/estudos/[categoria]/`
- **Arquivos**: `[nome-slug].json` + `[nome-slug].md`
- **Categorias disponíveis**: lideranca, familia, pessoas-da-biblia, oracoes, ocultismo, livros, curiosidades, temas-gerais, heresias, seitas, espiritualidade

### 2. Pregações
- **Localização**: `content/pregacoes/`
- **Arquivos**: `[nome-slug].json` + `[nome-slug].md`

### 3. Atualidades
- **Localização**: `content/atualidades/`
- **Arquivos**: `[nome-slug].json` + `[nome-slug].md`

### 4. Devocionais
- **Localização**: `content/devocionais/`
- **Arquivos**: `[nome-slug].json` + `[nome-slug].md`

## 🎯 Instruções para o Agente

### ⚠️ REGRAS CRÍTICAS DE NOMENCLATURA

**IMPORTANTE**: Todos os arquivos devem seguir a nomenclatura padronizada:

- **JSON**: `[nome-slug].json` (ex: `espinhos-vaidade.json`)
- **Markdown**: `[nome-slug].md` (ex: `espinhos-vaidade.md`)
- **NUNCA** use prefixos como `json_` ou `md_` nos nomes dos arquivos
- **SEMPRE** use kebab-case (hífens ao invés de espaços)
- **NUNCA** use espaços, underscores ou caracteres especiais

**❌ INCORRETO**: `json_espinhos_vaidade.json`, `md_espinhos_vaidade.md`
**✅ CORRETO**: `espinhos-vaidade.json`, `espinhos-vaidade.md`

### Parâmetros Obrigatórios

Ao gerar conteúdo, você DEVE receber os seguintes parâmetros:

1. **Tipo de Conteúdo**: `estudo`, `pregacao`, `atualidade`, ou `devocional`
2. **Título**: Título do conteúdo
3. **Categoria**: (apenas para estudos) Uma das categorias disponíveis
4. **Autor**: ID do autor (usar IDs existentes em metadata/authors.json)
5. **Data**: Data de criação (formato: YYYY-MM-DD)
6. **Tags**: Array de tags (usar tags existentes em metadata/tags.json)
7. **Conteúdo**: O texto principal do conteúdo

### Parâmetros Opcionais

- **Dificuldade**: `iniciante`, `intermediario`, `avancado` (padrão: `intermediario`)
- **Tempo de Leitura**: Em minutos (padrão: calcular automaticamente)
- **Referências Bíblicas**: Array de versículos
- **Estudos Relacionados**: Array de IDs de estudos relacionados
- **Destaque**: `true` ou `false` (padrão: `false`)
- **Status**: `published`, `draft` (padrão: `published`)

## 📄 Estrutura dos Arquivos

### Arquivo JSON (Metadados)

```json
{
  "id": "slug-do-conteudo",
  "title": "Título do Conteúdo",
  "description": "Descrição breve do conteúdo",
  "category": "categoria-do-conteudo",
  "author": "id-do-autor",
  "date": "2024-01-22",
  "tags": ["tag1", "tag2", "tag3"],
  "progress": 0,
  "content_file": "nome-do-arquivo.md",
  "featured": false,
  "reading_time": 25,
  "difficulty": "intermediario",
  "bible_references": ["João 3:16", "Romanos 8:28"],
  "related_studies": [],
  "version": "1.0.0",
  "last_updated": "2024-01-22T10:00:00Z",
  "status": "published",
  "views": 0,
  "favorites": 0
}
```

### Arquivo Markdown (Conteúdo)

Use a seguinte estrutura para o conteúdo:

```markdown
# Título do Conteúdo

## Introdução
[Introdução ao tema]

## Desenvolvimento
[Conteúdo principal dividido em seções]

### Seção 1
[Conteúdo da seção]

### Seção 2
[Conteúdo da seção]

## Aplicação Prática
[Como aplicar o ensino na vida]

## Conclusão
[Resumo e conclusão]

## Perguntas para Reflexão
1. Pergunta 1
2. Pergunta 2
3. Pergunta 3

## Desafio da Semana
[Desafio prático para aplicar o ensino]

---
*Versículo para Memorizar: [versículo]*
```

### Template para Atualidades

**Arquivo JSON**: `[nome-slug].json`
```json
{
  "id": "nome-slug",
  "title": "Título da Atualidade",
  "description": "Descrição breve da notícia/atualidade",
  "author": "autor-id",
  "date": "2024-01-15",
  "tags": ["tag1", "tag2"],
  "content_file": "[nome-slug].md",
  "featured": false,
  "reading_time": 15,
  "difficulty": "iniciante|intermediario|avancado",
  "bible_references": ["João 3:16", "Romanos 8:28"],
  "related_studies": [],
  "version": "1.0.0",
  "last_updated": "2024-01-15T10:00:00Z",
  "status": "published",
  "views": 0,
  "favorites": 0
}
```

## 🏷️ Categorias Disponíveis

### Para Estudos Bíblicos:
- `lideranca` - Princípios bíblicos de liderança cristã
- `familia` - Relacionamentos, casamento, educação de filhos
- `pessoas-da-biblia` - Biografias e análises de personagens bíblicos
- `oracoes` - Guias de oração e reflexão espiritual
- `ocultismo` - Advertências bíblicas sobre práticas a evitar
- `livros` - Estudos baseados em livros e material de referência
- `curiosidades` - Fatos interessantes e descobertas bíblicas
- `temas-gerais` - Estudos sobre fé, salvação, profecias
- `heresias` - Estudos sobre falsos ensinos e doutrinas distorcidas
- `seitas` - Informações sobre grupos religiosos desviantes
- `espiritualidade` - Experiências espirituais e discernimento

## 👥 Autores Disponíveis

- `pastor-joao-silva` - Pastor João Silva
- `dra-maria-santos` - Dra. Maria Santos
- `rev-pedro-almeida` - Rev. Pedro Almeida
- `pastor-carlos-mendes` - Pastor Carlos Mendes
- `equipe-palavra-viva` - Equipe Palavra Viva

## 🏷️ Tags Disponíveis

- `amor`, `salvação`, `joão`, `salmos`, `conforto`, `provisão`
- `liderança`, `serviço`, `jesus`, `fé`, `milagres`, `confiança`
- `paz`, `tempestade`

## 📋 Exemplo de Prompt Completo

```
Gere um estudo bíblico com os seguintes parâmetros:

Tipo: estudo
Título: "O Poder da Oração em Tempos Difíceis"
Categoria: oracoes
Autor: pastor-joao-silva
Data: 2024-01-22
Tags: ["oração", "conforto", "fé"]
Dificuldade: intermediario
Referências Bíblicas: ["Mateus 6:6", "Filipenses 4:6-7", "Tiago 5:16"]
Conteúdo: [Aqui você forneceria o conteúdo principal do estudo]

Gere os arquivos JSON e Markdown seguindo a estrutura padrão.
```

## 🔧 Regras Importantes

1. **Nomenclatura**: Use kebab-case para nomes de arquivos e IDs
2. **Slug**: Gere um slug único baseado no título
3. **Conteúdo**: Mantenha tom pastoral e acessível
4. **Estrutura**: Siga exatamente a estrutura dos arquivos JSON
5. **Referências**: Inclua versículos bíblicos relevantes
6. **Aplicação**: Sempre inclua seção de aplicação prática
7. **Reflexão**: Adicione perguntas para reflexão
8. **Desafio**: Inclua desafio prático semanal

## 📁 Localização dos Arquivos

- **Estudos**: `content/estudos/[categoria]/[slug].json` e `[slug].md`
- **Pregações**: `content/pregacoes/[slug].json` e `[slug].md`
- **Devocionais**: `content/devocionais/[ano]/[mes]/[dia]/[slug].json` e `[slug].md`

## ✅ Checklist de Validação

Antes de finalizar, verifique:

- [ ] Arquivo JSON segue a estrutura exata
- [ ] Arquivo Markdown tem todas as seções obrigatórias
- [ ] Slug é único e em kebab-case
- [ ] Categoria existe na lista de categorias
- [ ] Autor existe na lista de autores
- [ ] Tags existem na lista de tags
- [ ] Data está no formato correto
- [ ] Conteúdo tem aplicação prática
- [ ] Inclui perguntas para reflexão
- [ ] Tem desafio semanal

## 🚀 Como Usar Este Prompt

### Para o Desenvolvedor (Você):

1. **Copie este prompt** do arquivo `PROMPT_GERACAO_CONTEUDO.md`
2. **Forneça os parâmetros** específicos do conteúdo que deseja criar
3. **Cole no agente de IA** (ChatGPT, Claude, etc.)
4. **O agente gerará** os arquivos JSON e Markdown
5. **Salve os arquivos** nas pastas corretas do repositório `scroll-repository`
6. **Execute o build** no repositório de conteúdo: `node content/scripts/build.js`
7. **Faça commit e push** para o GitHub
8. **No app**: O usuário clica em "Atualizar Conteúdo" nas configurações

### Para o Usuário Final:

1. **Abra o app** no celular
2. **Vá em Configurações** (ícone de engrenagem)
3. **Clique em "Atualizar Conteúdo"** na seção "Conteúdo"
4. **Aguarde o download** automático
5. **Pronto!** O novo conteúdo aparece automaticamente

---

*Este prompt foi criado para facilitar a geração consistente de conteúdo para o Faith Scroll. Mantenha sempre a estrutura e os padrões estabelecidos.*

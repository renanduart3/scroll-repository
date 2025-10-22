# Guia de Contribuição - Faith Scroll Content

Este documento fornece diretrizes para contribuir com conteúdo para o Faith Scroll.

## 🎯 Tipos de Contribuição

### 1. Estudos Bíblicos
- **Localização**: `content/estudos/[categoria]/`
- **Formato**: JSON + Markdown
- **Processo**: Criar arquivo JSON com metadados + arquivo Markdown com conteúdo

### 2. Pregações
- **Localização**: `content/pregacoes/`
- **Formato**: JSON + Markdown
- **Processo**: Criar arquivo JSON com metadados + arquivo Markdown com conteúdo

### 3. Devocionais
- **Localização**: `content/devocionais/[ano]/[mes]/[dia]/`
- **Formato**: JSON + Markdown
- **Processo**: Criar arquivo JSON com metadados + arquivo Markdown com conteúdo

## 📝 Estrutura de Arquivos

### Arquivo JSON (Metadados)
```json
{
  "id": "identificador-unico",
  "title": "Título do Conteúdo",
  "description": "Descrição breve",
  "category": "categoria",
  "author": "Nome do Autor",
  "date": "YYYY-MM-DD",
  "tags": ["tag1", "tag2"],
  "content_file": "nome-do-arquivo.md",
  "featured": false,
  "reading_time": 15,
  "difficulty": "iniciante|intermediario|avancado",
  "bible_references": ["João 3:16"],
  "related_studies": ["outro-estudo"],
  "version": "1.0.0",
  "last_updated": "2024-01-22T10:00:00Z",
  "status": "published|draft|archived",
  "views": 0,
  "favorites": 0
}
```

### Arquivo Markdown (Conteúdo)
```markdown
# Título do Conteúdo

## Introdução
Conteúdo da introdução...

## Desenvolvimento
Conteúdo do desenvolvimento...

## Conclusão
Conteúdo da conclusão...
```

## 🏷️ Sistema de Tags

### Tags Disponíveis
Consulte `content/metadata/tags.json` para ver todas as tags disponíveis.

### Criando Novas Tags
1. Adicione a nova tag em `content/metadata/tags.json`
2. Defina cor, categoria e descrição
3. Atualize a versão do arquivo

## 👥 Autores

### Adicionando Novo Autor
1. Adicione o autor em `content/metadata/authors.json`
2. Inclua biografia, especialidades e contato
3. Atualize a versão do arquivo

## 📅 Organização por Data

### Devocionais
- **Estrutura**: `devocionais/[ano]/[mes]/[dia]/`
- **Exemplo**: `devocionais/2024/01/21/`

### Estudos e Pregações
- **Estrutura**: Por categoria
- **Exemplo**: `estudos/temas-gerais/`

## ✅ Checklist de Qualidade

### Antes de Submeter
- [ ] Arquivo JSON válido
- [ ] Arquivo Markdown bem formatado
- [ ] Metadados completos
- [ ] Tags corretas
- [ ] Autor existente
- [ ] Categoria válida
- [ ] Conteúdo revisado
- [ ] Referências bíblicas verificadas

### Validação
Execute o script de validação:
```bash
node content/scripts/validate.js
```

## 🔄 Processo de Contribuição

1. **Fork** do repositório
2. **Criar branch** para sua contribuição
3. **Adicionar conteúdo** seguindo as diretrizes
4. **Validar** usando os scripts
5. **Testar** localmente
6. **Submeter** pull request

## 📋 Templates

### Template para Estudo
```json
{
  "id": "novo-estudo",
  "title": "Título do Estudo",
  "description": "Descrição do estudo",
  "category": "categoria-adequada",
  "author": "autor-existente",
  "date": "2024-01-22",
  "tags": ["tag1", "tag2"],
  "content_file": "novo-estudo.md",
  "featured": false,
  "reading_time": 15,
  "difficulty": "iniciante",
  "bible_references": [],
  "related_studies": [],
  "version": "1.0.0",
  "last_updated": "2024-01-22T10:00:00Z",
  "status": "draft",
  "views": 0,
  "favorites": 0
}
```

## 🚫 O que Evitar

- Conteúdo duplicado
- Metadados incompletos
- Tags inexistentes
- Autores inexistentes
- Categorias inexistentes
- Conteúdo não revisado
- Referências bíblicas incorretas

## 📞 Suporte

Para dúvidas sobre contribuição, entre em contato:
- **Email**: editorial@faithscroll.com
- **Issues**: Use o sistema de issues do GitHub

---

*Este guia é atualizado regularmente. Última atualização: 22 de Janeiro de 2024*

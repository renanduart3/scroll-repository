#!/usr/bin/env node

/**
 * Script de Deploy para Faith Scroll Content
 * 
 * Este script prepara o conteúdo para deploy,
 * otimizando arquivos e gerando versões de produção.
 */

const fs = require('fs');
const path = require('path');

// Configurações
const CONTENT_DIR = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(__dirname, '..', '..', 'src', 'data', 'generated');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    log(`Erro ao ler arquivo ${filePath}: ${error.message}`, 'red');
    return null;
  }
}

function writeJsonFile(filePath, data) {
  try {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    log(`Erro ao escrever arquivo ${filePath}: ${error.message}`, 'red');
    return false;
  }
}

function getAllFiles(dir, extension) {
  const files = [];
  
  function traverse(currentDir) {
    if (!fs.existsSync(currentDir)) return;
    
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item.endsWith(extension)) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function optimizeContent(content) {
  // Remover campos desnecessários para produção
  const optimized = { ...content };
  
  // Remover campos de desenvolvimento
  delete optimized.last_updated;
  delete optimized.version;
  delete optimized.status;
  
  return optimized;
}

function createProductionIndex() {
  log('📋 Criando índice de produção...', 'blue');
  
  const index = {
    version: '1.0.0',
    buildDate: new Date().toISOString(),
    content: {
      categories: 0,
      estudos: 0,
      pregacoes: 0,
      devocionais: 0,
      authors: 0,
      tags: 0
    },
    lastUpdated: new Date().toISOString()
  };
  
  // Ler estatísticas dos arquivos gerados
  try {
    const categories = readJsonFile(path.join(OUTPUT_DIR, 'categories.json'));
    if (categories) {
      index.content.categories = categories.stats.total;
    }
    
    const estudos = readJsonFile(path.join(OUTPUT_DIR, 'estudos.json'));
    if (estudos) {
      index.content.estudos = estudos.stats.total;
    }
    
    const pregacoes = readJsonFile(path.join(OUTPUT_DIR, 'pregacoes.json'));
    if (pregacoes) {
      index.content.pregacoes = pregacoes.stats.total;
    }
    
    const devocionais = readJsonFile(path.join(OUTPUT_DIR, 'devocionais.json'));
    if (devocionais) {
      index.content.devocionais = devocionais.stats.total;
    }
    
    const metadata = readJsonFile(path.join(OUTPUT_DIR, 'metadata.json'));
    if (metadata) {
      index.content.authors = metadata.authors?.authors?.length || 0;
      index.content.tags = metadata.tags?.tags?.length || 0;
    }
  } catch (error) {
    log(`⚠️  Aviso: Erro ao ler estatísticas: ${error.message}`, 'yellow');
  }
  
  writeJsonFile(path.join(OUTPUT_DIR, 'index.json'), index);
  log(`✅ Índice de produção criado`, 'green');
  
  return index;
}

function createSearchIndex() {
  log('🔍 Criando índice de busca...', 'blue');
  
  const searchIndex = {
    estudos: [],
    pregacoes: [],
    devocionais: []
  };
  
  // Processar estudos
  const estudos = readJsonFile(path.join(OUTPUT_DIR, 'estudos.json'));
  if (estudos) {
    for (const estudo of estudos.estudos) {
      searchIndex.estudos.push({
        id: estudo.id,
        title: estudo.title,
        description: estudo.description,
        category: estudo.category,
        author: estudo.author,
        tags: estudo.tags,
        searchText: `${estudo.title} ${estudo.description} ${estudo.tags.join(' ')}`
      });
    }
  }
  
  // Processar pregações
  const pregacoes = readJsonFile(path.join(OUTPUT_DIR, 'pregacoes.json'));
  if (pregacoes) {
    for (const pregação of pregacoes.pregacoes) {
      searchIndex.pregacoes.push({
        id: pregação.id,
        title: pregação.title,
        description: pregação.description,
        author: pregação.author,
        tags: pregação.tags,
        searchText: `${pregação.title} ${pregação.description} ${pregação.tags.join(' ')}`
      });
    }
  }
  
  // Processar devocionais
  const devocionais = readJsonFile(path.join(OUTPUT_DIR, 'devocionais.json'));
  if (devocionais) {
    for (const devocional of devocionais.devocionais) {
      searchIndex.devocionais.push({
        id: devocional.id,
        title: devocional.title,
        description: devocional.description,
        author: devocional.author,
        tags: devocional.tags,
        date: devocional.date,
        searchText: `${devocional.title} ${devocional.description} ${devocional.tags.join(' ')}`
      });
    }
  }
  
  writeJsonFile(path.join(OUTPUT_DIR, 'search.json'), searchIndex);
  log(`✅ Índice de busca criado`, 'green');
  
  return searchIndex;
}

function createApiEndpoints() {
  log('🔌 Criando endpoints da API...', 'blue');
  
  const apiEndpoints = {
    categories: {
      getAll: '/api/categories',
      getById: '/api/categories/:id',
      getBySlug: '/api/categories/slug/:slug'
    },
    estudos: {
      getAll: '/api/estudos',
      getById: '/api/estudos/:id',
      getByCategory: '/api/estudos/category/:category',
      getByAuthor: '/api/estudos/author/:author',
      getByTag: '/api/estudos/tag/:tag',
      search: '/api/estudos/search'
    },
    pregacoes: {
      getAll: '/api/pregacoes',
      getById: '/api/pregacoes/:id',
      getByAuthor: '/api/pregacoes/author/:author',
      getByTag: '/api/pregacoes/tag/:tag',
      search: '/api/pregacoes/search'
    },
    devocionais: {
      getAll: '/api/devocionais',
      getById: '/api/devocionais/:id',
      getByDate: '/api/devocionais/date/:date',
      getByAuthor: '/api/devocionais/author/:author',
      getByTag: '/api/devocionais/tag/:tag',
      search: '/api/devocionais/search'
    },
    authors: {
      getAll: '/api/authors',
      getById: '/api/authors/:id',
      getBySpecialty: '/api/authors/specialty/:specialty'
    },
    tags: {
      getAll: '/api/tags',
      getById: '/api/tags/:id',
      getByCategory: '/api/tags/category/:category'
    },
    search: {
      global: '/api/search',
      byType: '/api/search/:type'
    }
  };
  
  writeJsonFile(path.join(OUTPUT_DIR, 'api.json'), apiEndpoints);
  log(`✅ Endpoints da API criados`, 'green');
  
  return apiEndpoints;
}

function createManifest() {
  log('📄 Criando manifest...', 'blue');
  
  const manifest = {
    name: 'Faith Scroll Content',
    version: '1.0.0',
    description: 'Sistema de conteúdo para o aplicativo Faith Scroll',
    buildDate: new Date().toISOString(),
    content: {
      categories: 0,
      estudos: 0,
      pregacoes: 0,
      devocionais: 0,
      authors: 0,
      tags: 0
    },
    features: [
      'Sistema de categorias',
      'Estudos bíblicos',
      'Pregações',
      'Devocionais diários',
      'Sistema de busca',
      'Metadados completos',
      'API RESTful'
    ],
    endpoints: {
      base: '/api',
      version: 'v1',
      documentation: '/api/docs'
    }
  };
  
  // Ler estatísticas
  try {
    const index = readJsonFile(path.join(OUTPUT_DIR, 'index.json'));
    if (index) {
      manifest.content = index.content;
    }
  } catch (error) {
    log(`⚠️  Aviso: Erro ao ler estatísticas: ${error.message}`, 'yellow');
  }
  
  writeJsonFile(path.join(OUTPUT_DIR, 'manifest.json'), manifest);
  log(`✅ Manifest criado`, 'green');
  
  return manifest;
}

function createReadme() {
  log('📚 Criando README...', 'blue');
  
  const readme = `# Faith Scroll Content - Generated Files

Este diretório contém os arquivos gerados automaticamente pelo sistema de build do Faith Scroll.

## 📁 Arquivos Gerados

- \`index.json\` - Índice principal com estatísticas
- \`categories.json\` - Categorias de conteúdo
- \`estudos.json\` - Estudos bíblicos
- \`pregacoes.json\` - Pregações
- \`devocionais.json\` - Devocionais
- \`metadata.json\` - Metadados (autores, tags, versões)
- \`search.json\` - Índice de busca
- \`api.json\` - Endpoints da API
- \`manifest.json\` - Manifest do sistema

## 🔧 Como Usar

Estes arquivos são gerados automaticamente e não devem ser editados manualmente.
Para atualizar o conteúdo, edite os arquivos na pasta \`content/\` e execute o build.

## 📊 Estatísticas

- **Categorias**: ${0}
- **Estudos**: ${0}
- **Pregações**: ${0}
- **Devocionais**: ${0}
- **Autores**: ${0}
- **Tags**: ${0}

## 🚀 Deploy

Para fazer deploy do conteúdo:

1. Execute o build: \`node content/scripts/build.js\`
2. Execute a validação: \`node content/scripts/validate.js\`
3. Execute o deploy: \`node content/scripts/deploy.js\`

---

*Gerado automaticamente em ${new Date().toISOString()}*
`;

  writeJsonFile(path.join(OUTPUT_DIR, 'README.md'), readme);
  log(`✅ README criado`, 'green');
  
  return readme;
}

function main() {
  log('🚀 Iniciando deploy do conteúdo Faith Scroll...', 'bright');
  log('', 'reset');
  
  // Criar diretório de output
  ensureDir(OUTPUT_DIR);
  
  // Criar arquivos de produção
  const index = createProductionIndex();
  const searchIndex = createSearchIndex();
  const apiEndpoints = createApiEndpoints();
  const manifest = createManifest();
  const readme = createReadme();
  
  log('', 'reset');
  log('🎉 Deploy concluído com sucesso!', 'green');
  log('', 'reset');
  log('📊 Resumo:', 'bright');
  log(`   📁 Categorias: ${index.content.categories}`, 'cyan');
  log(`   📚 Estudos: ${index.content.estudos}`, 'cyan');
  log(`   📢 Pregações: ${index.content.pregacoes}`, 'cyan');
  log(`   📅 Devocionais: ${index.content.devocionais}`, 'cyan');
  log(`   👥 Autores: ${index.content.authors}`, 'cyan');
  log(`   🏷️  Tags: ${index.content.tags}`, 'cyan');
  log('', 'reset');
  log(`📁 Arquivos de produção em: ${OUTPUT_DIR}`, 'blue');
  log('', 'reset');
  log('🔗 Arquivos criados:', 'bright');
  log('   📋 index.json - Índice principal', 'cyan');
  log('   🔍 search.json - Índice de busca', 'cyan');
  log('   🔌 api.json - Endpoints da API', 'cyan');
  log('   📄 manifest.json - Manifest do sistema', 'cyan');
  log('   📚 README.md - Documentação', 'cyan');
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  createProductionIndex,
  createSearchIndex,
  createApiEndpoints,
  createManifest,
  createReadme,
  main
};

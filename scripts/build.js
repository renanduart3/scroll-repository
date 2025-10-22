#!/usr/bin/env node

/**
 * Script de Build para Faith Scroll Content
 * 
 * Este script processa todo o conteúdo e gera índices otimizados
 * para uso no aplicativo Faith Scroll.
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

function buildCategories() {
  log('📁 Processando categorias...', 'blue');
  
  const categoriesFile = path.join(CONTENT_DIR, 'categories', 'index.json');
  const categories = readJsonFile(categoriesFile);
  
  if (!categories) {
    log('❌ Erro ao processar categorias', 'red');
    return null;
  }
  
  // Adicionar estatísticas
  const stats = {
    total: categories.categories.length,
    active: categories.categories.filter(c => c.ativo).length,
    inactive: categories.categories.filter(c => !c.ativo).length
  };
  
  const result = {
    ...categories,
    stats
  };
  
  writeJsonFile(path.join(OUTPUT_DIR, 'categories.json'), result);
  log(`✅ Categorias processadas: ${stats.total} total, ${stats.active} ativas`, 'green');
  
  return result;
}

function buildEstudos() {
  log('📚 Processando estudos...', 'blue');
  
  const estudosDir = path.join(CONTENT_DIR, 'estudos');
  const estudoFiles = getAllFiles(estudosDir, '.json');
  
  const estudos = [];
  const byCategory = {};
  const byAuthor = {};
  const byTag = {};
  
  for (const file of estudoFiles) {
    const estudo = readJsonFile(file);
    if (!estudo) continue;
    
    estudos.push(estudo);
    
    // Agrupar por categoria
    if (!byCategory[estudo.category]) {
      byCategory[estudo.category] = [];
    }
    byCategory[estudo.category].push(estudo);
    
    // Agrupar por autor
    if (!byAuthor[estudo.author]) {
      byAuthor[estudo.author] = [];
    }
    byAuthor[estudo.author].push(estudo);
    
    // Agrupar por tag
    estudo.tags.forEach(tag => {
      if (!byTag[tag]) {
        byTag[tag] = [];
      }
      byTag[tag].push(estudo);
    });
  }
  
  const result = {
    estudos,
    byCategory,
    byAuthor,
    byTag,
    stats: {
      total: estudos.length,
      byCategory: Object.keys(byCategory).length,
      byAuthor: Object.keys(byAuthor).length,
      byTag: Object.keys(byTag).length
    }
  };
  
  writeJsonFile(path.join(OUTPUT_DIR, 'estudos.json'), result);
  log(`✅ Estudos processados: ${estudos.length} total`, 'green');
  
  return result;
}

function buildPregacoes() {
  log('📢 Processando pregações...', 'blue');
  
  const pregacoesDir = path.join(CONTENT_DIR, 'pregacoes');
  const pregaçãoFiles = getAllFiles(pregacoesDir, '.json');
  
  const pregacoes = [];
  const byAuthor = {};
  const byTag = {};
  
  for (const file of pregaçãoFiles) {
    const pregação = readJsonFile(file);
    if (!pregação) continue;
    
    pregacoes.push(pregação);
    
    // Agrupar por autor
    if (!byAuthor[pregação.author]) {
      byAuthor[pregação.author] = [];
    }
    byAuthor[pregação.author].push(pregação);
    
    // Agrupar por tag
    pregação.tags.forEach(tag => {
      if (!byTag[tag]) {
        byTag[tag] = [];
      }
      byTag[tag].push(pregação);
    });
  }
  
  const result = {
    pregacoes,
    byAuthor,
    byTag,
    stats: {
      total: pregacoes.length,
      byAuthor: Object.keys(byAuthor).length,
      byTag: Object.keys(byTag).length
    }
  };
  
  writeJsonFile(path.join(OUTPUT_DIR, 'pregacoes.json'), result);
  log(`✅ Pregações processadas: ${pregacoes.length} total`, 'green');
  
  return result;
}

function buildDevocionais() {
  log('📅 Processando devocionais...', 'blue');
  
  const devocionaisDir = path.join(CONTENT_DIR, 'devocionais');
  const devocionalFiles = getAllFiles(devocionaisDir, '.json');
  
  const devocionais = [];
  const byDate = {};
  const byAuthor = {};
  const byTag = {};
  
  for (const file of devocionalFiles) {
    const devocional = readJsonFile(file);
    if (!devocional) continue;
    
    devocionais.push(devocional);
    
    // Agrupar por data
    const date = devocional.date.split('T')[0];
    if (!byDate[date]) {
      byDate[date] = [];
    }
    byDate[date].push(devocional);
    
    // Agrupar por autor
    if (!byAuthor[devocional.author]) {
      byAuthor[devocional.author] = [];
    }
    byAuthor[devocional.author].push(devocional);
    
    // Agrupar por tag
    devocional.tags.forEach(tag => {
      if (!byTag[tag]) {
        byTag[tag] = [];
      }
      byTag[tag].push(devocional);
    });
  }
  
  const result = {
    devocionais,
    byDate,
    byAuthor,
    byTag,
    stats: {
      total: devocionais.length,
      byDate: Object.keys(byDate).length,
      byAuthor: Object.keys(byAuthor).length,
      byTag: Object.keys(byTag).length
    }
  };
  
  writeJsonFile(path.join(OUTPUT_DIR, 'devocionais.json'), result);
  log(`✅ Devocionais processados: ${devocionais.length} total`, 'green');
  
  return result;
}

function buildMetadata() {
  log('📊 Processando metadados...', 'blue');
  
  const metadataDir = path.join(CONTENT_DIR, 'metadata');
  const metadataFiles = getAllFiles(metadataDir, '.json');
  
  const metadata = {};
  
  for (const file of metadataFiles) {
    const data = readJsonFile(file);
    if (!data) continue;
    
    const filename = path.basename(file, '.json');
    metadata[filename] = data;
  }
  
  writeJsonFile(path.join(OUTPUT_DIR, 'metadata.json'), metadata);
  log(`✅ Metadados processados: ${Object.keys(metadata).length} arquivos`, 'green');
  
  return metadata;
}

function buildIndex() {
  log('📋 Gerando índice principal...', 'blue');
  
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
  log(`✅ Índice principal gerado`, 'green');
  
  return index;
}

function main() {
  log('🚀 Iniciando build do conteúdo Faith Scroll...', 'bright');
  log('', 'reset');
  
  // Criar diretório de output
  ensureDir(OUTPUT_DIR);
  
  // Processar cada tipo de conteúdo
  const categories = buildCategories();
  const estudos = buildEstudos();
  const pregacoes = buildPregacoes();
  const devocionais = buildDevocionais();
  const metadata = buildMetadata();
  
  // Gerar índice principal
  const index = buildIndex();
  
  log('', 'reset');
  log('🎉 Build concluído com sucesso!', 'green');
  log('', 'reset');
  log('📊 Resumo:', 'bright');
  log(`   📁 Categorias: ${index.content.categories}`, 'cyan');
  log(`   📚 Estudos: ${index.content.estudos}`, 'cyan');
  log(`   📢 Pregações: ${index.content.pregacoes}`, 'cyan');
  log(`   📅 Devocionais: ${index.content.devocionais}`, 'cyan');
  log(`   👥 Autores: ${index.content.authors}`, 'cyan');
  log(`   🏷️  Tags: ${index.content.tags}`, 'cyan');
  log('', 'reset');
  log(`📁 Arquivos gerados em: ${OUTPUT_DIR}`, 'blue');
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  buildCategories,
  buildEstudos,
  buildPregacoes,
  buildDevocionais,
  buildMetadata,
  buildIndex,
  main
};

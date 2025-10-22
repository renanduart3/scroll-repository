#!/usr/bin/env node

/**
 * Script de Validação para Faith Scroll Content
 * 
 * Este script valida a estrutura e integridade do conteúdo
 * do Faith Scroll, verificando consistência e qualidade.
 */

const fs = require('fs');
const path = require('path');

// Configurações
const CONTENT_DIR = path.join(__dirname, '..');

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

function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return null;
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

function validateJsonStructure(obj, requiredFields, filePath) {
  const errors = [];
  
  for (const field of requiredFields) {
    if (!(field in obj)) {
      errors.push(`Campo obrigatório ausente: ${field}`);
    }
  }
  
  if (errors.length > 0) {
    log(`❌ ${filePath}:`, 'red');
    errors.forEach(error => log(`   ${error}`, 'red'));
    return false;
  }
  
  return true;
}

function validateCategories() {
  log('📁 Validando categorias...', 'blue');
  
  const categoriesFile = path.join(CONTENT_DIR, 'categories', 'index.json');
  const categories = readJsonFile(categoriesFile);
  
  if (!categories) {
    log('❌ Arquivo de categorias não encontrado', 'red');
    return false;
  }
  
  const requiredFields = ['id', 'nome', 'slug', 'descricao', 'icon', 'quantidade', 'ordem', 'ativo'];
  let valid = true;
  
  for (const category of categories.categories) {
    if (!validateJsonStructure(category, requiredFields, 'categories/index.json')) {
      valid = false;
    }
  }
  
  if (valid) {
    log(`✅ Categorias válidas: ${categories.categories.length}`, 'green');
  }
  
  return valid;
}

function validateEstudos() {
  log('📚 Validando estudos...', 'blue');
  
  const estudosDir = path.join(CONTENT_DIR, 'estudos');
  const estudoFiles = getAllFiles(estudosDir, '.json');
  
  const requiredFields = [
    'id', 'title', 'description', 'category', 'author', 'date', 'tags',
    'content_file', 'version', 'last_updated', 'status'
  ];
  
  let valid = true;
  let total = 0;
  
  for (const file of estudoFiles) {
    const estudo = readJsonFile(file);
    if (!estudo) {
      log(`❌ Erro ao ler arquivo: ${file}`, 'red');
      valid = false;
      continue;
    }
    
    total++;
    
    if (!validateJsonStructure(estudo, requiredFields, file)) {
      valid = false;
    }
    
    // Verificar se arquivo de conteúdo existe
    const contentFile = path.join(path.dirname(file), estudo.content_file);
    if (!fs.existsSync(contentFile)) {
      log(`❌ Arquivo de conteúdo não encontrado: ${contentFile}`, 'red');
      valid = false;
    }
  }
  
  if (valid) {
    log(`✅ Estudos válidos: ${total}`, 'green');
  }
  
  return valid;
}

function validatePregacoes() {
  log('📢 Validando pregações...', 'blue');
  
  const pregacoesDir = path.join(CONTENT_DIR, 'pregacoes');
  const pregaçãoFiles = getAllFiles(pregacoesDir, '.json');
  
  const requiredFields = [
    'id', 'title', 'description', 'category', 'author', 'date', 'tags',
    'content_file', 'version', 'last_updated', 'status'
  ];
  
  let valid = true;
  let total = 0;
  
  for (const file of pregaçãoFiles) {
    const pregação = readJsonFile(file);
    if (!pregação) {
      log(`❌ Erro ao ler arquivo: ${file}`, 'red');
      valid = false;
      continue;
    }
    
    total++;
    
    if (!validateJsonStructure(pregação, requiredFields, file)) {
      valid = false;
    }
    
    // Verificar se arquivo de conteúdo existe
    const contentFile = path.join(path.dirname(file), pregação.content_file);
    if (!fs.existsSync(contentFile)) {
      log(`❌ Arquivo de conteúdo não encontrado: ${contentFile}`, 'red');
      valid = false;
    }
  }
  
  if (valid) {
    log(`✅ Pregações válidas: ${total}`, 'green');
  }
  
  return valid;
}

function validateDevocionais() {
  log('📅 Validando devocionais...', 'blue');
  
  const devocionaisDir = path.join(CONTENT_DIR, 'devocionais');
  const devocionalFiles = getAllFiles(devocionaisDir, '.json');
  
  const requiredFields = [
    'id', 'title', 'description', 'category', 'author', 'date', 'tags',
    'content_file', 'version', 'last_updated', 'status'
  ];
  
  let valid = true;
  let total = 0;
  
  for (const file of devocionalFiles) {
    const devocional = readJsonFile(file);
    if (!devocional) {
      log(`❌ Erro ao ler arquivo: ${file}`, 'red');
      valid = false;
      continue;
    }
    
    total++;
    
    if (!validateJsonStructure(devocional, requiredFields, file)) {
      valid = false;
    }
    
    // Verificar se arquivo de conteúdo existe
    const contentFile = path.join(path.dirname(file), devocional.content_file);
    if (!fs.existsSync(contentFile)) {
      log(`❌ Arquivo de conteúdo não encontrado: ${contentFile}`, 'red');
      valid = false;
    }
  }
  
  if (valid) {
    log(`✅ Devocionais válidos: ${total}`, 'green');
  }
  
  return valid;
}

function validateMetadata() {
  log('📊 Validando metadados...', 'blue');
  
  const metadataDir = path.join(CONTENT_DIR, 'metadata');
  const metadataFiles = getAllFiles(metadataDir, '.json');
  
  let valid = true;
  let total = 0;
  
  for (const file of metadataFiles) {
    const data = readJsonFile(file);
    if (!data) {
      log(`❌ Erro ao ler arquivo: ${file}`, 'red');
      valid = false;
      continue;
    }
    
    total++;
    
    // Validar estrutura básica
    if (typeof data !== 'object' || data === null) {
      log(`❌ Estrutura inválida: ${file}`, 'red');
      valid = false;
    }
  }
  
  if (valid) {
    log(`✅ Metadados válidos: ${total} arquivos`, 'green');
  }
  
  return valid;
}

function validateReferences() {
  log('🔗 Validando referências...', 'blue');
  
  // Ler metadados
  const authorsFile = path.join(CONTENT_DIR, 'metadata', 'authors.json');
  const tagsFile = path.join(CONTENT_DIR, 'metadata', 'tags.json');
  const categoriesFile = path.join(CONTENT_DIR, 'categories', 'index.json');
  
  const authors = readJsonFile(authorsFile);
  const tags = readJsonFile(tagsFile);
  const categories = readJsonFile(categoriesFile);
  
  if (!authors || !tags || !categories) {
    log('❌ Erro ao ler metadados para validação de referências', 'red');
    return false;
  }
  
  const authorIds = authors.authors.map(a => a.id);
  const tagIds = tags.tags.map(t => t.id);
  const categoryIds = categories.categories.map(c => c.id);
  
  let valid = true;
  
  // Validar estudos
  const estudosDir = path.join(CONTENT_DIR, 'estudos');
  const estudoFiles = getAllFiles(estudosDir, '.json');
  
  for (const file of estudoFiles) {
    const estudo = readJsonFile(file);
    if (!estudo) continue;
    
    // Verificar autor
    if (!authorIds.includes(estudo.author)) {
      log(`❌ Autor inválido em ${file}: ${estudo.author}`, 'red');
      valid = false;
    }
    
    // Verificar categoria
    if (!categoryIds.includes(estudo.category)) {
      log(`❌ Categoria inválida em ${file}: ${estudo.category}`, 'red');
      valid = false;
    }
    
    // Verificar tags
    for (const tag of estudo.tags) {
      if (!tagIds.includes(tag)) {
        log(`❌ Tag inválida em ${file}: ${tag}`, 'red');
        valid = false;
      }
    }
  }
  
  if (valid) {
    log('✅ Referências válidas', 'green');
  }
  
  return valid;
}

function validateStructure() {
  log('🏗️  Validando estrutura de diretórios...', 'blue');
  
  const requiredDirs = [
    'categories',
    'estudos',
    'pregacoes',
    'devocionais',
    'metadata',
    'scripts',
    'docs'
  ];
  
  let valid = true;
  
  for (const dir of requiredDirs) {
    const dirPath = path.join(CONTENT_DIR, dir);
    if (!fs.existsSync(dirPath)) {
      log(`❌ Diretório obrigatório ausente: ${dir}`, 'red');
      valid = false;
    }
  }
  
  if (valid) {
    log('✅ Estrutura de diretórios válida', 'green');
  }
  
  return valid;
}

function generateReport(results) {
  log('', 'reset');
  log('📋 Relatório de Validação', 'bright');
  log('', 'reset');
  
  const total = Object.keys(results).length;
  const passed = Object.values(results).filter(Boolean).length;
  const failed = total - passed;
  
  log(`📊 Resultado: ${passed}/${total} validações passaram`, passed === total ? 'green' : 'yellow');
  log('', 'reset');
  
  for (const [test, result] of Object.entries(results)) {
    const status = result ? '✅' : '❌';
    const color = result ? 'green' : 'red';
    log(`${status} ${test}`, color);
  }
  
  log('', 'reset');
  
  if (failed > 0) {
    log('⚠️  Algumas validações falharam. Verifique os erros acima.', 'yellow');
    process.exit(1);
  } else {
    log('🎉 Todas as validações passaram!', 'green');
    process.exit(0);
  }
}

function main() {
  log('🔍 Iniciando validação do conteúdo Faith Scroll...', 'bright');
  log('', 'reset');
  
  const results = {
    'Estrutura de diretórios': validateStructure(),
    'Categorias': validateCategories(),
    'Estudos': validateEstudos(),
    'Pregações': validatePregacoes(),
    'Devocionais': validateDevocionais(),
    'Metadados': validateMetadata(),
    'Referências': validateReferences()
  };
  
  generateReport(results);
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  validateCategories,
  validateEstudos,
  validatePregacoes,
  validateDevocionais,
  validateMetadata,
  validateReferences,
  validateStructure,
  main
};

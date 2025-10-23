#!/usr/bin/env node

/**
 * Script de teste para demonstrar a funcionalidade de renomeação automática
 */

const fs = require('fs');
const path = require('path');
const { renameFilesBasedOnContentFile } = require('./build.js');

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

function createTestFiles() {
  log('🧪 Criando arquivos de teste...', 'blue');
  
  const testDir = path.join(__dirname, '..', 'test-rename');
  
  // Criar diretório de teste
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  // Criar diretório de estudos
  const estudosDir = path.join(testDir, 'estudos');
  if (!fs.existsSync(estudosDir)) {
    fs.mkdirSync(estudosDir, { recursive: true });
  }
  
  // Criar arquivo JSON com nome incorreto
  const jsonContent = {
    "id": "melquisedeque-rei-de-justicia",
    "title": "Melquisedeque: O Rei de Justiça e Seu Mistério Eterno",
    "description": "Um estudo profundo sobre a figura enigmática de Melquisedeque",
    "category": "pessoas-da-biblia",
    "author": "rev-pedro-almeida",
    "date": "2025-01-22",
    "tags": ["melquisedeque", "cristo", "sacerdócio"],
    "progress": 0,
    "content_file": "melquisedeque-rei-de-justicia.md", // Nome correto que deve ser usado
    "featured": true,
    "reading_time": 35,
    "difficulty": "avancado",
    "version": "1.0.0",
    "last_updated": "2025-01-22T10:00:00Z",
    "status": "published"
  };
  
  // Criar arquivo JSON com nome incorreto
  const jsonFile = path.join(estudosDir, 'melquisedeque_json.json');
  fs.writeFileSync(jsonFile, JSON.stringify(jsonContent, null, 2));
  
  // Criar arquivo MD com nome incorreto
  const mdContent = `# Melquisedeque: O Rei de Justiça e Seu Mistério Eterno

## Introdução

Este é um estudo sobre a figura enigmática de Melquisedeque...

## Desenvolvimento

Melquisedeque é mencionado em Gênesis 14:18-20...

## Conclusão

Melquisedeque é um tipo de Cristo...
`;
  
  const mdFile = path.join(estudosDir, 'melquisedeque_md.md');
  fs.writeFileSync(mdFile, mdContent);
  
  log(`✅ Arquivos de teste criados:`, 'green');
  log(`   📝 ${jsonFile}`, 'cyan');
  log(`   📄 ${mdFile}`, 'cyan');
  
  return testDir;
}

function testRenameFunction(testDir) {
  log('🔄 Testando função de renomeação...', 'blue');
  
  const estudosDir = path.join(testDir, 'estudos');
  
  // Mostrar arquivos antes da renomeação
  log('📋 Arquivos antes da renomeação:', 'yellow');
  const filesBefore = fs.readdirSync(estudosDir);
  filesBefore.forEach(file => {
    log(`   - ${file}`, 'cyan');
  });
  
  // Executar renomeação
  const renamedCount = renameFilesBasedOnContentFile(testDir, 'estudos');
  
  // Mostrar arquivos depois da renomeação
  log('📋 Arquivos depois da renomeação:', 'green');
  const filesAfter = fs.readdirSync(estudosDir);
  filesAfter.forEach(file => {
    log(`   - ${file}`, 'cyan');
  });
  
  return renamedCount;
}

function cleanupTestFiles(testDir) {
  log('🧹 Limpando arquivos de teste...', 'blue');
  
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
    log('✅ Arquivos de teste removidos', 'green');
  }
}

function main() {
  log('🚀 Teste de Renomeação Automática', 'bright');
  log('', 'reset');
  
  try {
    // Criar arquivos de teste
    const testDir = createTestFiles();
    
    // Testar função de renomeação
    const renamedCount = testRenameFunction(testDir);
    
    log('', 'reset');
    log('📊 Resultado do teste:', 'bright');
    log(`   🔄 Arquivos renomeados: ${renamedCount}`, 'cyan');
    
    if (renamedCount > 0) {
      log('✅ Teste passou! A renomeação automática está funcionando.', 'green');
    } else {
      log('⚠️ Nenhum arquivo foi renomeado. Verifique a configuração.', 'yellow');
    }
    
    // Limpar arquivos de teste
    cleanupTestFiles(testDir);
    
  } catch (error) {
    log(`❌ Erro durante o teste: ${error.message}`, 'red');
    process.exit(1);
  }
  
  log('', 'reset');
  log('🎉 Teste concluído!', 'green');
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { main };

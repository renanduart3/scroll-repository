#!/usr/bin/env node

/**
 * Script para reorganizar devocionais da estrutura de data para a raiz
 * 
 * Este script move todos os devocionais de devocionais/YYYY/MM/DD/ para devocionais/
 */

const fs = require('fs');
const path = require('path');

// Configurações
const CONTENT_DIR = path.join(__dirname, '..');
const DEVOCIONAIS_DIR = path.join(CONTENT_DIR, 'devocionais');

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

function getAllFiles(dir, extension) {
  const files = [];
  
  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item.endsWith(extension)) {
        files.push(fullPath);
      }
    }
  }
  
  scanDirectory(dir);
  return files;
}

function moveFile(sourcePath, targetPath) {
  try {
    // Criar diretório de destino se não existir
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Mover arquivo
    fs.renameSync(sourcePath, targetPath);
    return true;
  } catch (error) {
    log(`❌ Erro ao mover ${sourcePath}: ${error.message}`, 'red');
    return false;
  }
}

function main() {
  log('🔄 Reorganizando devocionais...', 'blue');
  log('');
  
  // Encontrar todos os arquivos JSON e MD em subdiretórios
  const jsonFiles = getAllFiles(DEVOCIONAIS_DIR, '.json');
  const mdFiles = getAllFiles(DEVOCIONAIS_DIR, '.md');
  
  log(`📄 Encontrados ${jsonFiles.length} arquivos JSON`, 'cyan');
  log(`📄 Encontrados ${mdFiles.length} arquivos MD`, 'cyan');
  log('');
  
  let movedCount = 0;
  
  // Mover arquivos JSON
  for (const file of jsonFiles) {
    const fileName = path.basename(file);
    const targetPath = path.join(DEVOCIONAIS_DIR, fileName);
    
    if (file !== targetPath) {
      log(`📦 Movendo JSON: ${fileName}`, 'yellow');
      if (moveFile(file, targetPath)) {
        movedCount++;
        log(`✅ Movido: ${fileName}`, 'green');
      }
    }
  }
  
  // Mover arquivos MD
  for (const file of mdFiles) {
    const fileName = path.basename(file);
    const targetPath = path.join(DEVOCIONAIS_DIR, fileName);
    
    if (file !== targetPath) {
      log(`📦 Movendo MD: ${fileName}`, 'yellow');
      if (moveFile(file, targetPath)) {
        movedCount++;
        log(`✅ Movido: ${fileName}`, 'green');
      }
    }
  }
  
  // Remover diretórios vazios
  log('');
  log('🧹 Removendo diretórios vazios...', 'blue');
  
  function removeEmptyDirs(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        removeEmptyDirs(fullPath);
        
        // Tentar remover diretório se estiver vazio
        try {
          const remainingItems = fs.readdirSync(fullPath);
          if (remainingItems.length === 0) {
            fs.rmdirSync(fullPath);
            log(`🗑️ Removido diretório vazio: ${path.relative(DEVOCIONAIS_DIR, fullPath)}`, 'cyan');
          }
        } catch (error) {
          // Ignorar erros de diretório não vazio
        }
      }
    }
  }
  
  removeEmptyDirs(DEVOCIONAIS_DIR);
  
  log('');
  log(`🎉 Reorganização concluída! ${movedCount} arquivos movidos.`, 'green');
  log('');
  log('📁 Nova estrutura:', 'bright');
  log('devocionais/', 'cyan');
  log('├── confianca-tempestade.json', 'cyan');
  log('├── confianca-tempestade.md', 'cyan');
  log('└── ...', 'cyan');
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { main };

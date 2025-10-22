#!/usr/bin/env node

/**
 * Script para sincronizar conteúdo com GitHub
 * 
 * Este script automatiza o processo de commit e push
 * para o repositório GitHub.
 */

const { execSync } = require('child_process');
const path = require('path');

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

function executeCommand(command, description) {
  try {
    log(`🔄 ${description}...`, 'blue');
    const output = execSync(command, { 
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8',
      stdio: 'pipe'
    });
    log(`✅ ${description} concluído`, 'green');
    return true;
  } catch (error) {
    log(`❌ Erro ao ${description.toLowerCase()}: ${error.message}`, 'red');
    return false;
  }
}

function main() {
  log('🚀 Sincronizando conteúdo com GitHub...', 'bright');
  log('', 'reset');
  
  const commands = [
    {
      command: 'git add .',
      description: 'Adicionando arquivos ao Git'
    },
    {
      command: 'git status',
      description: 'Verificando status do Git'
    },
    {
      command: 'git commit -m "Update generated content - ' + new Date().toISOString() + '"',
      description: 'Fazendo commit das mudanças'
    },
    {
      command: 'git push origin main',
      description: 'Enviando para GitHub'
    }
  ];
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const cmd of commands) {
    if (executeCommand(cmd.command, cmd.description)) {
      successCount++;
    } else {
      errorCount++;
    }
    log('', 'reset');
  }
  
  log('📊 Resumo da Sincronização:', 'bright');
  log(`   ✅ Comandos executados: ${successCount}`, 'green');
  log(`   ❌ Erros: ${errorCount}`, errorCount > 0 ? 'red' : 'green');
  log('', 'reset');
  
  if (errorCount === 0) {
    log('🎉 Sincronização concluída com sucesso!', 'green');
    log('', 'reset');
    log('📝 Próximos passos:', 'bright');
    log('   1. Aguarde alguns minutos para o GitHub processar', 'cyan');
    log('   2. Teste o sistema de fetch novamente', 'cyan');
    log('   3. Implemente o botão de atualização no app', 'cyan');
  } else {
    log('⚠️  Alguns comandos falharam. Verifique manualmente:', 'yellow');
    log('', 'reset');
    log('🔧 Comandos manuais:', 'bright');
    log('   cd content', 'cyan');
    log('   git add .', 'cyan');
    log('   git commit -m "Update content"', 'cyan');
    log('   git push origin main', 'cyan');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { main };

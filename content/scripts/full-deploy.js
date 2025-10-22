#!/usr/bin/env node

/**
 * Script de Deploy Completo para GitHub
 * 
 * Este script executa todo o processo:
 * 1. Build do conteúdo
 * 2. Validação
 * 3. Deploy para GitHub
 * 4. Commit e Push
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
    return { success: true, output };
  } catch (error) {
    log(`❌ Erro ao ${description.toLowerCase()}: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function main() {
  log('🚀 Deploy Completo para GitHub - Faith Scroll Content', 'bright');
  log('', 'reset');
  
  const steps = [
    {
      command: 'node scripts/build.js',
      description: 'Executando build do conteúdo'
    },
    {
      command: 'node scripts/validate.js',
      description: 'Validando estrutura do conteúdo'
    },
    {
      command: 'node scripts/deploy-to-github.js',
      description: 'Preparando arquivos para GitHub'
    },
    {
      command: 'git add .',
      description: 'Adicionando arquivos ao Git'
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
  const results = [];
  
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    log(`\n📋 Passo ${i + 1}/${steps.length}: ${step.description}`, 'bright');
    
    const result = executeCommand(step.command, step.description);
    results.push({ step: step.description, ...result });
    
    if (result.success) {
      successCount++;
    } else {
      errorCount++;
    }
  }
  
  log('\n📊 Resumo do Deploy:', 'bright');
  log('='.repeat(50));
  log(`✅ Sucessos: ${successCount}`, 'green');
  log(`❌ Erros: ${errorCount}`, errorCount > 0 ? 'red' : 'green');
  log('', 'reset');
  
  // Mostrar detalhes dos erros
  const errors = results.filter(r => !r.success);
  if (errors.length > 0) {
    log('❌ Erros encontrados:', 'red');
    errors.forEach(error => {
      log(`   • ${error.step}: ${error.error}`, 'red');
    });
    log('', 'reset');
  }
  
  if (errorCount === 0) {
    log('🎉 Deploy concluído com sucesso!', 'green');
    log('', 'reset');
    log('📝 Próximos passos:', 'bright');
    log('   1. Aguarde 2-3 minutos para o GitHub processar', 'cyan');
    log('   2. Teste o sistema de fetch: node test-fetch.js', 'cyan');
    log('   3. Implemente o botão de atualização no app', 'cyan');
    log('', 'reset');
    log('🔗 URLs para testar:', 'bright');
    log('   • https://raw.githubusercontent.com/renanduart3/scroll-repository/main/generated/index.json', 'cyan');
    log('   • https://raw.githubusercontent.com/renanduart3/scroll-repository/main/generated/estudos.json', 'cyan');
  } else {
    log('⚠️  Deploy parcialmente concluído', 'yellow');
    log('', 'reset');
    log('🔧 Comandos manuais para finalizar:', 'bright');
    log('   cd content', 'cyan');
    log('   git add .', 'cyan');
    log('   git commit -m "Update content"', 'cyan');
    log('   git push origin main', 'cyan');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };

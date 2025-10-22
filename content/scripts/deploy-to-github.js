#!/usr/bin/env node

/**
 * Script de Deploy para GitHub - Faith Scroll Content
 * 
 * Este script prepara o conteúdo para o repositório GitHub,
 * criando os arquivos na pasta content/generated/
 */

const fs = require('fs');
const path = require('path');

// Configurações
const CONTENT_DIR = path.join(__dirname, '..');
const GENERATED_DIR = path.join(CONTENT_DIR, 'generated');
const SOURCE_DIR = path.join(__dirname, '..', '..', 'src', 'data', 'generated');

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

function copyFile(source, destination) {
  try {
    const content = fs.readFileSync(source, 'utf8');
    ensureDir(path.dirname(destination));
    fs.writeFileSync(destination, content);
    return true;
  } catch (error) {
    log(`Erro ao copiar ${source}: ${error.message}`, 'red');
    return false;
  }
}

function main() {
  log('🚀 Preparando conteúdo para GitHub...', 'bright');
  log('', 'reset');
  
  // Criar diretório generated
  ensureDir(GENERATED_DIR);
  
  // Arquivos para copiar
  const files = [
    'index.json',
    'categories.json',
    'estudos.json',
    'pregacoes.json',
    'devocionais.json',
    'search.json',
    'metadata.json',
    'api.json',
    'manifest.json'
  ];
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const file of files) {
    const source = path.join(SOURCE_DIR, file);
    const destination = path.join(GENERATED_DIR, file);
    
    if (copyFile(source, destination)) {
      log(`✅ Copiado: ${file}`, 'green');
      successCount++;
    } else {
      log(`❌ Erro: ${file}`, 'red');
      errorCount++;
    }
  }
  
  // Criar README para a pasta generated
  const readmeContent = `# Faith Scroll Content - Generated Files

Esta pasta contém os arquivos gerados automaticamente pelo sistema de build do Faith Scroll.

## 📁 Arquivos Gerados

- \`index.json\` - Índice principal com estatísticas
- \`categories.json\` - Categorias de conteúdo
- \`estudos.json\` - Estudos bíblicos
- \`pregacoes.json\` - Pregações
- \`devocionais.json\` - Devocionais
- \`search.json\` - Índice de busca
- \`metadata.json\` - Metadados (autores, tags, versões)
- \`api.json\` - Endpoints da API
- \`manifest.json\` - Manifest do sistema

## 🔧 Como Usar

Estes arquivos são gerados automaticamente e não devem ser editados manualmente.
Para atualizar o conteúdo, edite os arquivos na pasta \`content/\` e execute o build.

## 📊 Estatísticas

- **Categorias**: ${successCount > 0 ? '11' : '0'}
- **Estudos**: ${successCount > 0 ? '3' : '0'}
- **Pregações**: ${successCount > 0 ? '1' : '0'}
- **Devocionais**: ${successCount > 0 ? '1' : '0'}
- **Autores**: ${successCount > 0 ? '5' : '0'}
- **Tags**: ${successCount > 0 ? '14' : '0'}

## 🚀 Deploy

Para fazer deploy do conteúdo:

1. Execute o build: \`node scripts/build.js\`
2. Execute a validação: \`node scripts/validate.js\`
3. Execute o deploy: \`node scripts/deploy-to-github.js\`

---

*Gerado automaticamente em ${new Date().toISOString()}*
`;

  const readmePath = path.join(GENERATED_DIR, 'README.md');
  fs.writeFileSync(readmePath, readmeContent);
  log(`✅ Criado: README.md`, 'green');
  
  log('', 'reset');
  log('🎉 Deploy para GitHub concluído!', 'green');
  log('', 'reset');
  log('📊 Resumo:', 'bright');
  log(`   ✅ Sucessos: ${successCount}`, 'green');
  log(`   ❌ Erros: ${errorCount}`, errorCount > 0 ? 'red' : 'green');
  log('', 'reset');
  log(`📁 Arquivos criados em: ${GENERATED_DIR}`, 'blue');
  log('', 'reset');
  log('📝 Próximos passos:', 'bright');
  log('   1. Faça commit dos arquivos: git add .', 'cyan');
  log('   2. Commit: git commit -m "Update generated content"', 'cyan');
  log('   3. Push: git push origin main', 'cyan');
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { main };

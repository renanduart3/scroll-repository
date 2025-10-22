/**
 * Script para testar o sistema de fetch do repositório GitHub
 * Execute com: node test-fetch.js
 */

const GITHUB_REPO = 'https://raw.githubusercontent.com/renanduart3/scroll-repository/main';

async function testFetch() {
  console.log('🔍 Testando acesso ao repositório GitHub...\n');
  
  const files = [
    'README.md',
    'generated/index.json',
    'generated/estudos.json',
    'generated/categories.json',
    'generated/search.json'
  ];

  const results = [];

  for (const file of files) {
    try {
      console.log(`📁 Testando: ${file}`);
      const response = await fetch(`${GITHUB_REPO}/${file}`);
      
      if (response.ok) {
        const content = await response.text();
        const size = content.length;
        console.log(`✅ Sucesso: ${file} (${size} bytes)`);
        results.push({ file, status: 'success', size });
      } else {
        console.log(`❌ Erro: ${file} - HTTP ${response.status}`);
        results.push({ file, status: 'error', error: `HTTP ${response.status}` });
      }
    } catch (error) {
      console.log(`❌ Erro: ${file} - ${error.message}`);
      results.push({ file, status: 'error', error: error.message });
    }
    console.log('');
  }

  // Resumo dos resultados
  console.log('📊 Resumo dos Testes:');
  console.log('='.repeat(50));
  
  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status === 'error');
  
  console.log(`✅ Sucessos: ${successful.length}`);
  console.log(`❌ Falhas: ${failed.length}`);
  
  if (successful.length > 0) {
    console.log('\n📁 Arquivos acessíveis:');
    successful.forEach(r => {
      console.log(`  • ${r.file} (${r.size} bytes)`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ Arquivos com erro:');
    failed.forEach(r => {
      console.log(`  • ${r.file}: ${r.error}`);
    });
  }

  // Teste específico do sistema de atualização
  console.log('\n🔧 Testando sistema de atualização...');
  
  try {
    const versionResponse = await fetch(`${GITHUB_REPO}/generated/index.json`);
    if (versionResponse.ok) {
      const versionData = await versionResponse.json();
      console.log('✅ Versão encontrada:', versionData.version);
      console.log('📅 Data de build:', versionData.buildDate);
      console.log('📊 Conteúdo disponível:');
      console.log(`  • Categorias: ${versionData.content.categories}`);
      console.log(`  • Estudos: ${versionData.content.estudos}`);
      console.log(`  • Pregações: ${versionData.content.pregacoes}`);
      console.log(`  • Devocionais: ${versionData.content.devocionais}`);
    } else {
      console.log('❌ Não foi possível acessar o arquivo de versão');
    }
  } catch (error) {
    console.log('❌ Erro ao testar sistema de atualização:', error.message);
  }

  // Recomendações
  console.log('\n💡 Recomendações:');
  console.log('='.repeat(50));
  
  if (failed.length === 0) {
    console.log('🎉 Todos os testes passaram! O sistema está funcionando perfeitamente.');
    console.log('✅ Você pode implementar o sistema de atualização no app.');
  } else if (successful.length > 0) {
    console.log('⚠️  Alguns arquivos estão acessíveis, mas outros não.');
    console.log('🔧 Verifique se os arquivos gerados foram enviados para o repositório.');
    console.log('📝 Execute: npm run build && npm run deploy no repositório de conteúdo.');
  } else {
    console.log('❌ Nenhum arquivo está acessível.');
    console.log('🔧 Verifique se o repositório existe e está público.');
    console.log('📝 Verifique se os arquivos foram enviados corretamente.');
  }
}

// Executar o teste
testFetch().catch(console.error);

#!/usr/bin/env node

/**
 * Script de Build para o repositório de conteúdo (scroll-repository)
 *
 * Gera a pasta `generated/` na raiz do repositório com índices otimizados.
 * Categorias de estudos são derivadas automaticamente pelo app a partir do
 * campo `category` dos estudos. Portanto, não geramos `categories.json` aqui.
 */

const fs = require('fs');
const path = require('path');

// Diretórios base
const REPO_ROOT = path.join(__dirname, '..');
// Se a pasta `content/` não existir, use a raiz do repositório como base
const CONTENT_DIR = fs.existsSync(path.join(REPO_ROOT, 'content'))
  ? path.join(REPO_ROOT, 'content')
  : REPO_ROOT;
const OUTPUT_DIR = path.join(REPO_ROOT, 'generated');

// Cores para logs
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
      } else if (!extension || item.endsWith(extension)) {
        files.push(fullPath);
      }
    }
  }
  traverse(dir);
  return files;
}

/**
 * Renomeia arquivos baseado no content_file definido no JSON
 * Mantém correspondência JSON <-> MD com o mesmo slug
 */
function renameFilesBasedOnContentFile(contentDir, type) {
  log(`🔄 Renomeando arquivos para ${type}...`, 'blue');

  const typeDir = path.join(contentDir, type);
  if (!fs.existsSync(typeDir)) {
    log(`⚠️ Diretório ${type} não encontrado`, 'yellow');
    return 0;
  }

  const jsonFiles = getAllFiles(typeDir, '.json');
  let renamedCount = 0;

  for (const jsonFile of jsonFiles) {
    const jsonData = readJsonFile(jsonFile);
    if (!jsonData || !jsonData.content_file) continue;

    const expectedMdFile = jsonData.content_file;
    const expectedJsonFile = expectedMdFile.replace('.md', '.json');

    const currentDir = path.dirname(jsonFile);
    const currentJsonName = path.basename(jsonFile);
    const currentMdName = currentJsonName.replace('.json', '.md');

    const newJsonFile = path.join(currentDir, expectedJsonFile);
    const newMdFile = path.join(currentDir, expectedMdFile);

    let changed = false;

    try {
      // Renomear JSON se necessário
      if (currentJsonName !== expectedJsonFile && fs.existsSync(jsonFile)) {
        fs.renameSync(jsonFile, newJsonFile);
        log(`  📝 Renomeado: ${currentJsonName} → ${expectedJsonFile}`, 'green');
        changed = true;
      }

      // Garantir que o MD tenha o nome esperado
      if (!fs.existsSync(newMdFile)) {
        const candidates = [
          path.join(currentDir, currentMdName),
          path.join(currentDir, currentJsonName.replace('json_', 'md_').replace('.json', '.md')),
          path.join(currentDir, currentJsonName.replace('_json', '_md').replace('.json', '.md'))
        ];

        const sourceMd = candidates.find(p => fs.existsSync(p));

        if (sourceMd) {
          fs.renameSync(sourceMd, newMdFile);
          log(`  📄 Renomeado: ${path.basename(sourceMd)} → ${expectedMdFile}`, 'green');
          changed = true;
        } else {
          // Se não encontrou candidato mas o arquivo esperado não existe, avisa
          log(`  ⚠️ MD esperado não encontrado: ${expectedMdFile} (dir: ${currentDir})`, 'yellow');
        }
      }

      if (changed) renamedCount++;
    } catch (error) {
      log(`  ❌ Erro ao renomear par JSON/MD (${currentJsonName}): ${error.message}`, 'red');
    }
  }

  if (renamedCount > 0) {
    log(`✅ ${renamedCount} arquivos renomeados para ${type}`, 'green');
  } else {
    log(`✅ Nenhum arquivo precisou ser renomeado para ${type}`, 'cyan');
  }
  return renamedCount;
}

function buildEstudos() {
  log('📚 Processando estudos...', 'blue');

  renameFilesBasedOnContentFile(CONTENT_DIR, 'estudos');

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

    if (estudo.category) {
      if (!byCategory[estudo.category]) byCategory[estudo.category] = [];
      byCategory[estudo.category].push(estudo);
    }

    if (estudo.author) {
      if (!byAuthor[estudo.author]) byAuthor[estudo.author] = [];
      byAuthor[estudo.author].push(estudo);
    }

    (estudo.tags || []).forEach(tag => {
      if (!byTag[tag]) byTag[tag] = [];
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

  renameFilesBasedOnContentFile(CONTENT_DIR, 'pregacoes');

  const dir = path.join(CONTENT_DIR, 'pregacoes');
  const files = getAllFiles(dir, '.json');

  const pregacoes = [];
  const byAuthor = {};
  const byTag = {};

  for (const file of files) {
    const item = readJsonFile(file);
    if (!item) continue;
    pregacoes.push(item);

    if (item.author) {
      if (!byAuthor[item.author]) byAuthor[item.author] = [];
      byAuthor[item.author].push(item);
    }
    (item.tags || []).forEach(tag => {
      if (!byTag[tag]) byTag[tag] = [];
      byTag[tag].push(item);
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

  renameFilesBasedOnContentFile(CONTENT_DIR, 'devocionais');

  const dir = path.join(CONTENT_DIR, 'devocionais');
  const files = getAllFiles(dir, '.json');

  const devocionais = [];
  const byDate = {};
  const byAuthor = {};
  const byTag = {};

  for (const file of files) {
    const item = readJsonFile(file);
    if (!item) continue;
    devocionais.push(item);

    if (item.date) {
      const date = item.date.split('T')[0];
      if (!byDate[date]) byDate[date] = [];
      byDate[date].push(item);
    }

    if (item.author) {
      if (!byAuthor[item.author]) byAuthor[item.author] = [];
      byAuthor[item.author].push(item);
    }

    (item.tags || []).forEach(tag => {
      if (!byTag[tag]) byTag[tag] = [];
      byTag[tag].push(item);
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

function buildAtualidades() {
  log('📰 Processando atualidades...', 'blue');

  renameFilesBasedOnContentFile(CONTENT_DIR, 'atualidades');

  const dir = path.join(CONTENT_DIR, 'atualidades');
  const files = getAllFiles(dir, '.json');

  const atualidades = [];
  const byAuthor = {};
  const byTag = {};

  for (const file of files) {
    const item = readJsonFile(file);
    if (!item) continue;
    atualidades.push(item);

    if (item.author) {
      if (!byAuthor[item.author]) byAuthor[item.author] = [];
      byAuthor[item.author].push(item);
    }
    (item.tags || []).forEach(tag => {
      if (!byTag[tag]) byTag[tag] = [];
      byTag[tag].push(item);
    });
  }

  const result = {
    atualidades,
    byAuthor,
    byTag,
    stats: {
      total: atualidades.length,
      byAuthor: Object.keys(byAuthor).length,
      byTag: Object.keys(byTag).length
    }
  };

  writeJsonFile(path.join(OUTPUT_DIR, 'atualidades.json'), result);
  log(`✅ Atualidades processadas: ${atualidades.length} total`, 'green');
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

  // Helpers para versionamento
  const bumpPatch = (v) => {
    const m = String(v).trim().match(/^(\d+)\.(\d+)\.(\d+)$/);
    if (!m) return v;
    const [major, minor, patch] = [Number(m[1]), Number(m[2]), Number(m[3])];
    return `${major}.${minor}.${patch + 1}`;
  };

  // Ordem de resolução da versão:
  // 1) SCROLL_VERSION (usa como está)
  // 2) Se não houver SCROLL_VERSION: base = versão existente em generated/index.json
  // 3) Senão: base = metadata/versions.json.current_version
  // 4) Senão: base = '1.0.0'
  // Quando não houver SCROLL_VERSION, faz bump de patch na base
  let resolvedVersion = process.env.SCROLL_VERSION || '1.0.0';
  try {
    if (!process.env.SCROLL_VERSION) {
      let baseVersion = '1.0.0';
      const existingIndex = readJsonFile(path.join(OUTPUT_DIR, 'index.json'));
      if (existingIndex?.version) {
        baseVersion = existingIndex.version;
      } else {
        const versionsMeta = readJsonFile(path.join(CONTENT_DIR, 'metadata', 'versions.json'));
        if (versionsMeta?.current_version) {
          baseVersion = versionsMeta.current_version;
        }
      }
      resolvedVersion = bumpPatch(baseVersion);
    } else {
      // SCROLL_VERSION definido: usa-o e não altera
      readJsonFile(path.join(CONTENT_DIR, 'metadata', 'versions.json')); // leitura opcional
    }
  } catch (_) {
    // ignora e mantém valor calculado
  }

  const index = {
    version: resolvedVersion,
    buildDate: new Date().toISOString(),
    content: {
      // Sem categories aqui — categorias são derivadas no app
      estudos: 0,
      pregacoes: 0,
      atualidades: 0,
      devocionais: 0,
      authors: 0,
      tags: 0
    },
    lastUpdated: new Date().toISOString()
  };

  try {
    const estudos = readJsonFile(path.join(OUTPUT_DIR, 'estudos.json'));
    if (estudos) index.content.estudos = estudos.stats.total;

    const pregacoes = readJsonFile(path.join(OUTPUT_DIR, 'pregacoes.json'));
    if (pregacoes) index.content.pregacoes = pregacoes.stats.total;

    const atualidades = readJsonFile(path.join(OUTPUT_DIR, 'atualidades.json'));
    if (atualidades) index.content.atualidades = atualidades.stats.total;

    const devocionais = readJsonFile(path.join(OUTPUT_DIR, 'devocionais.json'));
    if (devocionais) index.content.devocionais = devocionais.stats.total;

    const metadata = readJsonFile(path.join(OUTPUT_DIR, 'metadata.json'));
    if (metadata) {
      index.content.authors = metadata.authors?.authors?.length || 0;
      index.content.tags = metadata.tags?.tags?.length || 0;
    }
  } catch (error) {
    log(`⚠️ Aviso: Erro ao ler estatísticas: ${error.message}`, 'yellow');
  }

  writeJsonFile(path.join(OUTPUT_DIR, 'index.json'), index);
  log('✅ Índice principal gerado', 'green');
  return index;
}

function main() {
  log('🚀 Iniciando build do conteúdo (scroll-repository)...', 'bright');
  ensureDir(OUTPUT_DIR);

  const estudos = buildEstudos();
  const pregacoes = buildPregacoes();
  const atualidades = buildAtualidades();
  const devocionais = buildDevocionais();
  const metadata = buildMetadata();
  const index = buildIndex();

  log('', 'reset');
  log('🎉 Build concluído com sucesso!', 'green');
  log('📊 Resumo:', 'bright');
  log(`   📚 Estudos: ${index.content.estudos}`, 'cyan');
  log(`   📢 Pregações: ${index.content.pregacoes}`, 'cyan');
  log(`   📰 Atualidades: ${index.content.atualidades}`, 'cyan');
  log(`   📅 Devocionais: ${index.content.devocionais}`, 'cyan');
  log(`   👥 Autores: ${index.content.authors}`, 'cyan');
  log(`   🏷️ Tags: ${index.content.tags}`, 'cyan');
  log(`📁 Arquivos gerados em: ${OUTPUT_DIR}`, 'blue');
}

if (require.main === module) {
  main();
}

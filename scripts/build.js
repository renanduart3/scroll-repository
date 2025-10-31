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
// Bases de diretórios
const CONTENT_DIR_CANDIDATE = path.join(REPO_ROOT, 'content');
// JSON_BASE: onde ficam os .json (normalmente em content/, mas aceita raiz do repo)
const JSON_BASE = fs.existsSync(CONTENT_DIR_CANDIDATE) ? CONTENT_DIR_CANDIDATE : REPO_ROOT;
// CDN_BASE: onde os .md devem ficar publicados (raiz do repo)
const CDN_BASE = REPO_ROOT;
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

function parseArgs(argv) {
  const args = { repair: false };
  for (const a of argv.slice(2)) {
    if (a === '--repair' || a === '-r') args.repair = true;
  }
  return args;
}

function getLastBuildDate() {
  try {
    const existing = readJsonFile(path.join(OUTPUT_DIR, 'index.json'));
    if (existing?.buildDate) {
      const d = new Date(String(existing.buildDate).trim());
      if (!Number.isNaN(d.getTime())) return d;
    }
  } catch (_) {}
  return new Date(0);
}

/**
 * Renomeia arquivos baseado no content_file definido no JSON
 * Mantém correspondência JSON <-> MD com o mesmo slug
 */
function renameFilesBasedOnContentFile(contentDir, type, opts = {}) {
  log(`🔄 Renomeando arquivos para ${type}...`, 'blue');

  const typeDir = path.join(JSON_BASE, type);
  if (!fs.existsSync(typeDir)) {
    log(`⚠️ Diretório ${type} não encontrado`, 'yellow');
    return 0;
  }

  const allJsonFiles = getAllFiles(typeDir, '.json');
  const lastBuildDate = opts.lastBuildDate || new Date(0);
  const jsonFiles = opts.repair
    ? allJsonFiles
    : allJsonFiles.filter(f => {
        try {
          const st = fs.statSync(f);
          return st.mtime > lastBuildDate;
        } catch (_) {
          return true;
        }
      });
  let renamedCount = 0;

  for (const jsonFile of jsonFiles) {
    const jsonData = readJsonFile(jsonFile);
    if (!jsonData || !jsonData.content_file) continue;

    const expectedMdFile = jsonData.content_file;
    const expectedJsonFile = expectedMdFile.replace(/\.md$/i, '.json');

    const currentDir = path.dirname(jsonFile);
    const currentJsonName = path.basename(jsonFile);
    const currentMdName = currentJsonName.replace('.json', '.md');

    const needsRenameJson = currentJsonName !== expectedJsonFile;

    // Alvos esperados
    const newJsonFile = path.join(currentDir, expectedJsonFile);
    // Para Markdown, preferimos a árvore pública usada pelo CDN: <repo>/[type]/<category>/<expectedMdFile>
    const mdCdnDir = path.join(CDN_BASE, type, jsonData.category || '');
    ensureDir(mdCdnDir);
    const newMdCdnFile = path.join(mdCdnDir, expectedMdFile);

    // Candidatos onde o MD pode estar hoje
    const mdCandidates = [
      path.join(currentDir, currentMdName),
      path.join(currentDir, expectedMdFile),
      path.join(CDN_BASE, type, jsonData.category || '', currentMdName),
      path.join(CDN_BASE, type, jsonData.category || '', expectedMdFile),
    ].filter(Boolean);

    // Se nenhum candidato existir, tentar heurística: pegar único .md do diretório CDN da categoria
    const mdCdnFiles = fs.existsSync(mdCdnDir) ? fs.readdirSync(mdCdnDir).filter(f => f.endsWith('.md')) : [];
    let foundMd = mdCandidates.find(f => fs.existsSync(f));
    if (!foundMd) {
      // Tentar por id
      if (jsonData.id) {
        const byId = mdCdnFiles.find(f => f.includes(jsonData.id));
        if (byId) foundMd = path.join(mdCdnDir, byId);
      }
    }
    if (!foundMd) {
      // Se houver apenas um .md no diretório CDN dessa categoria, assumir que é ele
      if (mdCdnFiles.length === 1) {
        foundMd = path.join(mdCdnDir, mdCdnFiles[0]);
      }
    }

    try {
      // Renomear JSON se necessário
      if (needsRenameJson && fs.existsSync(jsonFile)) {
        if (fs.existsSync(newJsonFile) && path.resolve(newJsonFile) !== path.resolve(jsonFile)) {
          log(`  ⚠️ JSON de destino já existe, pulando: ${expectedJsonFile}`, 'yellow');
        } else {
          fs.renameSync(jsonFile, newJsonFile);
          log(`  📝 Renomeado JSON: ${currentJsonName} → ${expectedJsonFile}`, 'green');
          renamedCount++;
        }
      }
      // Renomear/copiar MD para o local CDN esperado, se encontrado e diferente do alvo
      if (foundMd && path.normalize(foundMd) !== path.normalize(newMdCdnFile)) {
        // Garantir diretório de destino
        ensureDir(path.dirname(newMdCdnFile));
        if (fs.existsSync(newMdCdnFile) && path.resolve(newMdCdnFile) !== path.resolve(foundMd)) {
          log(`  ⚠️ MD de destino já existe, pulando: ${expectedMdFile}`, 'yellow');
        } else {
          fs.renameSync(foundMd, newMdCdnFile);
          log(`  📄 MD alinhado: ${path.basename(foundMd)} → ${expectedMdFile} (em ${type}/${jsonData.category || ''})`, 'green');
          renamedCount++;
        }
      } else if (!foundMd) {
        log(`  ⚠️ MD não localizado para ${jsonData.id || currentJsonName}. Esperado: ${newMdCdnFile}`, 'yellow');
      }
    } catch (error) {
      log(`  ❌ Erro ao alinhar arquivos de ${currentJsonName}: ${error.message}`, 'red');
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

  const args = parseArgs(process.argv);
  const lastBuildDate = getLastBuildDate();
  renameFilesBasedOnContentFile(JSON_BASE, 'estudos', { repair: args.repair, lastBuildDate });

  const estudosDir = path.join(JSON_BASE, 'estudos');
  const estudoFiles = getAllFiles(estudosDir, '.json');

  const estudos = [];
  const byCategory = {};
  const byAuthor = {};
  const byTag = {};
  const diagnostics = {
    totalJson: 0,
    missingContentFile: [],
    missingMarkdown: [],
    unknownCategories: new Set(),
  };

  for (const file of estudoFiles) {
    const estudo = readJsonFile(file);
    if (!estudo) continue;
    diagnostics.totalJson++;
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

    // Diagnóstico: validar content_file e existência do Markdown
    if (!estudo.content_file) {
      diagnostics.missingContentFile.push(estudo.id || file);
    } else {
      const mdInJsonTree = path.join(JSON_BASE, 'estudos', estudo.category || '', estudo.content_file);
      const mdInCdnTree = path.join(CDN_BASE, 'estudos', estudo.category || '', estudo.content_file);
      const mdExists = fs.existsSync(mdInJsonTree) || fs.existsSync(mdInCdnTree);
      if (!mdExists) {
        diagnostics.missingMarkdown.push({ id: estudo.id || file, pathsTried: [mdInJsonTree, mdInCdnTree] });
      }
    }

    // Diagnóstico: categorias conhecidas
    const known = new Set(['lideranca','familia','pessoas-da-biblia','oracoes','ocultismo','livros-ebooks','curiosidades','temas-gerais','heresias','seitas','espiritualidade']);
    if (estudo.category && !known.has(estudo.category)) {
      diagnostics.unknownCategories.add(estudo.category);
    }
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
  // Resumo por categoria e diagnósticos úteis
  const catSummary = Object.keys(byCategory).sort().map(c => `${c}:${byCategory[c].length}`).join(', ');
  log(`📂 Categorias encontradas: ${catSummary || 'nenhuma'}`, 'cyan');
  if (diagnostics.missingContentFile.length > 0) {
    log(`⚠️ Estudos sem content_file: ${diagnostics.missingContentFile.join(', ')}`, 'yellow');
  }
  if (diagnostics.missingMarkdown.length > 0) {
    diagnostics.missingMarkdown.forEach(m => {
      log(`⚠️ Markdown não encontrado para ${m.id}. Verificados: ${m.pathsTried.join(' | ')}`,'yellow');
    });
  }
  if (diagnostics.unknownCategories.size > 0) {
    log(`⚠️ Categorias desconhecidas: ${Array.from(diagnostics.unknownCategories).join(', ')}`,'yellow');
  }
  return result;
}

function buildPregacoes() {
  log('📢 Processando pregações...', 'blue');

  const args = parseArgs(process.argv);
  const lastBuildDate = getLastBuildDate();
  renameFilesBasedOnContentFile(JSON_BASE, 'pregacoes', { repair: args.repair, lastBuildDate });

  const dir = path.join(JSON_BASE, 'pregacoes');
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

  const args = parseArgs(process.argv);
  const lastBuildDate = getLastBuildDate();
  renameFilesBasedOnContentFile(JSON_BASE, 'devocionais', { repair: args.repair, lastBuildDate });

  const dir = path.join(JSON_BASE, 'devocionais');
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

  const args = parseArgs(process.argv);
  const lastBuildDate = getLastBuildDate();
  renameFilesBasedOnContentFile(JSON_BASE, 'atualidades', { repair: args.repair, lastBuildDate });

  const dir = path.join(JSON_BASE, 'atualidades');
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

  const metadataDir = path.join(JSON_BASE, 'metadata');
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

  const normalize = (v) => (typeof v === 'string' ? v.trim() : v);
  const bump = (v) => {
    const s = String(normalize(v));
    let m = s.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/); // 4-part
    if (m) {
      const [a,b,c,d] = [Number(m[1]),Number(m[2]),Number(m[3]),Number(m[4])+1];
      return `${a}.${b}.${c}.${d}`;
    }
    m = s.match(/^(\d+)\.(\d+)\.(\d+)$/); // 3-part
    if (m) {
      const [a,b,c] = [Number(m[1]),Number(m[2]),Number(m[3])+1];
      return `${a}.${b}.${c}`;
    }
    return s || '1.0.0';
  };

  let version = '1.0.0';
  try {
    if (process.env.SCROLL_VERSION) {
      version = String(process.env.SCROLL_VERSION).trim();
    } else {
      const existing = readJsonFile(path.join(OUTPUT_DIR, 'index.json'));
      if (existing?.version) {
        version = bump(existing.version);
      } else {
        const versionsMeta = readJsonFile(path.join(JSON_BASE, 'metadata', 'versions.json'));
        version = versionsMeta?.current_version ? bump(versionsMeta.current_version) : '1.0.1';
      }
    }
  } catch (_) {}

  const index = {
    version,
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
  log(`🗂️ JSON_BASE: ${JSON_BASE}`, 'cyan');
  log(`🗂️ CDN_BASE:  ${CDN_BASE}`, 'cyan');
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

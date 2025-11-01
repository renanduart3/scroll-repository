#!/usr/bin/env node

/**
 * Script de reparo completo
 * - Varre atualidades, devocionais, pregacoes e todas as subpastas de estudos
 * - Garante que cada par JSON/MD siga o content_file do JSON
 * - Renomeia JSON para o mesmo slug do MD (trocando .md -> .json)
 * - Renomeia/copila MD para o caminho público esperado (CDN tree)
 * - Ao final, reseta a versão em generated/index.json para 1.0.0.1
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');
const CONTENT_DIR_CANDIDATE = path.join(REPO_ROOT, 'content');
const JSON_BASE = fs.existsSync(CONTENT_DIR_CANDIDATE) ? CONTENT_DIR_CANDIDATE : REPO_ROOT;
const CDN_BASE = REPO_ROOT;
const OUTPUT_DIR = path.join(REPO_ROOT, 'generated');

const colors = {
  reset: '\x1b[0m', bright: '\x1b[1m', red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m'
};
const log = (m,c='reset') => console.log(`${colors[c]}${m}${colors.reset}`);

function ensureDir(dir){ if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true}); }
function readJsonFile(file){ try{ return JSON.parse(fs.readFileSync(file,'utf8')); }catch{ return null; } }
function getAllFiles(dir, ext){ const out=[]; (function walk(d){ if(!fs.existsSync(d)) return; for(const it of fs.readdirSync(d)){ const p=path.join(d,it); const st=fs.statSync(p); if(st.isDirectory()) walk(p); else if(!ext||it.endsWith(ext)) out.push(p);} })(dir); return out; }

function repairType(type){
  log(`🔧 Reparando tipo: ${type}`, 'blue');
  const baseDir = path.join(JSON_BASE, type);
  if(!fs.existsSync(baseDir)){ log(`⚠️ Diretório ${type} não encontrado`, 'yellow'); return 0; }

  const jsonFiles = getAllFiles(baseDir, '.json');
  let changed = 0;
  for(const jf of jsonFiles){
    const data = readJsonFile(jf);
    if(!data || !data.content_file) continue;
    const expectedMd = data.content_file;
    const expectedJson = expectedMd.replace(/\.md$/i, '.json');

    const dir = path.dirname(jf);
    const currentJson = path.basename(jf);
    // MD deve ficar ao lado do JSON (mesma pasta)
    const mdTarget = path.join(dir, expectedMd);

    // localizar MD
    const mdCandidates = [
      path.join(dir, expectedMd),
      path.join(dir, currentJson.replace('.json','.md')),
      // possíveis locais errôneos (subpasta igual ao tipo ou à categoria)
      path.join(dir, type, expectedMd),
      path.join(dir, type, currentJson.replace('.json','.md')),
      path.join(dir, (data.category||''), expectedMd),
      path.join(dir, (data.category||''), currentJson.replace('.json','.md'))
    ];
    let mdSource = mdCandidates.find(p => fs.existsSync(p));
    if(!mdSource){
      const mdFiles = fs.existsSync(dir) ? fs.readdirSync(dir).filter(n=>n.endsWith('.md')):[];
      if(mdFiles.length===1) mdSource = path.join(dir, mdFiles[0]);
    }

    try{
      // JSON -> expected
      if(currentJson !== expectedJson){
        const jsonTarget = path.join(dir, expectedJson);
        if(!fs.existsSync(jsonTarget) || path.resolve(jsonTarget)===path.resolve(jf)){
          fs.renameSync(jf, jsonTarget);
          log(`  📝 JSON: ${currentJson} → ${expectedJson}`, 'green');
          changed++;
        } else {
          log(`  ⚠️ JSON alvo existe, pulando: ${expectedJson}`, 'yellow');
        }
      }

      // MD -> expected content_file sob CDN tree
      if(mdSource && path.normalize(mdSource)!==path.normalize(mdTarget)){
        ensureDir(path.dirname(mdTarget));
        if(!fs.existsSync(mdTarget) || path.resolve(mdTarget)===path.resolve(mdSource)){
          fs.renameSync(mdSource, mdTarget);
          log(`  📄 MD: ${path.basename(mdSource)} → ${expectedMd}`, 'green');
          changed++;
        }else{
          log(`  ⚠️ MD alvo existe, pulando: ${expectedMd}`, 'yellow');
        }
      }else if(!mdSource){
        log(`  ⚠️ MD não encontrado para ${data.id || currentJson}. Esperado: ${mdTarget}`, 'yellow');
      }
    }catch(e){
      log(`  ❌ Erro reparando ${currentJson}: ${e.message}`, 'red');
    }
  }
  return changed;
}

function resetIndexVersion(){
  ensureDir(OUTPUT_DIR);
  const idxPath = path.join(OUTPUT_DIR,'index.json');
  const idx = readJsonFile(idxPath) || { version: '1.0.0.1', buildDate: new Date().toISOString(), lastUpdated: new Date().toISOString(), content: {estudos:0,pregacoes:0,atualidades:0,devocionais:0,authors:0,tags:0}};
  idx.version = '1.0.0.1';
  idx.buildDate = new Date().toISOString();
  idx.lastUpdated = idx.buildDate;
  fs.writeFileSync(idxPath, JSON.stringify(idx,null,2));
  log(`✅ Versão resetada para ${idx.version} em generated/index.json`, 'green');
}

function main(){
  log('🛠️  Iniciando reparo geral...', 'bright');
  const total = [
    repairType('estudos'),
    repairType('pregacoes'),
    repairType('atualidades'),
    repairType('devocionais'),
  ].reduce((a,b)=>a+(b||0),0);
  resetIndexVersion();
  log(`🎉 Reparo concluído. Arquivos ajustados: ${total}`, 'green');
}

if(require.main===module){
  main();
}

module.exports = { main };

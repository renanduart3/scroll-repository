/**
 * Serviço para atualização de conteúdo do Faith Scroll
 * Busca conteúdo do repositório GitHub e atualiza o cache local
 */

import { IndexedDBCache } from './IndexedDBCache';

export interface ContentVersion {
  version: string;
  buildDate: string;
  lastUpdated: string;
  content: {
    categories: number;
    estudos: number;
    pregacoes: number;
    devocionais: number;
    authors: number;
    tags: number;
  };
}

export interface UpdateResult {
  success: boolean;
  message: string;
  newVersion?: string;
  oldVersion?: string;
}

export class ContentUpdater {
  private readonly GITHUB_REPO = 'https://raw.githubusercontent.com/renanduart3/scroll-repository/master';
  private readonly CACHE_KEY = 'faith_scroll_content';
  private readonly VERSION_KEY = 'faith_scroll_version';
  private cache: IndexedDBCache;

  constructor() {
    this.cache = new IndexedDBCache();
    console.log('🏗️ ContentUpdater criado com IndexedDB cache');
  }

  /**
   * Verifica se há atualizações disponíveis
   */
  async checkForUpdates(): Promise<{ hasUpdate: boolean; currentVersion: string; latestVersion: string }> {
    console.log('🔍 INICIANDO VERIFICAÇÃO DE ATUALIZAÇÕES...');
    
    try {
      const currentVersion = this.getLocalVersion();
      console.log(`📋 Versão atual em cache: ${currentVersion}`);
      
      // Sempre verificar versão remota para garantir que temos a versão mais recente
      console.log('🌐 Verificando versão remota no GitHub...');
      const latestVersion = await this.getRemoteVersion();
      console.log(`📋 Versão remota encontrada: ${latestVersion}`);
      
      // Verificar se a versão local está desatualizada comparando com o cache
      const cachedContent = this.getCachedContent();
      let actualLocalVersion = currentVersion;
      
      if (cachedContent && cachedContent.index && cachedContent.index.version) {
        actualLocalVersion = cachedContent.index.version;
        console.log(`📋 Versão real no cache: ${actualLocalVersion}`);
        
        // Se a versão no cache for diferente da versão salva, atualizar
        if (actualLocalVersion !== currentVersion) {
          console.log(`🔄 Atualizando versão salva: ${currentVersion} → ${actualLocalVersion}`);
          this.setLocalVersion(actualLocalVersion);
        }
      }
      
      const hasUpdate = latestVersion !== actualLocalVersion;
      console.log(`🔄 Há atualização? ${hasUpdate} (remota: ${latestVersion} vs local: ${actualLocalVersion})`);
      
      return {
        hasUpdate,
        currentVersion: actualLocalVersion,
        latestVersion
      };
    } catch (error) {
      console.error('❌ ERRO ao verificar atualizações:', error);
      return {
        hasUpdate: false,
        currentVersion: this.getLocalVersion(),
        latestVersion: this.getLocalVersion()
      };
    }
  }

  /**
   * Atualiza o conteúdo do repositório
   */
  async updateContent(): Promise<UpdateResult> {
    try {
      const currentVersion = this.getLocalVersion();
      
      console.log('🔄 FORÇANDO ATUALIZAÇÃO - Baixando conteúdo do GitHub...');
      
      // Sempre baixar do GitHub e substituir cache local
      const content = await this.downloadContent();
      await this.saveContent(content);
      const newVersion = await this.getVersionFromContent(content);
      this.setLocalVersion(newVersion);
      
      console.log(`✅ Conteúdo atualizado com sucesso! Versão ${currentVersion} → ${newVersion}`);
      
      return {
        success: true,
        message: `Conteúdo baixado e atualizado com sucesso! Versão ${newVersion}`,
        newVersion,
        oldVersion: currentVersion
      };
    } catch (error) {
      console.error('Erro ao atualizar conteúdo:', error);
      return {
        success: false,
        message: `Erro ao atualizar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        newVersion: this.getLocalVersion(),
        oldVersion: this.getLocalVersion()
      };
    }
  }

  /**
   * Carrega o conteúdo (local ou remoto)
   */
  async loadContent(): Promise<any> {
    try {
      // Tentar carregar do cache local primeiro
      const cachedContent = this.getCachedContent();
      if (cachedContent) {
        console.log('📦 Carregando conteúdo do cache local');
        return cachedContent;
      }
      
      // Tentar carregar conteúdo local primeiro (modo desenvolvimento)
      try {
        console.log('🔍 Tentando carregar conteúdo local...');
        const localContent = await this.loadLocalContent();
        if (localContent) {
          console.log('✅ Conteúdo local carregado com sucesso');
          await this.saveContent(localContent);
          return localContent;
        }
      } catch (localError) {
        console.log('⚠️ Conteúdo local não disponível, tentando repositório...');
      }
      
      // Se não houver cache local, tentar baixar do repositório
      console.log('🌐 Baixando conteúdo do repositório GitHub...');
      const content = await this.downloadContent();
      await this.saveContent(content);
      console.log('✅ Conteúdo baixado e salvo no cache local');
      return content;
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error);
      // Fallback para conteúdo embarcado
      console.log('⚠️ Usando conteúdo embarcado como fallback');
      return this.getEmbeddedContent();
    }
  }

  /**
   * Carrega conteúdo local (modo desenvolvimento)
   */
  async loadLocalContent(): Promise<any> {
    // Inicializar IndexedDB se necessário
    if (!this.cache.isAvailable()) {
      console.warn('⚠️ IndexedDB não disponível, usando localStorage');
      return this.loadFromLocalStorage();
    }

    await this.cache.init();

    // Tentar carregar metadados do IndexedDB
    const cachedContent = await this.cache.getMetadata('content');
    if (cachedContent) {
      console.log('📋 Carregando conteúdo do IndexedDB...');
      return cachedContent;
    }
    
    // Se não houver cache, baixar do GitHub
    console.log('🌐 Cache não encontrado, baixando do GitHub...');
    const content = await this.downloadContent();
    await this.saveContent(content);
    return content;
  }

  /**
   * Fallback para localStorage
   */
  private loadFromLocalStorage(): any {
    const cachedContent = this.getCachedContent();
    if (cachedContent) {
      console.log('📋 Carregando conteúdo do localStorage...');
      return cachedContent;
    }
    
    console.log('🌐 Cache local não encontrado, baixando do GitHub...');
    return null;
  }

  /**
   * Obtém a versão dos arquivos locais
   */
  private async getLocalVersionFromFiles(): Promise<string | null> {
    try {
      console.log('🌐 Fazendo fetch para /generated/index.json...');
      const response = await fetch('/generated/index.json');
      console.log(`📡 Resposta do fetch: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        console.log(`❌ Erro no fetch: ${response.status} ${response.statusText}`);
        return null;
      }
      
      const data = await response.json();
      console.log('📄 Dados recebidos:', data);
      const version = data.version || null;
      console.log(`📋 Versão extraída: ${version}`);
      return version;
    } catch (error) {
      console.log('❌ Erro ao fazer fetch:', error);
      return null;
    }
  }

  /**
   * Obtém a versão local
   */
  private getLocalVersion(): string {
    const version = localStorage.getItem(this.VERSION_KEY);
    console.log(`📋 getLocalVersion() retornando: ${version} (chave: ${this.VERSION_KEY})`);
    return version || '0.0.0'; // Versão inicial quando não há cache
  }

  /**
   * Obtém a versão do conteúdo
   */
  private async getVersionFromContent(content: any): Promise<string> {
    if (content.index && content.index.version) {
      console.log(`📋 Versão encontrada no index.json: ${content.index.version}`);
      return content.index.version;
    }
    console.log('⚠️ Versão não encontrada no index.json, usando padrão 1.0.0');
    return '1.0.0'; // Versão padrão
  }

  /**
   * Obtém o conteúdo Markdown do cache
   */
  async getMarkdownContent(type: 'estudos' | 'pregacoes' | 'atualidades' | 'devocionais', id: string): Promise<string | null> {
    if (this.cache.isAvailable()) {
      await this.cache.init();
      const content = await this.cache.getFile(type, id);
      if (content) {
        console.log(`📄 Conteúdo Markdown encontrado no IndexedDB para ${type}/${id}`);
        return content;
      }
    }
    
    // Fallback para localStorage
    const key = `markdown_${type}_${id}`;
    const content = localStorage.getItem(key);
    if (content) {
      console.log(`📄 Conteúdo Markdown encontrado no localStorage para ${type}/${id}`);
    } else {
      console.warn(`⚠️ Conteúdo Markdown não encontrado para ${type}/${id}`);
    }
    return content;
  }

  /**
   * Define a versão local
   */
  private setLocalVersion(version: string): void {
    localStorage.setItem(this.VERSION_KEY, version);
  }

  /**
   * Obtém a versão remota
   */
  private async getRemoteVersion(): Promise<string> {
    try {
      console.log('🔍 Verificando versão remota...');
      const response = await fetch(`${this.GITHUB_REPO}/generated/index.json`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data: ContentVersion = await response.json();
      console.log(`📋 Versão remota encontrada: ${data.version}`);
      return data.version;
    } catch (error) {
      console.error('Erro ao obter versão remota:', error);
      throw error;
    }
  }

  /**
   * Baixa o conteúdo do repositório
   */
  private async downloadContent(): Promise<any> {
    const files = [
      'index.json',
      'categories.json',
      'estudos.json', 
      'pregacoes.json',
      'atualidades.json',
      'devocionais.json',
      'metadata.json'
    ];

    const content: any = {};

    // Baixar arquivos JSON
    for (const file of files) {
      try {
        console.log(`📥 Baixando ${file}...`);
        const response = await fetch(`${this.GITHUB_REPO}/generated/${file}`);
        if (!response.ok) {
          console.warn(`⚠️ Arquivo ${file} não encontrado (HTTP ${response.status}), pulando...`);
          continue;
        }
        content[file.replace('.json', '')] = await response.json();
        console.log(`✅ ${file} baixado com sucesso`);
      } catch (error) {
        console.warn(`⚠️ Erro ao baixar ${file}, pulando:`, error);
        continue;
      }
    }

    // Baixar arquivos Markdown
    await this.downloadMarkdownFiles(content);

    return content;
  }

  /**
   * Baixa os arquivos Markdown por diretório
   */
  private async downloadMarkdownFiles(content: any): Promise<void> {
    console.log('📥 Baixando arquivos Markdown por diretório...');
    
    // Baixar pregações
    await this.downloadDirectoryFiles('pregacoes', content.pregacoes?.pregacoes || []);
    
    // Baixar estudos
    await this.downloadDirectoryFiles('estudos', content.estudos?.estudos || []);
    
    // Baixar atualidades
    await this.downloadDirectoryFiles('atualidades', content.atualidades?.atualidades || []);
    
    // Baixar devocionais
    await this.downloadDirectoryFiles('devocionais', content.devocionais?.devocionais || []);
  }

  /**
   * Baixa arquivos de um diretório específico
   */
  private async downloadDirectoryFiles(type: 'pregacoes' | 'estudos' | 'atualidades' | 'devocionais', items: any[]): Promise<void> {
    console.log(`📥 Baixando arquivos do diretório: ${type}`);
    
    for (const item of items) {
      if (item.content_file) {
        try {
          let url = '';
          if (type === 'estudos') {
            url = `${this.GITHUB_REPO}/estudos/${item.category}/${item.content_file}`;
          } else if (type === 'devocionais') {
            // Para devocionais, tentar primeiro na raiz, depois na estrutura de data
            const date = new Date(item.date);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            
            // Tentar primeiro na raiz
            url = `${this.GITHUB_REPO}/devocionais/${item.content_file}`;
          } else {
            url = `${this.GITHUB_REPO}/${type}/${item.content_file}`;
          }
          
          console.log(`📥 Baixando ${type}: ${item.content_file}`);
          let response = await fetch(url);
          
          // Se for devocionais e não encontrou na raiz, tentar na estrutura de data
          if (!response.ok && type === 'devocionais') {
            const date = new Date(item.date);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const fallbackUrl = `${this.GITHUB_REPO}/devocionais/${year}/${month}/${day}/${item.content_file}`;
            console.log(`📥 Tentando fallback para devocionais: ${fallbackUrl}`);
            response = await fetch(fallbackUrl);
          }
          
          if (response.ok) {
            const markdownContent = await response.text();
            // Verificar se é HTML (página de erro)
            if (markdownContent.includes('<!doctype html>')) {
              console.warn(`⚠️ ${type} ${item.content_file} retornou HTML (erro)`);
              continue;
            }
            
            // Salvar no IndexedDB
            if (this.cache.isAvailable()) {
              await this.cache.init();
              await this.cache.saveFile(type, item.id, item.content_file, markdownContent);
              console.log(`✅ ${type} ${item.content_file} baixado e salvo no IndexedDB`);
            } else {
              // Fallback para localStorage
              const key = `markdown_${type}_${item.id}`;
              localStorage.setItem(key, markdownContent);
              console.log(`✅ ${type} ${item.content_file} baixado e salvo no localStorage`);
            }
          } else {
            console.warn(`⚠️ ${type} ${item.content_file} não encontrado (HTTP ${response.status})`);
          }
        } catch (error) {
          console.warn(`⚠️ Erro ao baixar ${type} ${item.content_file}:`, error);
        }
      }
    }
  }

  /**
   * Salva arquivo Markdown na pasta public/generated
   */
  private async saveMarkdownFile(type: 'pregacoes' | 'estudos' | 'devocionais', fileName: string, content: string): Promise<void> {
    try {
      // Criar estrutura de pastas se não existir
      const basePath = '/generated';
      const typePath = `${basePath}/${type}`;
      
      // Salvar no localStorage como arquivo virtual
      const fileKey = `file_${type}_${fileName}`;
      localStorage.setItem(fileKey, content);
      
      console.log(`💾 Arquivo ${fileName} salvo como arquivo virtual: ${fileKey}`);
      
      // Nota: Em um ambiente de produção real, você precisaria de um backend
      // para salvar arquivos físicos. Por enquanto, usamos localStorage.
      console.log(`📁 Arquivo ${fileName} disponível em: /generated/${type}/${fileName}`);
    } catch (error) {
      console.warn(`⚠️ Erro ao salvar arquivo ${fileName}:`, error);
    }
  }

  /**
   * Salva o conteúdo no cache local
   */
  private async saveContent(content: any): Promise<void> {
    // Salvar no IndexedDB se disponível
    if (this.cache.isAvailable()) {
      await this.cache.init();
      await this.cache.saveMetadata('content', content);
      console.log('💾 Conteúdo salvo no IndexedDB');
    } else {
      // Fallback para localStorage
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(content));
      console.log('💾 Conteúdo salvo no localStorage');
    }
  }

  /**
   * Obtém o conteúdo do cache local
   */
  private getCachedContent(): any | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Erro ao ler cache local:', error);
      return null;
    }
  }

  /**
   * Obtém o conteúdo embarcado (fallback)
   */
  private getEmbeddedContent(): any {
    console.log('📦 Usando conteúdo embarcado (fallback)');
    // Fallback para conteúdo embarcado no app
    return {
      estudos: [],
      pregacoes: [],
      devocionais: [],
      categories: [],
      search: { estudos: [], pregacoes: [], devocionais: [] },
      metadata: { authors: { authors: [] }, tags: { tags: [] } }
    };
  }

  /**
   * Limpa o cache local
   */
  async clearCache(): Promise<void> {
    console.log('🗑️ Limpando cache...');
    
    // Limpar IndexedDB se disponível
    if (this.cache.isAvailable()) {
      await this.cache.init();
      await this.cache.clearAll();
      console.log('🗑️ IndexedDB limpo');
    }
    
    // Limpar localStorage
    console.log('📋 Cache antes:', localStorage.getItem(this.CACHE_KEY));
    console.log('📋 Versão antes:', localStorage.getItem(this.VERSION_KEY));
    console.log('📋 Chaves no localStorage:', Object.keys(localStorage));
    
    localStorage.removeItem(this.CACHE_KEY);
    localStorage.removeItem(this.VERSION_KEY);
    
    // Limpar todas as chaves que começam com 'faith_scroll'
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('faith_scroll')) {
        console.log(`🗑️ Removendo chave: ${key}`);
        localStorage.removeItem(key);
      }
    });
    
    console.log('📋 Cache depois:', localStorage.getItem(this.CACHE_KEY));
    console.log('📋 Versão depois:', localStorage.getItem(this.VERSION_KEY));
    console.log('📋 Chaves restantes:', Object.keys(localStorage));
    console.log('✅ Cache completamente limpo');
  }

  /**
   * Força a atualização completa do conteúdo
   */
  async forceUpdate(): Promise<UpdateResult> {
    console.log('🔄 FORÇANDO ATUALIZAÇÃO COMPLETA...');
    
    try {
      // Limpar cache primeiro
      await this.clearCache();
      
      // Baixar conteúdo mais recente
      console.log('📥 Baixando conteúdo mais recente...');
      const content = await this.downloadContent();
      
      // Salvar novo conteúdo
      await this.saveContent(content);
      
      // Extrair e salvar nova versão
      const newVersion = await this.getVersionFromContent(content);
      this.setLocalVersion(newVersion);
      
      console.log(`✅ Atualização forçada concluída! Nova versão: ${newVersion}`);
      
      return {
        success: true,
        message: `Conteúdo atualizado com sucesso! Versão ${newVersion}`,
        newVersion,
        oldVersion: '0.0.0'
      };
    } catch (error) {
      console.error('❌ Erro na atualização forçada:', error);
      return {
        success: false,
        message: `Erro na atualização: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        newVersion: this.getLocalVersion(),
        oldVersion: this.getLocalVersion()
      };
    }
  }

  /**
   * Obtém o conteúdo (método público)
   */
  async getContent(): Promise<any> {
    return await this.loadLocalContent();
  }


  /**
   * Obtém informações do cache
   */
  async getCacheInfo(): Promise<{ hasCache: boolean; version: string; size: number; indexedDBSize?: number }> {
    const cached = this.getCachedContent();
    const version = this.getLocalVersion();
    
    let indexedDBSize = 0;
    if (this.cache.isAvailable()) {
      await this.cache.init();
      const stats = await this.cache.getStats();
      indexedDBSize = stats.totalSize;
    }
    
    return {
      hasCache: !!cached,
      version,
      size: cached ? JSON.stringify(cached).length : 0,
      indexedDBSize
    };
  }
}
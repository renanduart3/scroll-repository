/**
 * Sistema de Cache com IndexedDB
 * Gerencia armazenamento de arquivos Markdown e metadados
 */

interface CacheItem {
  id: string;
  type: 'pregacoes' | 'estudos' | 'devocionais';
  filename: string;
  content: string;
  lastAccessed: number;
  size: number;
}

interface CacheStats {
  totalItems: number;
  totalSize: number;
  byType: Record<string, number>;
}

export class IndexedDBCache {
  private dbName = 'FaithScrollCache';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private maxSize = 50 * 1024 * 1024; // 50MB
  private maxItems = 1000;

  /**
   * Inicializa a conexão com IndexedDB
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('❌ Erro ao abrir IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB conectado com sucesso');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Criar store para arquivos
        if (!db.objectStoreNames.contains('files')) {
          const store = db.createObjectStore('files', { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('lastAccessed', 'lastAccessed', { unique: false });
          store.createIndex('size', 'size', { unique: false });
        }

        // Criar store para metadados
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }

        console.log('📦 IndexedDB inicializado com stores criados');
      };
    });
  }

  /**
   * Salva um arquivo no cache
   */
  async saveFile(
    type: 'pregacoes' | 'estudos' | 'devocionais',
    id: string,
    filename: string,
    content: string
  ): Promise<void> {
    if (!this.db) await this.init();

    const item: CacheItem = {
      id: `${type}_${id}`,
      type,
      filename,
      content,
      lastAccessed: Date.now(),
      size: new Blob([content]).size
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      const request = store.put(item);

      request.onsuccess = () => {
        console.log(`💾 Arquivo salvo no IndexedDB: ${filename}`);
        this.cleanupIfNeeded();
        resolve();
      };

      request.onerror = () => {
        console.error('❌ Erro ao salvar arquivo:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Recupera um arquivo do cache
   */
  async getFile(
    type: 'pregacoes' | 'estudos' | 'devocionais',
    id: string
  ): Promise<string | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      const request = store.get(`${type}_${id}`);

      request.onsuccess = () => {
        if (request.result) {
          // Atualizar timestamp de acesso
          const item = request.result as CacheItem;
          item.lastAccessed = Date.now();
          store.put(item);
          
          console.log(`📄 Arquivo carregado do IndexedDB: ${item.filename}`);
          resolve(item.content);
        } else {
          console.log(`⚠️ Arquivo não encontrado no cache: ${type}_${id}`);
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error('❌ Erro ao carregar arquivo:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Salva metadados (JSON files)
   */
  async saveMetadata(key: string, data: any): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['metadata'], 'readwrite');
      const store = transaction.objectStore('metadata');
      const request = store.put({ key, data, timestamp: Date.now() });

      request.onsuccess = () => {
        console.log(`💾 Metadados salvos: ${key}`);
        resolve();
      };

      request.onerror = () => {
        console.error('❌ Erro ao salvar metadados:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Recupera metadados
   */
  async getMetadata(key: string): Promise<any | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['metadata'], 'readonly');
      const store = transaction.objectStore('metadata');
      const request = store.get(key);

      request.onsuccess = () => {
        if (request.result) {
          console.log(`📄 Metadados carregados: ${key}`);
          resolve(request.result.data);
        } else {
          console.log(`⚠️ Metadados não encontrados: ${key}`);
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error('❌ Erro ao carregar metadados:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Obtém estatísticas do cache
   */
  async getStats(): Promise<CacheStats> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['files'], 'readonly');
      const store = transaction.objectStore('files');
      const request = store.getAll();

      request.onsuccess = () => {
        const items = request.result as CacheItem[];
        const stats: CacheStats = {
          totalItems: items.length,
          totalSize: items.reduce((sum, item) => sum + item.size, 0),
          byType: {}
        };

        items.forEach(item => {
          stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
        });

        console.log('📊 Estatísticas do cache:', stats);
        resolve(stats);
      };

      request.onerror = () => {
        console.error('❌ Erro ao obter estatísticas:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Limpa cache se necessário (baseado em tamanho ou quantidade)
   */
  private async cleanupIfNeeded(): Promise<void> {
    const stats = await this.getStats();
    
    if (stats.totalSize > this.maxSize || stats.totalItems > this.maxItems) {
      console.log('🧹 Limpeza automática do cache iniciada...');
      await this.cleanup();
    }
  }

  /**
   * Remove arquivos antigos para liberar espaço
   */
  async cleanup(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      const index = store.index('lastAccessed');
      const request = index.getAll();

      request.onsuccess = () => {
        const items = request.result as CacheItem[];
        
        // Ordenar por último acesso (mais antigos primeiro)
        items.sort((a, b) => a.lastAccessed - b.lastAccessed);
        
        // Remover 20% dos arquivos mais antigos
        const toRemove = Math.floor(items.length * 0.2);
        const itemsToRemove = items.slice(0, toRemove);
        
        console.log(`🗑️ Removendo ${itemsToRemove.length} arquivos antigos...`);
        
        itemsToRemove.forEach(item => {
          store.delete(item.id);
        });

        resolve();
      };

      request.onerror = () => {
        console.error('❌ Erro na limpeza:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Limpa todo o cache
   */
  async clearAll(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['files', 'metadata'], 'readwrite');
      
      const clearFiles = transaction.objectStore('files').clear();
      const clearMetadata = transaction.objectStore('metadata').clear();

      Promise.all([clearFiles, clearMetadata]).then(() => {
        console.log('🗑️ Cache completamente limpo');
        resolve();
      }).catch(reject);
    });
  }

  /**
   * Verifica se o cache está disponível
   */
  isAvailable(): boolean {
    return 'indexedDB' in window;
  }
}

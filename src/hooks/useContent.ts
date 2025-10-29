import { useState, useEffect, useMemo, useCallback } from 'react';
import { ContentUpdater } from '@/services/ContentUpdater';

export interface Content {
  id: string;
  title: string;
  description: string;
  category: string;
  author: string;
  date: string;
  tags: string[];
  content_file: string;
  progress: number;
  featured: boolean;
  reading_time: number;
  difficulty: string;
  bible_references: string[];
  related_studies: string[];
  version: string;
  last_updated: string;
  status: string;
  views: number;
  favorites: number;
}

export interface EstudoCategoria {
  id: string;
  nome: string;
  slug: string;
  descricao: string;
  icon: string;
  quantidade: number;
  ordem: number;
  ativo: boolean;
  cor: string;
}

export interface ContentData {
  estudos: Content[];
  categorias: EstudoCategoria[];
  pregacoes: Content[];
  atualidades: Content[];
  devocionais: Content[];
}

export interface ContentMetadata {
  version: string;
  buildDate: string;
  lastUpdated: string;
}

export const useContent = () => {
  const [content, setContent] = useState<ContentData>({
    estudos: [],
    categorias: [],
    pregacoes: [],
    atualidades: [],
    devocionais: []
  });
  const [metadata, setMetadata] = useState<ContentMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const updater = new ContentUpdater();
        // Primeiro verificar se há atualizações
        await updater.checkForUpdates();
        // Depois carregar o conteúdo local
        const contentData = await updater.loadContent();
        
        if (contentData) {
          // Transformar os dados para a estrutura esperada
          const transformedData = {
            categorias: contentData.categories?.categories || [],
            estudos: contentData.estudos?.estudos || [],
            pregacoes: contentData.pregacoes?.pregacoes || [],
            atualidades: contentData.atualidades?.atualidades || [],
            devocionais: contentData.devocionais?.devocionais || []
          };
          setContent(transformedData);
          
          // Extrair metadados se disponíveis
          if (contentData.index) {
            setMetadata({
              version: contentData.index.version || '1.0.0',
              buildDate: contentData.index.buildDate || new Date().toISOString(),
              lastUpdated: contentData.index.lastUpdated || new Date().toISOString()
            });
          }
        } else {
          // Fallback para dados mock se não conseguir carregar
          console.warn('⚠️ Não foi possível carregar conteúdo real, usando dados mock');
          setError('Usando dados de exemplo');
        }
      } catch (err) {
        console.error('❌ Erro ao carregar conteúdo:', err);
        setError('Erro ao carregar conteúdo');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  return { content, metadata, loading, error };
};

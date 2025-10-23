import React, { useState, useEffect } from 'react';
import { ContentUpdater, UpdateResult } from '../services/ContentUpdater';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { RefreshCw, CheckCircle, AlertCircle, Download, Database } from 'lucide-react';

interface UpdateStatus {
  isChecking: boolean;
  isUpdating: boolean;
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  lastResult?: UpdateResult;
}

export function ContentUpdateButton() {
  const [status, setStatus] = useState<UpdateStatus>({
    isChecking: false,
    isUpdating: false,
    hasUpdate: false,
    currentVersion: '1.0.0',
    latestVersion: '1.0.0'
  });

  const [cacheInfo, setCacheInfo] = useState({ 
    hasCache: false, 
    version: '1.0.0', 
    size: 0,
    indexedDBSize: 0
  });

  const updater = new ContentUpdater();

  useEffect(() => {
    loadCacheInfo();
    checkForUpdates();
  }, []);

  const loadCacheInfo = async () => {
    const info = await updater.getCacheInfo();
    setCacheInfo(info);
  };

  const clearCache = async () => {
    console.log('🗑️ LIMPANDO CACHE...');
    await updater.clearCache();
    loadCacheInfo();
    console.log('✅ Cache limpo!');
  };

  const checkForUpdates = async () => {
    console.log('🔘 BOTÃO VERIFICAR CLICADO!');
    setStatus(prev => ({ ...prev, isChecking: true }));
    
    try {
      console.log('🔄 Chamando updater.checkForUpdates()...');
      const updateInfo = await updater.checkForUpdates();
      console.log('📋 Resultado da verificação:', updateInfo);
      
      setStatus(prev => ({
        ...prev,
        isChecking: false,
        hasUpdate: updateInfo.hasUpdate,
        currentVersion: updateInfo.currentVersion,
        latestVersion: updateInfo.latestVersion
      }));
      
      console.log('✅ Status atualizado:', {
        hasUpdate: updateInfo.hasUpdate,
        currentVersion: updateInfo.currentVersion,
        latestVersion: updateInfo.latestVersion
      });
    } catch (error) {
      console.error('❌ Erro ao verificar atualizações:', error);
      setStatus(prev => ({ ...prev, isChecking: false }));
    }
  };

  const handleUpdate = async () => {
    console.log('🔘 BOTÃO ATUALIZAR CLICADO!');
    setStatus(prev => ({ ...prev, isUpdating: true }));
    
    try {
      console.log('🔄 Chamando updater.updateContent()...');
      const result = await updater.updateContent();
      console.log('📋 Resultado da atualização:', result);
      
      setStatus(prev => ({
        ...prev,
        isUpdating: false,
        lastResult: result,
        currentVersion: result.newVersion || prev.currentVersion
      }));
      
      console.log('✅ Status atualizado após update:', {
        success: result.success,
        message: result.message,
        newVersion: result.newVersion
      });
      
      // Recarregar informações do cache
      loadCacheInfo();
      
      // Se a atualização foi bem-sucedida, recarregar a página
      if (result.success) {
        console.log('🔄 Recarregando página em 2 segundos...');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar:', error);
      setStatus(prev => ({
        ...prev,
        isUpdating: false,
        lastResult: {
          success: false,
          message: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        }
      }));
    }
  };

  const handleForceUpdate = async () => {
    console.log('🔄 INICIANDO ATUALIZAÇÃO FORÇADA...');
    setStatus(prev => ({ ...prev, isUpdating: true }));
    
    try {
      console.log('🔄 Chamando updater.forceUpdate()...');
      const result = await updater.forceUpdate();
      console.log('📋 Resultado da atualização forçada:', result);
      
      setStatus(prev => ({
        ...prev,
        isUpdating: false,
        hasUpdate: false,
        currentVersion: result.newVersion || prev.currentVersion,
        lastResult: result
      }));
      
      // Recarregar informações do cache
      loadCacheInfo();
      
      console.log('✅ Atualização forçada concluída!');
      
      // Se a atualização foi bem-sucedida, recarregar a página
      if (result.success) {
        console.log('🔄 Recarregando página em 2 segundos...');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Erro na atualização forçada:', error);
      setStatus(prev => ({ 
        ...prev, 
        isUpdating: false,
        lastResult: {
          success: false,
          message: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        }
      }));
    }
  };

  const getStatusIcon = () => {
    if (status.isChecking || status.isUpdating) {
      return <RefreshCw className="h-4 w-4 animate-spin" />;
    }
    if (status.lastResult?.success) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (status.lastResult && !status.lastResult.success) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    return <Database className="h-4 w-4" />;
  };

  const getStatusColor = () => {
    if (status.lastResult?.success) return 'bg-green-100 text-green-800';
    if (status.lastResult && !status.lastResult.success) return 'bg-red-100 text-red-800';
    if (status.hasUpdate) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Atualização de Conteúdo
        </CardTitle>
        <CardDescription>
          Mantenha o conteúdo do app atualizado com os últimos estudos e devocionais.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status da Versão */}
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="font-medium">Versão Atual:</span>
            <Badge variant="outline" className="ml-2">{status.currentVersion}</Badge>
          </div>
          {status.hasUpdate && (
            <Badge className="bg-blue-500">
              Nova versão: {status.latestVersion}
            </Badge>
          )}
        </div>

        {/* Informações do Cache */}
        <div className="text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Database className="h-3 w-3" />
            <span>Cache: {cacheInfo.hasCache ? 'Disponível' : 'Não disponível'}</span>
          </div>
          {cacheInfo.hasCache && (
            <div className="text-xs text-gray-500 mt-1">
              <div>Tamanho: {(cacheInfo.size / 1024).toFixed(1)} KB</div>
              {cacheInfo.indexedDBSize > 0 && (
                <div>IndexedDB: {(cacheInfo.indexedDBSize / 1024 / 1024).toFixed(1)} MB</div>
              )}
            </div>
          )}
        </div>

        {/* Resultado da Última Operação */}
        {status.lastResult && (
          <div className={`p-3 rounded-md ${getStatusColor()}`}>
            <div className="flex items-center gap-2">
              {status.lastResult.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {status.lastResult.success ? 'Sucesso!' : 'Erro'}
              </span>
            </div>
            <p className="text-sm mt-1">{status.lastResult.message}</p>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex gap-2">
          <Button
            onClick={checkForUpdates}
            disabled={status.isChecking || status.isUpdating}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            {status.isChecking ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Verificar
              </>
            )}
          </Button>

          <Button
            onClick={handleUpdate}
            disabled={!status.hasUpdate || status.isUpdating || status.isChecking}
            size="sm"
            className="flex-1"
          >
            {status.isUpdating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Atualizando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Atualizar
              </>
            )}
          </Button>
        </div>

        {/* Botões de Cache */}
        <div className="flex gap-2 justify-center">
          <Button
            onClick={clearCache}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            🗑️ Limpar Cache
          </Button>
          <Button
            onClick={handleForceUpdate}
            disabled={status.isUpdating || status.isChecking}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            {status.isUpdating ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Forçando...
              </>
            ) : (
              <>
                🔄 Forçar Atualização
              </>
            )}
          </Button>
        </div>

        {/* Informações Adicionais */}
        <div className="text-xs text-gray-500 border-t pt-3">
          <p>• O conteúdo é baixado do repositório GitHub</p>
          <p>• Funciona offline após o download</p>
          <p>• Atualizações são automáticas</p>
        </div>
      </CardContent>
    </Card>
  );
}

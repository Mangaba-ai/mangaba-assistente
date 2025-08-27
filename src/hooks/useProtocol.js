import { useState, useEffect, useCallback } from 'react';
import protocolService from '../services/ProtocolService';

/**
 * Hook para gerenciar protocolos A2A e MCP
 */
export const useProtocol = () => {
  const [connections, setConnections] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);

  // Atualizar lista de conexões
  const updateConnections = useCallback(() => {
    const activeConnections = protocolService.getActiveConnections();
    setConnections(activeConnections);
  }, []);

  // Conectar A2A
  const connectA2A = useCallback(async (config) => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const connectionId = await protocolService.initializeA2A(config);
      updateConnections();
      return connectionId;
    } catch (err) {
      setError(`Erro ao conectar A2A: ${err.message}`);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, [updateConnections]);

  // Conectar MCP
  const connectMCP = useCallback(async (config) => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const connectionId = await protocolService.initializeMCP(config);
      updateConnections();
      return connectionId;
    } catch (err) {
      setError(`Erro ao conectar MCP: ${err.message}`);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, [updateConnections]);

  // Enviar mensagem A2A
  const sendA2AMessage = useCallback(async (connectionId, message, targetAgentId) => {
    try {
      const messageId = await protocolService.sendA2AMessage(connectionId, message, targetAgentId);
      return messageId;
    } catch (err) {
      setError(`Erro ao enviar mensagem A2A: ${err.message}`);
      throw err;
    }
  }, []);

  // Enviar prompt MCP
  const sendMCPPrompt = useCallback(async (connectionId, prompt, context = {}) => {
    try {
      const requestId = await protocolService.sendMCPPrompt(connectionId, prompt, context);
      return requestId;
    } catch (err) {
      setError(`Erro ao enviar prompt MCP: ${err.message}`);
      throw err;
    }
  }, []);

  // Listar ferramentas MCP
  const listMCPTools = useCallback(async (connectionId) => {
    try {
      const tools = await protocolService.listMCPTools(connectionId);
      return tools;
    } catch (err) {
      setError(`Erro ao listar ferramentas MCP: ${err.message}`);
      throw err;
    }
  }, []);

  // Desconectar
  const disconnect = useCallback(async (connectionId) => {
    try {
      await protocolService.disconnect(connectionId);
      updateConnections();
    } catch (err) {
      setError(`Erro ao desconectar: ${err.message}`);
      throw err;
    }
  }, [updateConnections]);

  // Desconectar todos
  const disconnectAll = useCallback(async () => {
    try {
      await protocolService.disconnectAll();
      updateConnections();
    } catch (err) {
      setError(`Erro ao desconectar todos: ${err.message}`);
      throw err;
    }
  }, [updateConnections]);

  // Obter status de conexão
  const getConnectionStatus = useCallback((connectionId) => {
    return protocolService.getConnectionStatus(connectionId);
  }, []);

  // Configurar listeners de eventos
  useEffect(() => {
    const handleA2AConnected = (data) => {
      console.log('A2A conectado:', data);
      updateConnections();
    };

    const handleMCPConnected = (data) => {
      console.log('MCP conectado:', data);
      updateConnections();
    };

    const handleA2AMessage = (message) => {
      console.log('Mensagem A2A recebida:', message);
      setMessages(prev => [...prev, {
        id: message.id,
        type: 'A2A',
        content: message.content,
        from: message.from,
        to: message.to,
        timestamp: message.timestamp
      }]);
    };

    const handleMCPResponse = (response) => {
      console.log('Resposta MCP recebida:', response);
      if (response.result && response.result.messages) {
        response.result.messages.forEach(msg => {
          setMessages(prev => [...prev, {
            id: response.id,
            type: 'MCP',
            content: msg.content.text,
            role: msg.role,
            timestamp: new Date().toISOString()
          }]);
        });
      }
    };

    const handleDisconnected = (data) => {
      console.log('Desconectado:', data);
      updateConnections();
    };

    // Registrar listeners
    protocolService.on('a2a:connected', handleA2AConnected);
    protocolService.on('mcp:connected', handleMCPConnected);
    protocolService.on('a2a:message', handleA2AMessage);
    protocolService.on('mcp:response', handleMCPResponse);
    protocolService.on('a2a:disconnected', handleDisconnected);
    protocolService.on('mcp:disconnected', handleDisconnected);

    // Atualizar conexões iniciais
    updateConnections();

    // Cleanup
    return () => {
      protocolService.off('a2a:connected', handleA2AConnected);
      protocolService.off('mcp:connected', handleMCPConnected);
      protocolService.off('a2a:message', handleA2AMessage);
      protocolService.off('mcp:response', handleMCPResponse);
      protocolService.off('a2a:disconnected', handleDisconnected);
      protocolService.off('mcp:disconnected', handleDisconnected);
    };
  }, [updateConnections]);

  // Limpar erro após um tempo
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return {
    // Estado
    connections,
    isConnecting,
    error,
    messages,
    
    // Métodos A2A
    connectA2A,
    sendA2AMessage,
    
    // Métodos MCP
    connectMCP,
    sendMCPPrompt,
    listMCPTools,
    
    // Métodos gerais
    disconnect,
    disconnectAll,
    getConnectionStatus,
    
    // Utilitários
    clearError: () => setError(null),
    clearMessages: () => setMessages([])
  };
};

export default useProtocol;
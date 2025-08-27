/**
 * Interface unificada de comunicação A2A/MCP independente do LLM subjacente
 * Abstrai a comunicação entre agentes e o compartilhamento de contexto
 */

import { A2AProtocol, A2AAgent, A2ANetwork } from '../protocols/A2AProtocol.js';
import { MCPProtocol, ConversationContext, TaskContext } from '../protocols/MCPProtocol.js';
import { llmFallbackService } from '../services/LLMFallbackService.js';
import { universalFileParser } from '../parsers/UniversalFileParser.js';
import { AgentConfigManager } from '../config/AgentConfig.js';

// Tipos de comunicação
export const COMMUNICATION_TYPES = {
  DIRECT: 'direct',
  BROADCAST: 'broadcast',
  MULTICAST: 'multicast',
  PUBLISH_SUBSCRIBE: 'publish_subscribe'
};

// Estados de comunicação
export const COMMUNICATION_STATES = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  COMMUNICATING: 'communicating',
  DISCONNECTED: 'disconnected',
  ERROR: 'error'
};

// Tipos de eventos
export const EVENT_TYPES = {
  MESSAGE_RECEIVED: 'message_received',
  MESSAGE_SENT: 'message_sent',
  CONTEXT_UPDATED: 'context_updated',
  AGENT_CONNECTED: 'agent_connected',
  AGENT_DISCONNECTED: 'agent_disconnected',
  ERROR_OCCURRED: 'error_occurred',
  TASK_COMPLETED: 'task_completed',
  TASK_FAILED: 'task_failed'
};

/**
 * Wrapper unificado para agentes com diferentes LLMs
 */
export class UnifiedAgent {
  constructor({
    id,
    name,
    specialization,
    llmConfig,
    capabilities = [],
    supportedFileTypes = [],
    contextConfig = {},
    communicationConfig = {}
  }) {
    this.id = id;
    this.name = name;
    this.specialization = specialization;
    this.llmConfig = llmConfig;
    this.capabilities = new Set(capabilities);
    this.supportedFileTypes = new Set(supportedFileTypes);
    this.contextConfig = contextConfig;
    this.communicationConfig = communicationConfig;
    
    // Componentes internos
    this.a2aAgent = null;
    this.conversationContext = null;
    this.taskContext = null;
    this.state = COMMUNICATION_STATES.IDLE;
    
    // Estatísticas
    this.stats = {
      messagesReceived: 0,
      messagesSent: 0,
      tasksCompleted: 0,
      tasksFailed: 0,
      filesProcessed: 0,
      contextUpdates: 0,
      uptime: Date.now()
    };
    
    // Event listeners
    this.eventListeners = new Map();
    
    this.initialize();
  }

  /**
   * Inicializar o agente
   */
  async initialize() {
    try {
      this.state = COMMUNICATION_STATES.CONNECTING;
      
      // Inicializar agente A2A
      this.a2aAgent = new A2AAgent({
        id: this.id,
        name: this.name,
        specialization: this.specialization,
        capabilities: Array.from(this.capabilities),
        supportedFileTypes: Array.from(this.supportedFileTypes)
      });
      
      // Inicializar contextos MCP
      this.conversationContext = new ConversationContext({
        agentId: this.id,
        maxMessages: this.contextConfig.maxMessages || 100,
        retentionTime: this.contextConfig.retentionTime || 3600000 // 1 hora
      });
      
      this.taskContext = new TaskContext({
        agentId: this.id,
        maxTasks: this.contextConfig.maxTasks || 50,
        retentionTime: this.contextConfig.retentionTime || 7200000 // 2 horas
      });
      
      this.state = COMMUNICATION_STATES.CONNECTED;
      this.emit(EVENT_TYPES.AGENT_CONNECTED, { agentId: this.id });
      
    } catch (error) {
      this.state = COMMUNICATION_STATES.ERROR;
      this.emit(EVENT_TYPES.ERROR_OCCURRED, { error: error.message });
      throw error;
    }
  }

  /**
   * Processar mensagem recebida
   * @param {Object} message - Mensagem A2A
   * @returns {Promise<Object>}
   */
  async processMessage(message) {
    try {
      this.state = COMMUNICATION_STATES.COMMUNICATING;
      this.stats.messagesReceived++;
      
      // Adicionar mensagem ao contexto de conversação
      await this.conversationContext.addMessage({
        role: 'user',
        content: message.content,
        metadata: {
          senderId: message.senderId,
          timestamp: message.timestamp,
          messageType: message.type
        }
      });
      
      // Processar arquivos se presentes
      let fileResults = [];
      if (message.attachments && message.attachments.length > 0) {
        fileResults = await this.processFiles(message.attachments);
      }
      
      // Preparar contexto para LLM
      const conversationHistory = await this.conversationContext.getMessages();
      const taskHistory = await this.taskContext.getTasks();
      
      // Gerar resposta usando LLM com fallback
      const llmMessages = this.buildLLMMessages(conversationHistory, message, fileResults, taskHistory);
      
      const response = await llmFallbackService.sendMessageWithFallback(
        llmMessages,
        {
          ...this.llmConfig,
          maxTokens: this.communicationConfig.maxTokens || 2000,
          temperature: this.communicationConfig.temperature || 0.7
        }
      );
      
      // Adicionar resposta ao contexto
      await this.conversationContext.addMessage({
        role: 'assistant',
        content: response.content,
        metadata: {
          provider: response.metadata.provider,
          model: response.metadata.model,
          timestamp: Date.now()
        }
      });
      
      // Criar resposta A2A
      const a2aResponse = this.a2aAgent.createMessage({
        recipientId: message.senderId,
        content: response.content,
        type: message.type,
        priority: message.priority,
        metadata: {
          originalMessageId: message.id,
          processingTime: response.metadata.totalResponseTime,
          filesProcessed: fileResults.length
        }
      });
      
      this.stats.messagesSent++;
      this.state = COMMUNICATION_STATES.CONNECTED;
      
      this.emit(EVENT_TYPES.MESSAGE_RECEIVED, { message });
      this.emit(EVENT_TYPES.MESSAGE_SENT, { message: a2aResponse });
      
      return a2aResponse;
      
    } catch (error) {
      this.state = COMMUNICATION_STATES.ERROR;
      this.emit(EVENT_TYPES.ERROR_OCCURRED, { error: error.message });
      throw error;
    }
  }

  /**
   * Processar arquivos anexados
   * @param {Array} files - Lista de arquivos
   * @returns {Promise<Array>}
   */
  async processFiles(files) {
    const results = [];
    
    for (const file of files) {
      try {
        // Verificar se o agente suporta este tipo de arquivo
        const fileExtension = file.name.substring(file.name.lastIndexOf('.'));
        
        if (!this.supportedFileTypes.has(fileExtension) && !this.supportedFileTypes.has('*')) {
          results.push({
            success: false,
            filename: file.name,
            error: 'Tipo de arquivo não suportado'
          });
          continue;
        }
        
        // Processar arquivo
        const parseResult = await universalFileParser.parseFile(file);
        
        if (parseResult.success) {
          // Adicionar conteúdo do arquivo ao contexto de tarefa
          await this.taskContext.addTask({
            type: 'file_processing',
            status: 'completed',
            input: {
              filename: file.name,
              fileType: parseResult.contentType
            },
            output: {
              content: parseResult.content,
              metadata: parseResult.metadata,
              structure: parseResult.structure
            },
            metadata: {
              processingTime: parseResult.processingTime,
              parser: parseResult.parser
            }
          });
          
          this.stats.filesProcessed++;
        }
        
        results.push({
          success: parseResult.success,
          filename: file.name,
          contentType: parseResult.contentType,
          content: parseResult.content,
          metadata: parseResult.metadata,
          error: parseResult.error
        });
        
      } catch (error) {
        results.push({
          success: false,
          filename: file.name,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * Construir mensagens para o LLM
   * @param {Array} conversationHistory - Histórico de conversação
   * @param {Object} currentMessage - Mensagem atual
   * @param {Array} fileResults - Resultados do processamento de arquivos
   * @param {Array} taskHistory - Histórico de tarefas
   * @returns {Array}
   */
  buildLLMMessages(conversationHistory, currentMessage, fileResults, taskHistory) {
    const messages = [];
    
    // Mensagem de sistema com contexto do agente
    messages.push({
      role: 'system',
      content: this.buildSystemPrompt(fileResults, taskHistory)
    });
    
    // Adicionar histórico de conversação (limitado)
    const recentHistory = conversationHistory.slice(-10); // Últimas 10 mensagens
    messages.push(...recentHistory);
    
    // Adicionar mensagem atual se não estiver no histórico
    const lastMessage = recentHistory[recentHistory.length - 1];
    if (!lastMessage || lastMessage.content !== currentMessage.content) {
      messages.push({
        role: 'user',
        content: currentMessage.content
      });
    }
    
    return messages;
  }

  /**
   * Construir prompt do sistema
   * @param {Array} fileResults - Resultados de arquivos
   * @param {Array} taskHistory - Histórico de tarefas
   * @returns {string}
   */
  buildSystemPrompt(fileResults, taskHistory) {
    let prompt = `Você é ${this.name}, um agente especializado em ${this.specialization}.\n\n`;
    
    prompt += `Suas capacidades incluem: ${Array.from(this.capabilities).join(', ')}.\n`;
    prompt += `Você pode processar os seguintes tipos de arquivo: ${Array.from(this.supportedFileTypes).join(', ')}.\n\n`;
    
    // Adicionar informações de arquivos processados
    if (fileResults.length > 0) {
      prompt += 'Arquivos processados nesta conversa:\n';
      fileResults.forEach(result => {
        if (result.success) {
          prompt += `- ${result.filename} (${result.contentType}): ${result.content?.substring(0, 200)}...\n`;
        } else {
          prompt += `- ${result.filename}: Erro - ${result.error}\n`;
        }
      });
      prompt += '\n';
    }
    
    // Adicionar contexto de tarefas recentes
    if (taskHistory.length > 0) {
      prompt += 'Tarefas recentes:\n';
      taskHistory.slice(-5).forEach(task => {
        prompt += `- ${task.type} (${task.status}): ${JSON.stringify(task.input).substring(0, 100)}...\n`;
      });
      prompt += '\n';
    }
    
    prompt += 'Responda de forma útil e precisa, utilizando as informações de contexto disponíveis.';
    
    return prompt;
  }

  /**
   * Enviar mensagem para outro agente
   * @param {string} recipientId - ID do destinatário
   * @param {string} content - Conteúdo da mensagem
   * @param {Object} options - Opções adicionais
   * @returns {Object}
   */
  sendMessage(recipientId, content, options = {}) {
    const message = this.a2aAgent.createMessage({
      recipientId,
      content,
      type: options.type || 'request',
      priority: options.priority || 'medium',
      metadata: options.metadata || {}
    });
    
    this.stats.messagesSent++;
    this.emit(EVENT_TYPES.MESSAGE_SENT, { message });
    
    return message;
  }

  /**
   * Adicionar capacidade
   * @param {string} capability - Nova capacidade
   */
  addCapability(capability) {
    this.capabilities.add(capability);
    if (this.a2aAgent) {
      this.a2aAgent.capabilities.push(capability);
    }
  }

  /**
   * Remover capacidade
   * @param {string} capability - Capacidade a remover
   */
  removeCapability(capability) {
    this.capabilities.delete(capability);
    if (this.a2aAgent) {
      const index = this.a2aAgent.capabilities.indexOf(capability);
      if (index > -1) {
        this.a2aAgent.capabilities.splice(index, 1);
      }
    }
  }

  /**
   * Adicionar tipo de arquivo suportado
   * @param {string} fileType - Tipo de arquivo
   */
  addSupportedFileType(fileType) {
    this.supportedFileTypes.add(fileType);
    if (this.a2aAgent) {
      this.a2aAgent.supportedFileTypes.push(fileType);
    }
  }

  /**
   * Remover tipo de arquivo suportado
   * @param {string} fileType - Tipo de arquivo
   */
  removeSupportedFileType(fileType) {
    this.supportedFileTypes.delete(fileType);
    if (this.a2aAgent) {
      const index = this.a2aAgent.supportedFileTypes.indexOf(fileType);
      if (index > -1) {
        this.a2aAgent.supportedFileTypes.splice(index, 1);
      }
    }
  }

  /**
   * Adicionar event listener
   * @param {string} eventType - Tipo do evento
   * @param {Function} callback - Função de callback
   */
  on(eventType, callback) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType).push(callback);
  }

  /**
   * Remover event listener
   * @param {string} eventType - Tipo do evento
   * @param {Function} callback - Função de callback
   */
  off(eventType, callback) {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emitir evento
   * @param {string} eventType - Tipo do evento
   * @param {Object} data - Dados do evento
   */
  emit(eventType, data) {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Erro no event listener ${eventType}:`, error);
        }
      });
    }
  }

  /**
   * Obter estatísticas do agente
   * @returns {Object}
   */
  getStats() {
    return {
      ...this.stats,
      uptime: Date.now() - this.stats.uptime,
      state: this.state,
      capabilities: Array.from(this.capabilities),
      supportedFileTypes: Array.from(this.supportedFileTypes)
    };
  }

  /**
   * Obter contexto atual
   * @returns {Object}
   */
  async getContext() {
    const conversationMessages = await this.conversationContext.getMessages();
    const tasks = await this.taskContext.getTasks();
    
    return {
      conversation: conversationMessages,
      tasks,
      agent: {
        id: this.id,
        name: this.name,
        specialization: this.specialization,
        capabilities: Array.from(this.capabilities),
        supportedFileTypes: Array.from(this.supportedFileTypes)
      }
    };
  }

  /**
   * Limpar contexto
   */
  async clearContext() {
    await this.conversationContext.clearMessages();
    await this.taskContext.clearTasks();
    this.stats.contextUpdates++;
    this.emit(EVENT_TYPES.CONTEXT_UPDATED, { agentId: this.id });
  }

  /**
   * Destruir o agente
   */
  destroy() {
    this.state = COMMUNICATION_STATES.DISCONNECTED;
    this.eventListeners.clear();
    this.emit(EVENT_TYPES.AGENT_DISCONNECTED, { agentId: this.id });
  }
}

/**
 * Gerenciador de rede de agentes unificados
 */
export class UnifiedAgentNetwork {
  constructor(options = {}) {
    this.options = {
      maxAgents: 100,
      enableMetrics: true,
      enableLogging: true,
      ...options
    };
    
    this.agents = new Map();
    this.a2aNetwork = new A2ANetwork();
    this.mcpProtocol = new MCPProtocol();
    this.agentConfigManager = new AgentConfigManager();
    
    // Estatísticas da rede
    this.networkStats = {
      totalAgents: 0,
      activeAgents: 0,
      totalMessages: 0,
      totalTasks: 0,
      networkUptime: Date.now()
    };
    
    this.setupEventHandlers();
  }

  /**
   * Configurar manipuladores de eventos
   */
  setupEventHandlers() {
    // Escutar eventos da rede A2A
    this.a2aNetwork.on('message', async (message) => {
      await this.routeMessage(message);
    });
    
    this.a2aNetwork.on('agent_joined', (agentInfo) => {
      this.networkStats.activeAgents++;
      if (this.options.enableLogging) {
        console.log(`Agente ${agentInfo.id} entrou na rede`);
      }
    });
    
    this.a2aNetwork.on('agent_left', (agentInfo) => {
      this.networkStats.activeAgents--;
      if (this.options.enableLogging) {
        console.log(`Agente ${agentInfo.id} saiu da rede`);
      }
    });
  }

  /**
   * Criar agente a partir de configuração
   * @param {Object} config - Configuração do agente
   * @returns {Promise<UnifiedAgent>}
   */
  async createAgent(config) {
    if (this.agents.size >= this.options.maxAgents) {
      throw new Error('Número máximo de agentes atingido');
    }
    
    // Validar configuração
    const validatedConfig = this.agentConfigManager.validateConfiguration(config);
    
    // Criar agente unificado
    const agent = new UnifiedAgent(validatedConfig);
    
    // Registrar agente na rede
    this.agents.set(agent.id, agent);
    this.a2aNetwork.addAgent(agent.a2aAgent);
    
    // Configurar event listeners
    agent.on(EVENT_TYPES.MESSAGE_SENT, (data) => {
      this.networkStats.totalMessages++;
    });
    
    agent.on(EVENT_TYPES.TASK_COMPLETED, (data) => {
      this.networkStats.totalTasks++;
    });
    
    this.networkStats.totalAgents++;
    
    if (this.options.enableLogging) {
      console.log(`Agente ${agent.id} criado e adicionado à rede`);
    }
    
    return agent;
  }

  /**
   * Remover agente da rede
   * @param {string} agentId - ID do agente
   */
  removeAgent(agentId) {
    const agent = this.agents.get(agentId);
    if (agent) {
      this.a2aNetwork.removeAgent(agentId);
      agent.destroy();
      this.agents.delete(agentId);
      
      if (this.options.enableLogging) {
        console.log(`Agente ${agentId} removido da rede`);
      }
    }
  }

  /**
   * Rotear mensagem para o agente apropriado
   * @param {Object} message - Mensagem A2A
   */
  async routeMessage(message) {
    const recipientAgent = this.agents.get(message.recipientId);
    
    if (recipientAgent) {
      try {
        const response = await recipientAgent.processMessage(message);
        
        // Enviar resposta de volta através da rede
        if (response) {
          this.a2aNetwork.sendMessage(response);
        }
        
      } catch (error) {
        if (this.options.enableLogging) {
          console.error(`Erro ao processar mensagem para ${message.recipientId}:`, error);
        }
        
        // Enviar mensagem de erro de volta
        const errorResponse = {
          id: `error_${Date.now()}`,
          senderId: message.recipientId,
          recipientId: message.senderId,
          type: 'error',
          content: `Erro ao processar mensagem: ${error.message}`,
          timestamp: Date.now(),
          priority: 'high'
        };
        
        this.a2aNetwork.sendMessage(errorResponse);
      }
    } else {
      if (this.options.enableLogging) {
        console.warn(`Agente destinatário ${message.recipientId} não encontrado`);
      }
    }
  }

  /**
   * Enviar mensagem broadcast para todos os agentes
   * @param {string} content - Conteúdo da mensagem
   * @param {Object} options - Opções adicionais
   */
  broadcast(content, options = {}) {
    const message = {
      id: `broadcast_${Date.now()}`,
      senderId: 'network',
      recipientId: 'all',
      type: 'broadcast',
      content,
      timestamp: Date.now(),
      priority: options.priority || 'medium',
      metadata: options.metadata || {}
    };
    
    this.a2aNetwork.broadcast(message);
  }

  /**
   * Encontrar agentes por capacidade
   * @param {string} capability - Capacidade desejada
   * @returns {Array<UnifiedAgent>}
   */
  findAgentsByCapability(capability) {
    return Array.from(this.agents.values())
      .filter(agent => agent.capabilities.has(capability));
  }

  /**
   * Encontrar agentes por tipo de arquivo suportado
   * @param {string} fileType - Tipo de arquivo
   * @returns {Array<UnifiedAgent>}
   */
  findAgentsByFileType(fileType) {
    return Array.from(this.agents.values())
      .filter(agent => agent.supportedFileTypes.has(fileType) || agent.supportedFileTypes.has('*'));
  }

  /**
   * Obter agente por ID
   * @param {string} agentId - ID do agente
   * @returns {UnifiedAgent|null}
   */
  getAgent(agentId) {
    return this.agents.get(agentId) || null;
  }

  /**
   * Listar todos os agentes
   * @returns {Array<UnifiedAgent>}
   */
  listAgents() {
    return Array.from(this.agents.values());
  }

  /**
   * Obter estatísticas da rede
   * @returns {Object}
   */
  getNetworkStats() {
    const agentStats = {};
    
    for (const [id, agent] of this.agents.entries()) {
      agentStats[id] = agent.getStats();
    }
    
    return {
      network: {
        ...this.networkStats,
        uptime: Date.now() - this.networkStats.networkUptime
      },
      agents: agentStats,
      a2a: this.a2aNetwork.getStats(),
      mcp: this.mcpProtocol.getStats()
    };
  }

  /**
   * Resetar estatísticas da rede
   */
  resetStats() {
    this.networkStats = {
      totalAgents: this.agents.size,
      activeAgents: this.agents.size,
      totalMessages: 0,
      totalTasks: 0,
      networkUptime: Date.now()
    };
    
    // Resetar estatísticas dos agentes
    for (const agent of this.agents.values()) {
      agent.stats = {
        messagesReceived: 0,
        messagesSent: 0,
        tasksCompleted: 0,
        tasksFailed: 0,
        filesProcessed: 0,
        contextUpdates: 0,
        uptime: Date.now()
      };
    }
  }

  /**
   * Destruir a rede e todos os agentes
   */
  destroy() {
    // Destruir todos os agentes
    for (const agent of this.agents.values()) {
      agent.destroy();
    }
    
    this.agents.clear();
    this.a2aNetwork.destroy();
    
    if (this.options.enableLogging) {
      console.log('Rede de agentes destruída');
    }
  }
}

// Instância singleton da rede de agentes
export const unifiedAgentNetwork = new UnifiedAgentNetwork();

export default {
  UnifiedAgent,
  UnifiedAgentNetwork,
  unifiedAgentNetwork,
  COMMUNICATION_TYPES,
  COMMUNICATION_STATES,
  EVENT_TYPES
};
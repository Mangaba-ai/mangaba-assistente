/**
 * Protocolo A2A (Agent-to-Agent) para comunicação entre agentes
 * Suporta agentes com diferentes LLMs e capacidades
 */

import { EventEmitter } from 'events';

// Tipos de mensagem A2A
export const A2A_MESSAGE_TYPES = {
  REQUEST: 'request',
  RESPONSE: 'response',
  NOTIFICATION: 'notification',
  HEARTBEAT: 'heartbeat',
  CAPABILITY_QUERY: 'capability_query',
  CAPABILITY_RESPONSE: 'capability_response',
  TASK_DELEGATION: 'task_delegation',
  TASK_RESULT: 'task_result',
  ERROR: 'error'
};

// Status de agente
export const AGENT_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  BUSY: 'busy',
  IDLE: 'idle',
  ERROR: 'error'
};

// Prioridades de mensagem
export const MESSAGE_PRIORITY = {
  LOW: 0,
  NORMAL: 1,
  HIGH: 2,
  URGENT: 3
};

/**
 * Classe para representar uma mensagem A2A
 */
export class A2AMessage {
  constructor({
    id = null,
    type,
    from,
    to,
    payload,
    priority = MESSAGE_PRIORITY.NORMAL,
    timestamp = null,
    correlationId = null,
    ttl = 30000 // 30 segundos
  }) {
    this.id = id || this.generateId();
    this.type = type;
    this.from = from;
    this.to = to;
    this.payload = payload;
    this.priority = priority;
    this.timestamp = timestamp || Date.now();
    this.correlationId = correlationId;
    this.ttl = ttl;
  }

  generateId() {
    return `a2a_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  isExpired() {
    return Date.now() - this.timestamp > this.ttl;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      from: this.from,
      to: this.to,
      payload: this.payload,
      priority: this.priority,
      timestamp: this.timestamp,
      correlationId: this.correlationId,
      ttl: this.ttl
    };
  }

  static fromJSON(data) {
    return new A2AMessage(data);
  }
}

/**
 * Classe para representar capacidades de um agente
 */
export class AgentCapabilities {
  constructor({
    llmProvider,
    llmModel,
    supportedFileTypes = [],
    specializations = [],
    maxConcurrentTasks = 1,
    averageResponseTime = 5000,
    reliability = 0.95
  }) {
    this.llmProvider = llmProvider;
    this.llmModel = llmModel;
    this.supportedFileTypes = supportedFileTypes;
    this.specializations = specializations;
    this.maxConcurrentTasks = maxConcurrentTasks;
    this.averageResponseTime = averageResponseTime;
    this.reliability = reliability;
  }

  canHandle(task) {
    // Verificar se o agente pode lidar com o tipo de tarefa
    if (task.fileType && !this.supportedFileTypes.includes(task.fileType)) {
      return false;
    }
    
    if (task.specialization && !this.specializations.includes(task.specialization)) {
      return false;
    }
    
    return true;
  }

  getScore(task) {
    // Calcular pontuação baseada na adequação para a tarefa
    let score = this.reliability;
    
    if (task.specialization && this.specializations.includes(task.specialization)) {
      score += 0.3;
    }
    
    if (task.fileType && this.supportedFileTypes.includes(task.fileType)) {
      score += 0.2;
    }
    
    // Penalizar por tempo de resposta alto
    score -= (this.averageResponseTime / 10000) * 0.1;
    
    return Math.max(0, Math.min(1, score));
  }
}

/**
 * Classe para representar um agente no protocolo A2A
 */
export class A2AAgent extends EventEmitter {
  constructor({
    id,
    name,
    capabilities,
    llmService,
    fileProcessingService
  }) {
    super();
    this.id = id;
    this.name = name;
    this.capabilities = capabilities;
    this.llmService = llmService;
    this.fileProcessingService = fileProcessingService;
    this.status = AGENT_STATUS.IDLE;
    this.currentTasks = new Map();
    this.messageQueue = [];
    this.pendingResponses = new Map();
    this.lastHeartbeat = Date.now();
    
    this.startHeartbeat();
  }

  /**
   * Enviar mensagem para outro agente
   * @param {string} targetAgentId - ID do agente destino
   * @param {string} type - Tipo da mensagem
   * @param {Object} payload - Conteúdo da mensagem
   * @param {number} priority - Prioridade da mensagem
   * @returns {Promise<A2AMessage>}
   */
  async sendMessage(targetAgentId, type, payload, priority = MESSAGE_PRIORITY.NORMAL) {
    const message = new A2AMessage({
      type,
      from: this.id,
      to: targetAgentId,
      payload,
      priority
    });

    this.emit('message_sent', message);
    return message;
  }

  /**
   * Processar mensagem recebida
   * @param {A2AMessage} message - Mensagem recebida
   */
  async processMessage(message) {
    try {
      if (message.isExpired()) {
        console.warn(`Mensagem expirada recebida: ${message.id}`);
        return;
      }

      this.emit('message_received', message);

      switch (message.type) {
        case A2A_MESSAGE_TYPES.REQUEST:
          await this.handleRequest(message);
          break;
        case A2A_MESSAGE_TYPES.RESPONSE:
          await this.handleResponse(message);
          break;
        case A2A_MESSAGE_TYPES.CAPABILITY_QUERY:
          await this.handleCapabilityQuery(message);
          break;
        case A2A_MESSAGE_TYPES.TASK_DELEGATION:
          await this.handleTaskDelegation(message);
          break;
        case A2A_MESSAGE_TYPES.HEARTBEAT:
          await this.handleHeartbeat(message);
          break;
        default:
          console.warn(`Tipo de mensagem não suportado: ${message.type}`);
      }
    } catch (error) {
      console.error(`Erro ao processar mensagem: ${error.message}`);
      await this.sendErrorResponse(message, error.message);
    }
  }

  /**
   * Lidar com requisição
   * @param {A2AMessage} message - Mensagem de requisição
   */
  async handleRequest(message) {
    const { task, prompt, files } = message.payload;
    
    try {
      let result;
      
      if (files && files.length > 0) {
        // Processar arquivos se fornecidos
        const fileResults = await Promise.all(
          files.map(file => this.fileProcessingService.processFile(file))
        );
        
        const fileContents = fileResults
          .filter(r => r.success)
          .map(r => r.result.content)
          .join('\n\n');
        
        const fullPrompt = `${prompt}\n\nArquivos processados:\n${fileContents}`;
        result = await this.llmService.sendMessage(fullPrompt);
      } else {
        result = await this.llmService.sendMessage(prompt);
      }
      
      const response = new A2AMessage({
        type: A2A_MESSAGE_TYPES.RESPONSE,
        from: this.id,
        to: message.from,
        payload: { result, success: true },
        correlationId: message.id
      });
      
      this.emit('message_sent', response);
    } catch (error) {
      await this.sendErrorResponse(message, error.message);
    }
  }

  /**
   * Lidar com resposta
   * @param {A2AMessage} message - Mensagem de resposta
   */
  async handleResponse(message) {
    const pendingRequest = this.pendingResponses.get(message.correlationId);
    
    if (pendingRequest) {
      pendingRequest.resolve(message.payload);
      this.pendingResponses.delete(message.correlationId);
    }
  }

  /**
   * Lidar com consulta de capacidades
   * @param {A2AMessage} message - Mensagem de consulta
   */
  async handleCapabilityQuery(message) {
    const response = new A2AMessage({
      type: A2A_MESSAGE_TYPES.CAPABILITY_RESPONSE,
      from: this.id,
      to: message.from,
      payload: {
        capabilities: this.capabilities,
        status: this.status,
        currentLoad: this.currentTasks.size
      },
      correlationId: message.id
    });
    
    this.emit('message_sent', response);
  }

  /**
   * Lidar com delegação de tarefa
   * @param {A2AMessage} message - Mensagem de delegação
   */
  async handleTaskDelegation(message) {
    const { taskId, task } = message.payload;
    
    if (!this.capabilities.canHandle(task)) {
      await this.sendErrorResponse(message, 'Agente não pode lidar com esta tarefa');
      return;
    }
    
    if (this.currentTasks.size >= this.capabilities.maxConcurrentTasks) {
      await this.sendErrorResponse(message, 'Agente está sobrecarregado');
      return;
    }
    
    this.currentTasks.set(taskId, task);
    this.status = AGENT_STATUS.BUSY;
    
    try {
      const result = await this.executeTask(task);
      
      const response = new A2AMessage({
        type: A2A_MESSAGE_TYPES.TASK_RESULT,
        from: this.id,
        to: message.from,
        payload: { taskId, result, success: true },
        correlationId: message.id
      });
      
      this.emit('message_sent', response);
    } catch (error) {
      await this.sendErrorResponse(message, error.message);
    } finally {
      this.currentTasks.delete(taskId);
      this.status = this.currentTasks.size > 0 ? AGENT_STATUS.BUSY : AGENT_STATUS.IDLE;
    }
  }

  /**
   * Lidar com heartbeat
   * @param {A2AMessage} message - Mensagem de heartbeat
   */
  async handleHeartbeat(message) {
    // Atualizar timestamp do último heartbeat do remetente
    this.emit('agent_heartbeat', {
      agentId: message.from,
      timestamp: message.timestamp
    });
  }

  /**
   * Executar tarefa
   * @param {Object} task - Tarefa a ser executada
   * @returns {Promise<any>}
   */
  async executeTask(task) {
    const { type, prompt, files, options = {} } = task;
    
    switch (type) {
      case 'text_processing':
        return await this.llmService.sendMessage(prompt, null, options);
      
      case 'file_processing':
        if (!files || files.length === 0) {
          throw new Error('Nenhum arquivo fornecido para processamento');
        }
        
        const fileResults = await Promise.all(
          files.map(file => this.fileProcessingService.processFile(file))
        );
        
        const processedContent = fileResults
          .filter(r => r.success)
          .map(r => r.result)
          .join('\n\n');
        
        return await this.llmService.processFile(processedContent, prompt);
      
      default:
        throw new Error(`Tipo de tarefa não suportado: ${type}`);
    }
  }

  /**
   * Enviar resposta de erro
   * @param {A2AMessage} originalMessage - Mensagem original
   * @param {string} errorMessage - Mensagem de erro
   */
  async sendErrorResponse(originalMessage, errorMessage) {
    const errorResponse = new A2AMessage({
      type: A2A_MESSAGE_TYPES.ERROR,
      from: this.id,
      to: originalMessage.from,
      payload: { error: errorMessage, success: false },
      correlationId: originalMessage.id
    });
    
    this.emit('message_sent', errorResponse);
  }

  /**
   * Iniciar heartbeat
   */
  startHeartbeat() {
    setInterval(() => {
      const heartbeat = new A2AMessage({
        type: A2A_MESSAGE_TYPES.HEARTBEAT,
        from: this.id,
        to: 'broadcast',
        payload: {
          status: this.status,
          capabilities: this.capabilities,
          currentLoad: this.currentTasks.size
        }
      });
      
      this.emit('heartbeat', heartbeat);
      this.lastHeartbeat = Date.now();
    }, 10000); // A cada 10 segundos
  }

  /**
   * Fazer requisição com resposta
   * @param {string} targetAgentId - ID do agente destino
   * @param {Object} payload - Conteúdo da requisição
   * @param {number} timeout - Timeout em ms
   * @returns {Promise<any>}
   */
  async requestWithResponse(targetAgentId, payload, timeout = 30000) {
    const message = await this.sendMessage(
      targetAgentId,
      A2A_MESSAGE_TYPES.REQUEST,
      payload,
      MESSAGE_PRIORITY.NORMAL
    );
    
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.pendingResponses.delete(message.id);
        reject(new Error('Timeout na resposta'));
      }, timeout);
      
      this.pendingResponses.set(message.id, {
        resolve: (response) => {
          clearTimeout(timeoutId);
          resolve(response);
        },
        reject: (error) => {
          clearTimeout(timeoutId);
          reject(error);
        }
      });
    });
  }

  /**
   * Obter status do agente
   * @returns {Object}
   */
  getStatus() {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      capabilities: this.capabilities,
      currentTasks: this.currentTasks.size,
      lastHeartbeat: this.lastHeartbeat
    };
  }
}

/**
 * Gerenciador de rede A2A
 */
export class A2ANetwork extends EventEmitter {
  constructor() {
    super();
    this.agents = new Map();
    this.messageRoutes = new Map();
    this.messageHistory = [];
    this.maxHistorySize = 1000;
  }

  /**
   * Registrar agente na rede
   * @param {A2AAgent} agent - Agente a ser registrado
   */
  registerAgent(agent) {
    this.agents.set(agent.id, agent);
    
    // Configurar roteamento de mensagens
    agent.on('message_sent', (message) => {
      this.routeMessage(message);
    });
    
    agent.on('heartbeat', (heartbeat) => {
      this.broadcastMessage(heartbeat);
    });
    
    this.emit('agent_registered', agent);
  }

  /**
   * Remover agente da rede
   * @param {string} agentId - ID do agente
   */
  unregisterAgent(agentId) {
    const agent = this.agents.get(agentId);
    if (agent) {
      this.agents.delete(agentId);
      this.emit('agent_unregistered', agent);
    }
  }

  /**
   * Rotear mensagem
   * @param {A2AMessage} message - Mensagem a ser roteada
   */
  async routeMessage(message) {
    this.addToHistory(message);
    
    if (message.to === 'broadcast') {
      this.broadcastMessage(message);
    } else {
      const targetAgent = this.agents.get(message.to);
      if (targetAgent) {
        await targetAgent.processMessage(message);
      } else {
        console.warn(`Agente destino não encontrado: ${message.to}`);
      }
    }
  }

  /**
   * Broadcast de mensagem
   * @param {A2AMessage} message - Mensagem para broadcast
   */
  broadcastMessage(message) {
    for (const [agentId, agent] of this.agents) {
      if (agentId !== message.from) {
        agent.processMessage(message).catch(error => {
          console.error(`Erro ao entregar mensagem para ${agentId}: ${error.message}`);
        });
      }
    }
  }

  /**
   * Encontrar melhor agente para tarefa
   * @param {Object} task - Tarefa a ser executada
   * @returns {A2AAgent|null}
   */
  findBestAgentForTask(task) {
    let bestAgent = null;
    let bestScore = 0;
    
    for (const [agentId, agent] of this.agents) {
      if (agent.status === AGENT_STATUS.OFFLINE || agent.status === AGENT_STATUS.ERROR) {
        continue;
      }
      
      if (!agent.capabilities.canHandle(task)) {
        continue;
      }
      
      const score = agent.capabilities.getScore(task);
      if (score > bestScore) {
        bestScore = score;
        bestAgent = agent;
      }
    }
    
    return bestAgent;
  }

  /**
   * Obter agentes disponíveis
   * @returns {Array<A2AAgent>}
   */
  getAvailableAgents() {
    return Array.from(this.agents.values()).filter(
      agent => agent.status !== AGENT_STATUS.OFFLINE && agent.status !== AGENT_STATUS.ERROR
    );
  }

  /**
   * Adicionar mensagem ao histórico
   * @param {A2AMessage} message - Mensagem
   */
  addToHistory(message) {
    this.messageHistory.push(message);
    
    if (this.messageHistory.length > this.maxHistorySize) {
      this.messageHistory.shift();
    }
  }

  /**
   * Obter estatísticas da rede
   * @returns {Object}
   */
  getNetworkStats() {
    const agents = Array.from(this.agents.values());
    
    return {
      totalAgents: agents.length,
      onlineAgents: agents.filter(a => a.status === AGENT_STATUS.ONLINE || a.status === AGENT_STATUS.IDLE).length,
      busyAgents: agents.filter(a => a.status === AGENT_STATUS.BUSY).length,
      offlineAgents: agents.filter(a => a.status === AGENT_STATUS.OFFLINE).length,
      totalMessages: this.messageHistory.length,
      averageResponseTime: this.calculateAverageResponseTime()
    };
  }

  /**
   * Calcular tempo médio de resposta
   * @returns {number}
   */
  calculateAverageResponseTime() {
    const agents = Array.from(this.agents.values());
    if (agents.length === 0) return 0;
    
    const totalTime = agents.reduce((sum, agent) => sum + agent.capabilities.averageResponseTime, 0);
    return totalTime / agents.length;
  }
}

// Instância singleton da rede A2A
export const a2aNetwork = new A2ANetwork();

export default a2aNetwork;
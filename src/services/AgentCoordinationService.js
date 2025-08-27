import { v4 as uuidv4 } from 'uuid';

/**
 * Serviço para coordenação e colaboração entre múltiplos agentes ativos
 */
class AgentCoordinationService {
  constructor() {
    this.activeAgents = new Map();
    this.taskQueue = [];
    this.sharedContext = new Map();
    this.collaborationSessions = new Map();
    this.eventListeners = new Map();
    this.agentCapabilities = new Map();
  }

  // ========== Gerenciamento de Agentes ==========

  /**
   * Registra um agente ativo no sistema de coordenação
   */
  registerAgent(agent, connection) {
    const agentId = agent.id;
    
    this.activeAgents.set(agentId, {
      ...agent,
      connection,
      status: 'available',
      currentTasks: [],
      lastActivity: new Date(),
      collaborationHistory: []
    });

    // Mapear capacidades do agente
    this.mapAgentCapabilities(agent);
    
    this.emit('agent:registered', { agentId, agent });
    console.log(`Agente ${agent.name} registrado para coordenação`);
  }

  /**
   * Remove um agente do sistema de coordenação
   */
  unregisterAgent(agentId) {
    const agent = this.activeAgents.get(agentId);
    if (agent) {
      // Redistribuir tarefas pendentes
      this.redistributeAgentTasks(agentId);
      
      this.activeAgents.delete(agentId);
      this.agentCapabilities.delete(agentId);
      
      this.emit('agent:unregistered', { agentId });
      console.log(`Agente ${agentId} removido da coordenação`);
    }
  }

  /**
   * Mapeia as capacidades de um agente baseado em sua especialização
   */
  mapAgentCapabilities(agent) {
    const capabilities = [];
    
    // Baseado no protocolo
    if (agent.protocol === 'A2A') {
      capabilities.push('inter_agent_communication', 'task_delegation');
    }
    if (agent.protocol === 'MCP') {
      capabilities.push('context_sharing', 'tool_usage');
    }
    
    // Baseado na especialização (se disponível)
    if (agent.specializations) {
      agent.specializations.forEach(spec => {
        switch (spec) {
          case 'code_analysis':
            capabilities.push('code_review', 'debugging', 'refactoring');
            break;
          case 'document_processing':
            capabilities.push('text_analysis', 'summarization', 'translation');
            break;
          case 'data_analysis':
            capabilities.push('data_processing', 'statistics', 'visualization');
            break;
          case 'general':
            capabilities.push('conversation', 'general_assistance');
            break;
          default:
            // Especialização não reconhecida, adicionar capacidade genérica
            capabilities.push('general_assistance');
            break;
        }
      });
    }
    
    // Capacidades padrão
    capabilities.push('text_processing', 'conversation');
    
    this.agentCapabilities.set(agent.id, capabilities);
  }

  // ========== Coordenação de Tarefas ==========

  /**
   * Cria uma sessão de colaboração entre agentes
   */
  async createCollaborationSession(userMessage, agents) {
    const taskId = uuidv4();
    const subtasks = this.analyzeAndSplitTask('collaboration', userMessage);
    
    const collaborationSession = {
      id: taskId,
      originalTask: 'collaboration',
      userMessage,
      subtasks,
      assignedAgents: [],
      results: [],
      status: 'in_progress',
      startTime: new Date(),
      sharedContext: new Map()
    };
    
    this.collaborationSessions.set(taskId, collaborationSession);
    
    // Atribuir subtarefas aos agentes mais adequados
    for (const subtask of subtasks) {
      const bestAgent = this.findBestAgentForTask(subtask);
      if (bestAgent) {
        await this.assignTaskToAgent(taskId, subtask, bestAgent.id);
      }
    }
    
    this.emit('task:distributed', { taskId, collaborationSession });
    return collaborationSession;
  }

  /**
   * Distribui uma tarefa complexa entre múltiplos agentes
   */
  async distributeComplexTask(task, userMessage) {
    const taskId = uuidv4();
    const subtasks = this.analyzeAndSplitTask(task, userMessage);
    
    const collaborationSession = {
      id: taskId,
      originalTask: task,
      userMessage,
      subtasks,
      assignedAgents: [],
      results: [],
      status: 'in_progress',
      startTime: new Date(),
      sharedContext: new Map()
    };
    
    this.collaborationSessions.set(taskId, collaborationSession);
    
    // Atribuir subtarefas aos agentes mais adequados
    for (const subtask of subtasks) {
      const bestAgent = this.findBestAgentForTask(subtask);
      if (bestAgent) {
        await this.assignTaskToAgent(taskId, subtask, bestAgent.id);
      }
    }
    
    this.emit('task:distributed', { taskId, collaborationSession });
    return taskId;
  }

  /**
   * Analisa uma tarefa e a divide em subtarefas
   */
  analyzeAndSplitTask(task, userMessage) {
    const subtasks = [];
    const messageText = userMessage.toLowerCase();
    
    // Análise simples baseada em palavras-chave
    if (messageText.includes('código') || messageText.includes('programação')) {
      subtasks.push({
        id: uuidv4(),
        type: 'code_analysis',
        description: 'Analisar aspectos técnicos e de código',
        priority: 'high',
        requiredCapabilities: ['code_review', 'debugging']
      });
    }
    
    if (messageText.includes('documento') || messageText.includes('texto')) {
      subtasks.push({
        id: uuidv4(),
        type: 'document_processing',
        description: 'Processar e analisar documentos',
        priority: 'medium',
        requiredCapabilities: ['text_analysis', 'summarization']
      });
    }
    
    if (messageText.includes('dados') || messageText.includes('análise')) {
      subtasks.push({
        id: uuidv4(),
        type: 'data_analysis',
        description: 'Analisar dados e gerar insights',
        priority: 'medium',
        requiredCapabilities: ['data_processing', 'statistics']
      });
    }
    
    // Sempre incluir uma tarefa de coordenação geral
    subtasks.push({
      id: uuidv4(),
      type: 'general_coordination',
      description: 'Coordenar resposta geral e síntese',
      priority: 'high',
      requiredCapabilities: ['conversation', 'general_assistance']
    });
    
    return subtasks;
  }

  /**
   * Encontra o melhor agente para uma tarefa específica
   */
  findBestAgentForTask(subtask) {
    let bestAgent = null;
    let bestScore = 0;
    
    for (const [agentId, agent] of this.activeAgents) {
      if (agent.status !== 'available') continue;
      
      const capabilities = this.agentCapabilities.get(agentId) || [];
      let score = 0;
      
      // Calcular pontuação baseada nas capacidades necessárias
      for (const requiredCap of subtask.requiredCapabilities) {
        if (capabilities.includes(requiredCap)) {
          score += 10;
        }
      }
      
      // Bonus por especialização
      if (agent.specializations) {
        for (const spec of agent.specializations) {
          if (subtask.type.includes(spec.replace('_', ''))) {
            score += 20;
          }
        }
      }
      
      // Penalidade por carga de trabalho atual
      score -= agent.currentTasks.length * 5;
      
      if (score > bestScore) {
        bestScore = score;
        bestAgent = agent;
      }
    }
    
    return bestAgent;
  }

  /**
   * Atribui uma tarefa específica a um agente
   */
  async assignTaskToAgent(sessionId, subtask, agentId) {
    const agent = this.activeAgents.get(agentId);
    const session = this.collaborationSessions.get(sessionId);
    
    if (!agent || !session) return;
    
    // Atualizar estado do agente
    agent.currentTasks.push({
      sessionId,
      subtaskId: subtask.id,
      assignedAt: new Date()
    });
    agent.status = 'busy';
    
    // Atualizar sessão
    session.assignedAgents.push({
      agentId,
      subtaskId: subtask.id,
      assignedAt: new Date()
    });
    
    this.emit('task:assigned', { sessionId, subtask, agentId });
    
    // Simular execução da tarefa
    setTimeout(() => {
      this.completeSubtask(sessionId, subtask.id, agentId);
    }, 2000 + Math.random() * 3000);
  }

  /**
   * Marca uma subtarefa como completa
   */
  completeSubtask(sessionId, subtaskId, agentId) {
    const agent = this.activeAgents.get(agentId);
    const session = this.collaborationSessions.get(sessionId);
    
    if (!agent || !session) return;
    
    // Simular resultado da tarefa
    const result = {
      subtaskId,
      agentId,
      result: `Resultado da subtarefa ${subtaskId} pelo agente ${agent.name}`,
      completedAt: new Date(),
      confidence: 0.8 + Math.random() * 0.2
    };
    
    session.results.push(result);
    
    // Atualizar estado do agente
    agent.currentTasks = agent.currentTasks.filter(task => task.subtaskId !== subtaskId);
    if (agent.currentTasks.length === 0) {
      agent.status = 'available';
    }
    
    this.emit('subtask:completed', { sessionId, result });
    
    // Verificar se todas as subtarefas foram completadas
    this.checkSessionCompletion(sessionId);
  }

  /**
   * Verifica se uma sessão de colaboração foi completada
   */
  checkSessionCompletion(sessionId) {
    const session = this.collaborationSessions.get(sessionId);
    if (!session) return;
    
    if (session.results.length >= session.subtasks.length) {
      session.status = 'completed';
      session.endTime = new Date();
      
      // Sintetizar resultados
      const finalResult = this.synthesizeResults(session);
      session.finalResult = finalResult;
      
      this.emit('session:completed', { sessionId, session, finalResult });
    }
  }

  /**
   * Sintetiza os resultados de múltiplos agentes
   */
  synthesizeResults(session) {
    const results = session.results;
    
    let synthesis = `Análise colaborativa para: "${session.userMessage}"\n\n`;
    
    // Agrupar resultados por tipo
    const resultsByType = {};
    results.forEach(result => {
      const subtask = session.subtasks.find(st => st.id === result.subtaskId);
      if (subtask) {
        if (!resultsByType[subtask.type]) {
          resultsByType[subtask.type] = [];
        }
        resultsByType[subtask.type].push(result);
      }
    });
    
    // Sintetizar por categoria
    Object.entries(resultsByType).forEach(([type, typeResults]) => {
      synthesis += `**${this.getTypeDisplayName(type)}:**\n`;
      typeResults.forEach(result => {
        synthesis += `- ${result.result}\n`;
      });
      synthesis += '\n';
    });
    
    synthesis += `\n*Análise realizada por ${results.length} agentes especializados em colaboração.*`;
    
    return synthesis;
  }

  /**
   * Obtém nome de exibição para tipos de tarefa
   */
  getTypeDisplayName(type) {
    const displayNames = {
      'code_analysis': 'Análise de Código',
      'document_processing': 'Processamento de Documentos',
      'data_analysis': 'Análise de Dados',
      'general_coordination': 'Coordenação Geral'
    };
    return displayNames[type] || type;
  }

  // ========== Contexto Compartilhado ==========

  /**
   * Compartilha contexto entre agentes
   */
  shareContext(fromAgentId, toAgentId, contextKey, contextData) {
    const contextId = `${fromAgentId}-${toAgentId}-${contextKey}`;
    
    this.sharedContext.set(contextId, {
      from: fromAgentId,
      to: toAgentId,
      key: contextKey,
      data: contextData,
      timestamp: new Date()
    });
    
    this.emit('context:shared', { fromAgentId, toAgentId, contextKey });
  }

  /**
   * Obtém contexto compartilhado
   */
  getSharedContext(agentId, contextKey) {
    const contexts = [];
    
    for (const [contextId, context] of this.sharedContext) {
      if (context.to === agentId && context.key === contextKey) {
        contexts.push(context);
      }
    }
    
    return contexts;
  }

  // ========== Redistribuição de Tarefas ==========

  /**
   * Redistribui tarefas quando um agente fica indisponível
   */
  redistributeAgentTasks(unavailableAgentId) {
    const agent = this.activeAgents.get(unavailableAgentId);
    if (!agent || agent.currentTasks.length === 0) return;
    
    for (const task of agent.currentTasks) {
      const session = this.collaborationSessions.get(task.sessionId);
      if (session) {
        const subtask = session.subtasks.find(st => st.id === task.subtaskId);
        if (subtask) {
          // Encontrar novo agente
          const newAgent = this.findBestAgentForTask(subtask);
          if (newAgent) {
            this.assignTaskToAgent(task.sessionId, subtask, newAgent.id);
          }
        }
      }
    }
  }

  // ========== Utilitários ==========

  /**
   * Obtém estatísticas de coordenação
   */
  getCoordinationStats() {
    return {
      activeAgents: this.activeAgents.size,
      activeSessions: Array.from(this.collaborationSessions.values())
        .filter(session => session.status === 'in_progress').length,
      completedSessions: Array.from(this.collaborationSessions.values())
        .filter(session => session.status === 'completed').length,
      sharedContexts: this.sharedContext.size
    };
  }

  /**
   * Lista agentes disponíveis
   */
  getAvailableAgents() {
    return Array.from(this.activeAgents.values())
      .filter(agent => agent.status === 'available');
  }

  // ========== Sistema de Eventos ==========

  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Erro no listener do evento ${event}:`, error);
        }
      });
    }
  }
}

// Instância singleton
const agentCoordinationService = new AgentCoordinationService();
export default agentCoordinationService;
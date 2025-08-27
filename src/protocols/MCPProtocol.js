/**
 * Protocolo MCP (Model Context Protocol) para contexto compartilhado
 * Permite que agentes com diferentes LLMs compartilhem contexto e estado
 */

import { EventEmitter } from 'events';

// Tipos de contexto
export const CONTEXT_TYPES = {
  CONVERSATION: 'conversation',
  TASK: 'task',
  KNOWLEDGE: 'knowledge',
  STATE: 'state',
  MEMORY: 'memory',
  PREFERENCE: 'preference',
  CAPABILITY: 'capability'
};

// Níveis de acesso ao contexto
export const ACCESS_LEVELS = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  SHARED: 'shared',
  RESTRICTED: 'restricted'
};

// Operações de contexto
export const CONTEXT_OPERATIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe',
  SYNC: 'sync'
};

/**
 * Classe para representar um item de contexto
 */
export class ContextItem {
  constructor({
    id = null,
    type,
    key,
    value,
    metadata = {},
    accessLevel = ACCESS_LEVELS.SHARED,
    ownerId,
    createdAt = null,
    updatedAt = null,
    expiresAt = null,
    version = 1
  }) {
    this.id = id || this.generateId();
    this.type = type;
    this.key = key;
    this.value = value;
    this.metadata = metadata;
    this.accessLevel = accessLevel;
    this.ownerId = ownerId;
    this.createdAt = createdAt || Date.now();
    this.updatedAt = updatedAt || Date.now();
    this.expiresAt = expiresAt;
    this.version = version;
  }

  generateId() {
    return `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  isExpired() {
    return this.expiresAt && Date.now() > this.expiresAt;
  }

  canAccess(agentId, operation) {
    switch (this.accessLevel) {
      case ACCESS_LEVELS.PUBLIC:
        return true;
      case ACCESS_LEVELS.PRIVATE:
        return this.ownerId === agentId;
      case ACCESS_LEVELS.SHARED:
        return operation === CONTEXT_OPERATIONS.READ || this.ownerId === agentId;
      case ACCESS_LEVELS.RESTRICTED:
        return this.metadata.allowedAgents?.includes(agentId) || this.ownerId === agentId;
      default:
        return false;
    }
  }

  update(newValue, metadata = {}) {
    this.value = newValue;
    this.metadata = { ...this.metadata, ...metadata };
    this.updatedAt = Date.now();
    this.version += 1;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      key: this.key,
      value: this.value,
      metadata: this.metadata,
      accessLevel: this.accessLevel,
      ownerId: this.ownerId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      expiresAt: this.expiresAt,
      version: this.version
    };
  }

  static fromJSON(data) {
    return new ContextItem(data);
  }
}

/**
 * Classe para gerenciar contexto de conversação
 */
export class ConversationContext {
  constructor(conversationId, participants = []) {
    this.conversationId = conversationId;
    this.participants = new Set(participants);
    this.messages = [];
    this.sharedState = new Map();
    this.createdAt = Date.now();
    this.lastActivity = Date.now();
  }

  addMessage(message) {
    this.messages.push({
      id: this.generateMessageId(),
      ...message,
      timestamp: Date.now()
    });
    this.lastActivity = Date.now();
  }

  addParticipant(agentId) {
    this.participants.add(agentId);
  }

  removeParticipant(agentId) {
    this.participants.delete(agentId);
  }

  setSharedState(key, value) {
    this.sharedState.set(key, value);
    this.lastActivity = Date.now();
  }

  getSharedState(key) {
    return this.sharedState.get(key);
  }

  getRecentMessages(limit = 10) {
    return this.messages.slice(-limit);
  }

  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  toJSON() {
    return {
      conversationId: this.conversationId,
      participants: Array.from(this.participants),
      messages: this.messages,
      sharedState: Object.fromEntries(this.sharedState),
      createdAt: this.createdAt,
      lastActivity: this.lastActivity
    };
  }
}

/**
 * Classe para gerenciar contexto de tarefa
 */
export class TaskContext {
  constructor(taskId, type, description) {
    this.taskId = taskId;
    this.type = type;
    this.description = description;
    this.status = 'pending';
    this.assignedAgents = new Set();
    this.dependencies = [];
    this.results = new Map();
    this.metadata = {};
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
  }

  assignAgent(agentId) {
    this.assignedAgents.add(agentId);
    this.updatedAt = Date.now();
  }

  unassignAgent(agentId) {
    this.assignedAgents.delete(agentId);
    this.updatedAt = Date.now();
  }

  addDependency(taskId) {
    this.dependencies.push(taskId);
  }

  setResult(agentId, result) {
    this.results.set(agentId, {
      result,
      timestamp: Date.now()
    });
    this.updatedAt = Date.now();
  }

  updateStatus(status) {
    this.status = status;
    this.updatedAt = Date.now();
  }

  toJSON() {
    return {
      taskId: this.taskId,
      type: this.type,
      description: this.description,
      status: this.status,
      assignedAgents: Array.from(this.assignedAgents),
      dependencies: this.dependencies,
      results: Object.fromEntries(this.results),
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

/**
 * Classe principal do protocolo MCP
 */
export class MCPProtocol extends EventEmitter {
  constructor() {
    super();
    this.contexts = new Map();
    this.subscriptions = new Map();
    this.conversations = new Map();
    this.tasks = new Map();
    this.agents = new Set();
    this.syncQueue = [];
    this.isProcessingSync = false;
    
    this.startCleanupTimer();
  }

  /**
   * Registrar agente no protocolo MCP
   * @param {string} agentId - ID do agente
   */
  registerAgent(agentId) {
    this.agents.add(agentId);
    this.emit('agent_registered', agentId);
  }

  /**
   * Remover agente do protocolo MCP
   * @param {string} agentId - ID do agente
   */
  unregisterAgent(agentId) {
    this.agents.delete(agentId);
    
    // Limpar subscrições do agente
    for (const [contextId, subscribers] of this.subscriptions) {
      subscribers.delete(agentId);
      if (subscribers.size === 0) {
        this.subscriptions.delete(contextId);
      }
    }
    
    this.emit('agent_unregistered', agentId);
  }

  /**
   * Criar item de contexto
   * @param {string} agentId - ID do agente criador
   * @param {Object} contextData - Dados do contexto
   * @returns {ContextItem}
   */
  createContext(agentId, contextData) {
    const context = new ContextItem({
      ...contextData,
      ownerId: agentId
    });
    
    this.contexts.set(context.id, context);
    this.emit('context_created', context, agentId);
    
    // Notificar assinantes
    this.notifySubscribers(context.id, 'created', context);
    
    return context;
  }

  /**
   * Ler item de contexto
   * @param {string} agentId - ID do agente
   * @param {string} contextId - ID do contexto
   * @returns {ContextItem|null}
   */
  readContext(agentId, contextId) {
    const context = this.contexts.get(contextId);
    
    if (!context) {
      return null;
    }
    
    if (!context.canAccess(agentId, CONTEXT_OPERATIONS.READ)) {
      throw new Error('Acesso negado ao contexto');
    }
    
    if (context.isExpired()) {
      this.deleteContext(context.ownerId, contextId);
      return null;
    }
    
    return context;
  }

  /**
   * Atualizar item de contexto
   * @param {string} agentId - ID do agente
   * @param {string} contextId - ID do contexto
   * @param {any} newValue - Novo valor
   * @param {Object} metadata - Metadados adicionais
   * @returns {ContextItem}
   */
  updateContext(agentId, contextId, newValue, metadata = {}) {
    const context = this.contexts.get(contextId);
    
    if (!context) {
      throw new Error('Contexto não encontrado');
    }
    
    if (!context.canAccess(agentId, CONTEXT_OPERATIONS.UPDATE)) {
      throw new Error('Acesso negado para atualizar contexto');
    }
    
    context.update(newValue, metadata);
    this.emit('context_updated', context, agentId);
    
    // Notificar assinantes
    this.notifySubscribers(contextId, 'updated', context);
    
    return context;
  }

  /**
   * Deletar item de contexto
   * @param {string} agentId - ID do agente
   * @param {string} contextId - ID do contexto
   * @returns {boolean}
   */
  deleteContext(agentId, contextId) {
    const context = this.contexts.get(contextId);
    
    if (!context) {
      return false;
    }
    
    if (!context.canAccess(agentId, CONTEXT_OPERATIONS.DELETE)) {
      throw new Error('Acesso negado para deletar contexto');
    }
    
    this.contexts.delete(contextId);
    this.subscriptions.delete(contextId);
    
    this.emit('context_deleted', context, agentId);
    
    // Notificar assinantes
    this.notifySubscribers(contextId, 'deleted', context);
    
    return true;
  }

  /**
   * Subscrever a mudanças de contexto
   * @param {string} agentId - ID do agente
   * @param {string} contextId - ID do contexto
   */
  subscribeToContext(agentId, contextId) {
    if (!this.subscriptions.has(contextId)) {
      this.subscriptions.set(contextId, new Set());
    }
    
    this.subscriptions.get(contextId).add(agentId);
    this.emit('subscription_added', agentId, contextId);
  }

  /**
   * Cancelar subscrição de contexto
   * @param {string} agentId - ID do agente
   * @param {string} contextId - ID do contexto
   */
  unsubscribeFromContext(agentId, contextId) {
    const subscribers = this.subscriptions.get(contextId);
    
    if (subscribers) {
      subscribers.delete(agentId);
      
      if (subscribers.size === 0) {
        this.subscriptions.delete(contextId);
      }
    }
    
    this.emit('subscription_removed', agentId, contextId);
  }

  /**
   * Notificar assinantes sobre mudanças
   * @param {string} contextId - ID do contexto
   * @param {string} operation - Operação realizada
   * @param {ContextItem} context - Item de contexto
   */
  notifySubscribers(contextId, operation, context) {
    const subscribers = this.subscriptions.get(contextId);
    
    if (subscribers) {
      for (const agentId of subscribers) {
        this.emit('context_notification', {
          agentId,
          contextId,
          operation,
          context: context.toJSON()
        });
      }
    }
  }

  /**
   * Buscar contextos por critérios
   * @param {string} agentId - ID do agente
   * @param {Object} criteria - Critérios de busca
   * @returns {Array<ContextItem>}
   */
  searchContexts(agentId, criteria = {}) {
    const results = [];
    
    for (const context of this.contexts.values()) {
      if (!context.canAccess(agentId, CONTEXT_OPERATIONS.READ)) {
        continue;
      }
      
      if (context.isExpired()) {
        continue;
      }
      
      let matches = true;
      
      if (criteria.type && context.type !== criteria.type) {
        matches = false;
      }
      
      if (criteria.key && context.key !== criteria.key) {
        matches = false;
      }
      
      if (criteria.ownerId && context.ownerId !== criteria.ownerId) {
        matches = false;
      }
      
      if (criteria.accessLevel && context.accessLevel !== criteria.accessLevel) {
        matches = false;
      }
      
      if (matches) {
        results.push(context);
      }
    }
    
    return results;
  }

  /**
   * Criar contexto de conversação
   * @param {string} conversationId - ID da conversação
   * @param {Array<string>} participants - Participantes
   * @returns {ConversationContext}
   */
  createConversation(conversationId, participants = []) {
    const conversation = new ConversationContext(conversationId, participants);
    this.conversations.set(conversationId, conversation);
    
    this.emit('conversation_created', conversation);
    return conversation;
  }

  /**
   * Obter contexto de conversação
   * @param {string} conversationId - ID da conversação
   * @returns {ConversationContext|null}
   */
  getConversation(conversationId) {
    return this.conversations.get(conversationId) || null;
  }

  /**
   * Criar contexto de tarefa
   * @param {string} taskId - ID da tarefa
   * @param {string} type - Tipo da tarefa
   * @param {string} description - Descrição da tarefa
   * @returns {TaskContext}
   */
  createTask(taskId, type, description) {
    const task = new TaskContext(taskId, type, description);
    this.tasks.set(taskId, task);
    
    this.emit('task_created', task);
    return task;
  }

  /**
   * Obter contexto de tarefa
   * @param {string} taskId - ID da tarefa
   * @returns {TaskContext|null}
   */
  getTask(taskId) {
    return this.tasks.get(taskId) || null;
  }

  /**
   * Sincronizar contexto entre agentes
   * @param {string} sourceAgentId - Agente origem
   * @param {string} targetAgentId - Agente destino
   * @param {Array<string>} contextIds - IDs dos contextos
   */
  async syncContexts(sourceAgentId, targetAgentId, contextIds) {
    const syncOperation = {
      id: this.generateSyncId(),
      sourceAgentId,
      targetAgentId,
      contextIds,
      timestamp: Date.now()
    };
    
    this.syncQueue.push(syncOperation);
    
    if (!this.isProcessingSync) {
      await this.processSyncQueue();
    }
  }

  /**
   * Processar fila de sincronização
   */
  async processSyncQueue() {
    this.isProcessingSync = true;
    
    while (this.syncQueue.length > 0) {
      const operation = this.syncQueue.shift();
      
      try {
        await this.executeSyncOperation(operation);
      } catch (error) {
        console.error(`Erro na sincronização: ${error.message}`);
        this.emit('sync_error', operation, error);
      }
    }
    
    this.isProcessingSync = false;
  }

  /**
   * Executar operação de sincronização
   * @param {Object} operation - Operação de sincronização
   */
  async executeSyncOperation(operation) {
    const { sourceAgentId, targetAgentId, contextIds } = operation;
    
    const syncData = [];
    
    for (const contextId of contextIds) {
      const context = this.readContext(sourceAgentId, contextId);
      if (context) {
        syncData.push(context.toJSON());
      }
    }
    
    this.emit('sync_completed', {
      sourceAgentId,
      targetAgentId,
      syncData,
      operation
    });
  }

  /**
   * Gerar ID de sincronização
   * @returns {string}
   */
  generateSyncId() {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Iniciar timer de limpeza
   */
  startCleanupTimer() {
    setInterval(() => {
      this.cleanupExpiredContexts();
    }, 60000); // A cada minuto
  }

  /**
   * Limpar contextos expirados
   */
  cleanupExpiredContexts() {
    const expiredContexts = [];
    
    for (const [contextId, context] of this.contexts) {
      if (context.isExpired()) {
        expiredContexts.push(contextId);
      }
    }
    
    for (const contextId of expiredContexts) {
      this.contexts.delete(contextId);
      this.subscriptions.delete(contextId);
    }
    
    if (expiredContexts.length > 0) {
      this.emit('contexts_cleaned', expiredContexts);
    }
  }

  /**
   * Obter estatísticas do protocolo
   * @returns {Object}
   */
  getStats() {
    return {
      totalContexts: this.contexts.size,
      totalSubscriptions: this.subscriptions.size,
      totalConversations: this.conversations.size,
      totalTasks: this.tasks.size,
      registeredAgents: this.agents.size,
      syncQueueSize: this.syncQueue.length
    };
  }

  /**
   * Exportar todos os contextos
   * @param {string} agentId - ID do agente
   * @returns {Object}
   */
  exportContexts(agentId) {
    const exportData = {
      contexts: [],
      conversations: [],
      tasks: [],
      exportedAt: Date.now(),
      exportedBy: agentId
    };
    
    // Exportar contextos acessíveis
    for (const context of this.contexts.values()) {
      if (context.canAccess(agentId, CONTEXT_OPERATIONS.READ)) {
        exportData.contexts.push(context.toJSON());
      }
    }
    
    // Exportar conversações onde o agente participa
    for (const conversation of this.conversations.values()) {
      if (conversation.participants.has(agentId)) {
        exportData.conversations.push(conversation.toJSON());
      }
    }
    
    // Exportar tarefas atribuídas ao agente
    for (const task of this.tasks.values()) {
      if (task.assignedAgents.has(agentId)) {
        exportData.tasks.push(task.toJSON());
      }
    }
    
    return exportData;
  }
}

// Instância singleton do protocolo MCP
export const mcpProtocol = new MCPProtocol();

export default mcpProtocol;
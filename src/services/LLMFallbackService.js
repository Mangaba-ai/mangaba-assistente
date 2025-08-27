/**
 * Sistema de fallback entre LLMs para garantir alta disponibilidade
 * Gerencia múltiplos provedores e implementa estratégias de recuperação
 */

import { LLMService, LLM_PROVIDERS } from './LLMService.js';

// Tipos de erro que podem acionar fallback
export const FALLBACK_TRIGGERS = {
  RATE_LIMIT: 'rate_limit',
  TIMEOUT: 'timeout',
  AUTHENTICATION: 'authentication',
  SERVICE_UNAVAILABLE: 'service_unavailable',
  QUOTA_EXCEEDED: 'quota_exceeded',
  MODEL_UNAVAILABLE: 'model_unavailable',
  NETWORK_ERROR: 'network_error',
  UNKNOWN_ERROR: 'unknown_error'
};

// Estratégias de fallback
export const FALLBACK_STRATEGIES = {
  ROUND_ROBIN: 'round_robin',
  PRIORITY_BASED: 'priority_based',
  PERFORMANCE_BASED: 'performance_based',
  COST_OPTIMIZED: 'cost_optimized',
  SMART_ROUTING: 'smart_routing'
};

// Níveis de prioridade para provedores
export const PROVIDER_PRIORITY = {
  PRIMARY: 1,
  SECONDARY: 2,
  TERTIARY: 3,
  EMERGENCY: 4
};

/**
 * Configuração de um provedor LLM para fallback
 */
export class FallbackProviderConfig {
  constructor({
    provider,
    model,
    priority = PROVIDER_PRIORITY.SECONDARY,
    maxRetries = 3,
    retryDelay = 1000,
    timeout = 30000,
    costPerToken = 0.001,
    enabled = true,
    healthCheckInterval = 300000, // 5 minutos
    circuitBreakerThreshold = 5,
    circuitBreakerTimeout = 60000 // 1 minuto
  }) {
    this.provider = provider;
    this.model = model;
    this.priority = priority;
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
    this.timeout = timeout;
    this.costPerToken = costPerToken;
    this.enabled = enabled;
    this.healthCheckInterval = healthCheckInterval;
    this.circuitBreakerThreshold = circuitBreakerThreshold;
    this.circuitBreakerTimeout = circuitBreakerTimeout;
    
    // Estatísticas de runtime
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      lastHealthCheck: null,
      isHealthy: true,
      circuitBreakerState: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
      consecutiveFailures: 0,
      lastFailureTime: null
    };
  }

  /**
   * Calcular taxa de sucesso
   * @returns {number}
   */
  getSuccessRate() {
    if (this.stats.totalRequests === 0) return 1.0;
    return this.stats.successfulRequests / this.stats.totalRequests;
  }

  /**
   * Verificar se o provedor está disponível
   * @returns {boolean}
   */
  isAvailable() {
    return this.enabled && 
           this.stats.isHealthy && 
           this.stats.circuitBreakerState !== 'OPEN';
  }

  /**
   * Registrar tentativa de uso
   * @param {boolean} success - Se foi bem-sucedida
   * @param {number} responseTime - Tempo de resposta em ms
   */
  recordAttempt(success, responseTime) {
    this.stats.totalRequests++;
    
    if (success) {
      this.stats.successfulRequests++;
      this.stats.consecutiveFailures = 0;
      
      // Fechar circuit breaker se estava meio aberto
      if (this.stats.circuitBreakerState === 'HALF_OPEN') {
        this.stats.circuitBreakerState = 'CLOSED';
      }
    } else {
      this.stats.failedRequests++;
      this.stats.consecutiveFailures++;
      this.stats.lastFailureTime = Date.now();
      
      // Abrir circuit breaker se muitas falhas consecutivas
      if (this.stats.consecutiveFailures >= this.circuitBreakerThreshold) {
        this.stats.circuitBreakerState = 'OPEN';
      }
    }
    
    // Atualizar tempo médio de resposta
    const totalTime = this.stats.averageResponseTime * (this.stats.totalRequests - 1) + responseTime;
    this.stats.averageResponseTime = totalTime / this.stats.totalRequests;
  }

  /**
   * Verificar se circuit breaker deve ser testado
   * @returns {boolean}
   */
  shouldTestCircuitBreaker() {
    if (this.stats.circuitBreakerState !== 'OPEN') return false;
    
    const timeSinceLastFailure = Date.now() - this.stats.lastFailureTime;
    return timeSinceLastFailure >= this.circuitBreakerTimeout;
  }

  /**
   * Tentar reabrir circuit breaker
   */
  attemptCircuitBreakerRecovery() {
    if (this.shouldTestCircuitBreaker()) {
      this.stats.circuitBreakerState = 'HALF_OPEN';
    }
  }
}

/**
 * Serviço de fallback para LLMs
 */
export class LLMFallbackService {
  constructor(options = {}) {
    this.options = {
      strategy: FALLBACK_STRATEGIES.SMART_ROUTING,
      maxTotalRetries: 10,
      globalTimeout: 120000, // 2 minutos
      enableHealthChecks: true,
      enableCircuitBreaker: true,
      enableMetrics: true,
      ...options
    };
    
    this.providers = new Map();
    this.llmService = new LLMService();
    this.currentProviderIndex = 0;
    this.healthCheckIntervals = new Map();
    
    // Métricas globais
    this.globalStats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalFallbacks: 0,
      averageResponseTime: 0,
      providerUsage: new Map()
    };
    
    this.initializeDefaultProviders();
  }

  /**
   * Inicializar provedores padrão
   */
  initializeDefaultProviders() {
    // Configurações padrão para diferentes provedores
    const defaultConfigs = [
      {
        provider: LLM_PROVIDERS.OLLAMA,
        model: 'llama2:latest',
        priority: PROVIDER_PRIORITY.PRIMARY,
        costPerToken: 0.0 // Ollama é gratuito
      },
      {
        provider: LLM_PROVIDERS.OPENAI,
        model: 'gpt-4',
        priority: PROVIDER_PRIORITY.SECONDARY,
        costPerToken: 0.03
      },
      {
        provider: LLM_PROVIDERS.ANTHROPIC,
        model: 'claude-3-sonnet',
        priority: PROVIDER_PRIORITY.TERTIARY,
        costPerToken: 0.015
      }
    ];
    
    defaultConfigs.forEach(config => {
      this.addProvider(new FallbackProviderConfig(config));
    });
  }

  /**
   * Adicionar provedor de fallback
   * @param {FallbackProviderConfig} config - Configuração do provedor
   */
  addProvider(config) {
    const key = `${config.provider}-${config.model}`;
    this.providers.set(key, config);
    
    // Inicializar health check se habilitado
    if (this.options.enableHealthChecks) {
      this.startHealthCheck(config);
    }
    
    // Inicializar estatísticas de uso
    this.globalStats.providerUsage.set(key, {
      requests: 0,
      successes: 0,
      failures: 0
    });
  }

  /**
   * Remover provedor
   * @param {string} provider - Nome do provedor
   * @param {string} model - Nome do modelo
   */
  removeProvider(provider, model) {
    const key = `${provider}-${model}`;
    const config = this.providers.get(key);
    
    if (config) {
      this.stopHealthCheck(config);
      this.providers.delete(key);
      this.globalStats.providerUsage.delete(key);
    }
  }

  /**
   * Iniciar health check para um provedor
   * @param {FallbackProviderConfig} config - Configuração do provedor
   */
  startHealthCheck(config) {
    const key = `${config.provider}-${config.model}`;
    
    const interval = setInterval(async () => {
      try {
        await this.performHealthCheck(config);
      } catch (error) {
        console.warn(`Health check failed for ${key}:`, error.message);
      }
    }, config.healthCheckInterval);
    
    this.healthCheckIntervals.set(key, interval);
  }

  /**
   * Parar health check para um provedor
   * @param {FallbackProviderConfig} config - Configuração do provedor
   */
  stopHealthCheck(config) {
    const key = `${config.provider}-${config.model}`;
    const interval = this.healthCheckIntervals.get(key);
    
    if (interval) {
      clearInterval(interval);
      this.healthCheckIntervals.delete(key);
    }
  }

  /**
   * Realizar health check em um provedor
   * @param {FallbackProviderConfig} config - Configuração do provedor
   */
  async performHealthCheck(config) {
    const startTime = Date.now();
    
    try {
      // Tentar uma requisição simples
      await this.llmService.sendMessage(
        [{ role: 'user', content: 'Hello' }],
        {
          provider: config.provider,
          model: config.model,
          maxTokens: 10,
          timeout: 10000
        }
      );
      
      config.stats.isHealthy = true;
      config.stats.lastHealthCheck = Date.now();
      
      // Tentar reabrir circuit breaker se estava aberto
      config.attemptCircuitBreakerRecovery();
      
    } catch (error) {
      config.stats.isHealthy = false;
      config.stats.lastHealthCheck = Date.now();
      
      // Registrar falha
      const responseTime = Date.now() - startTime;
      config.recordAttempt(false, responseTime);
    }
  }

  /**
   * Obter provedores disponíveis ordenados por estratégia
   * @param {string} strategy - Estratégia de seleção
   * @returns {Array<FallbackProviderConfig>}
   */
  getAvailableProviders(strategy = this.options.strategy) {
    const available = Array.from(this.providers.values())
      .filter(config => config.isAvailable());
    
    switch (strategy) {
      case FALLBACK_STRATEGIES.PRIORITY_BASED:
        return available.sort((a, b) => a.priority - b.priority);
      
      case FALLBACK_STRATEGIES.PERFORMANCE_BASED:
        return available.sort((a, b) => {
          const scoreA = a.getSuccessRate() / (a.stats.averageResponseTime || 1);
          const scoreB = b.getSuccessRate() / (b.stats.averageResponseTime || 1);
          return scoreB - scoreA;
        });
      
      case FALLBACK_STRATEGIES.COST_OPTIMIZED:
        return available.sort((a, b) => a.costPerToken - b.costPerToken);
      
      case FALLBACK_STRATEGIES.ROUND_ROBIN:
        // Rotacionar através dos provedores disponíveis
        if (available.length > 0) {
          this.currentProviderIndex = (this.currentProviderIndex + 1) % available.length;
          return [available[this.currentProviderIndex], ...available.slice(0, this.currentProviderIndex), ...available.slice(this.currentProviderIndex + 1)];
        }
        return available;
      
      case FALLBACK_STRATEGIES.SMART_ROUTING:
      default:
        // Combinar múltiplos fatores
        return available.sort((a, b) => {
          const scoreA = this.calculateSmartScore(a);
          const scoreB = this.calculateSmartScore(b);
          return scoreB - scoreA;
        });
    }
  }

  /**
   * Calcular pontuação inteligente para um provedor
   * @param {FallbackProviderConfig} config - Configuração do provedor
   * @returns {number}
   */
  calculateSmartScore(config) {
    const successRate = config.getSuccessRate();
    const responseTime = config.stats.averageResponseTime || 1000;
    const priority = 5 - config.priority; // Inverter prioridade (menor número = maior prioridade)
    const cost = 1 / (config.costPerToken || 0.001);
    
    // Pesos para diferentes fatores
    const weights = {
      successRate: 0.4,
      responseTime: 0.3,
      priority: 0.2,
      cost: 0.1
    };
    
    return (
      successRate * weights.successRate +
      (1000 / responseTime) * weights.responseTime +
      priority * weights.priority +
      (cost / 1000) * weights.cost
    );
  }

  /**
   * Determinar tipo de erro para fallback
   * @param {Error} error - Erro ocorrido
   * @returns {string}
   */
  categorizeError(error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return FALLBACK_TRIGGERS.RATE_LIMIT;
    }
    
    if (message.includes('timeout') || message.includes('timed out')) {
      return FALLBACK_TRIGGERS.TIMEOUT;
    }
    
    if (message.includes('unauthorized') || message.includes('authentication')) {
      return FALLBACK_TRIGGERS.AUTHENTICATION;
    }
    
    if (message.includes('service unavailable') || message.includes('503')) {
      return FALLBACK_TRIGGERS.SERVICE_UNAVAILABLE;
    }
    
    if (message.includes('quota') || message.includes('limit exceeded')) {
      return FALLBACK_TRIGGERS.QUOTA_EXCEEDED;
    }
    
    if (message.includes('model') && message.includes('not found')) {
      return FALLBACK_TRIGGERS.MODEL_UNAVAILABLE;
    }
    
    if (message.includes('network') || message.includes('connection')) {
      return FALLBACK_TRIGGERS.NETWORK_ERROR;
    }
    
    return FALLBACK_TRIGGERS.UNKNOWN_ERROR;
  }

  /**
   * Verificar se erro deve acionar fallback
   * @param {string} errorType - Tipo do erro
   * @returns {boolean}
   */
  shouldTriggerFallback(errorType) {
    const retriableErrors = [
      FALLBACK_TRIGGERS.RATE_LIMIT,
      FALLBACK_TRIGGERS.TIMEOUT,
      FALLBACK_TRIGGERS.SERVICE_UNAVAILABLE,
      FALLBACK_TRIGGERS.QUOTA_EXCEEDED,
      FALLBACK_TRIGGERS.MODEL_UNAVAILABLE,
      FALLBACK_TRIGGERS.NETWORK_ERROR
    ];
    
    return retriableErrors.includes(errorType);
  }

  /**
   * Enviar mensagem com fallback automático
   * @param {Array} messages - Mensagens
   * @param {Object} options - Opções
   * @returns {Promise<Object>}
   */
  async sendMessageWithFallback(messages, options = {}) {
    const startTime = Date.now();
    this.globalStats.totalRequests++;
    
    const providers = this.getAvailableProviders(options.strategy);
    
    if (providers.length === 0) {
      throw new Error('Nenhum provedor LLM disponível');
    }
    
    let lastError = null;
    let totalRetries = 0;
    
    for (const provider of providers) {
      if (totalRetries >= this.options.maxTotalRetries) {
        break;
      }
      
      const providerKey = `${provider.provider}-${provider.model}`;
      let retries = 0;
      
      while (retries <= provider.maxRetries && totalRetries < this.options.maxTotalRetries) {
        try {
          const requestStartTime = Date.now();
          
          const result = await this.llmService.sendMessage(messages, {
            ...options,
            provider: provider.provider,
            model: provider.model,
            timeout: provider.timeout
          });
          
          const responseTime = Date.now() - requestStartTime;
          
          // Registrar sucesso
          provider.recordAttempt(true, responseTime);
          this.updateGlobalStats(providerKey, true, Date.now() - startTime);
          
          return {
            ...result,
            metadata: {
              ...result.metadata,
              provider: provider.provider,
              model: provider.model,
              fallbacksUsed: totalRetries,
              totalResponseTime: Date.now() - startTime
            }
          };
          
        } catch (error) {
          lastError = error;
          const responseTime = Date.now() - requestStartTime;
          const errorType = this.categorizeError(error);
          
          // Registrar falha
          provider.recordAttempt(false, responseTime);
          this.updateGlobalStats(providerKey, false, responseTime);
          
          // Verificar se deve tentar fallback
          if (!this.shouldTriggerFallback(errorType)) {
            throw error; // Erro não recuperável
          }
          
          retries++;
          totalRetries++;
          this.globalStats.totalFallbacks++;
          
          // Aguardar antes de tentar novamente
          if (retries <= provider.maxRetries) {
            await this.delay(provider.retryDelay * retries);
          }
        }
      }
    }
    
    // Todos os provedores falharam
    this.globalStats.failedRequests++;
    throw new Error(`Todos os provedores LLM falharam. Último erro: ${lastError?.message}`);
  }

  /**
   * Atualizar estatísticas globais
   * @param {string} providerKey - Chave do provedor
   * @param {boolean} success - Se foi bem-sucedida
   * @param {number} responseTime - Tempo de resposta
   */
  updateGlobalStats(providerKey, success, responseTime) {
    if (success) {
      this.globalStats.successfulRequests++;
    }
    
    // Atualizar estatísticas do provedor
    const providerStats = this.globalStats.providerUsage.get(providerKey);
    if (providerStats) {
      providerStats.requests++;
      if (success) {
        providerStats.successes++;
      } else {
        providerStats.failures++;
      }
    }
    
    // Atualizar tempo médio de resposta global
    const totalTime = this.globalStats.averageResponseTime * (this.globalStats.totalRequests - 1) + responseTime;
    this.globalStats.averageResponseTime = totalTime / this.globalStats.totalRequests;
  }

  /**
   * Aguardar por um período
   * @param {number} ms - Milissegundos
   * @returns {Promise}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Obter estatísticas do serviço
   * @returns {Object}
   */
  getStats() {
    const providerStats = {};
    
    for (const [key, config] of this.providers.entries()) {
      providerStats[key] = {
        ...config.stats,
        priority: config.priority,
        enabled: config.enabled,
        successRate: config.getSuccessRate(),
        isAvailable: config.isAvailable()
      };
    }
    
    return {
      global: this.globalStats,
      providers: providerStats,
      configuration: {
        strategy: this.options.strategy,
        totalProviders: this.providers.size,
        availableProviders: this.getAvailableProviders().length
      }
    };
  }

  /**
   * Resetar estatísticas
   */
  resetStats() {
    this.globalStats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalFallbacks: 0,
      averageResponseTime: 0,
      providerUsage: new Map()
    };
    
    for (const config of this.providers.values()) {
      config.stats = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        lastHealthCheck: null,
        isHealthy: true,
        circuitBreakerState: 'CLOSED',
        consecutiveFailures: 0,
        lastFailureTime: null
      };
    }
  }

  /**
   * Destruir o serviço e limpar recursos
   */
  destroy() {
    // Parar todos os health checks
    for (const interval of this.healthCheckIntervals.values()) {
      clearInterval(interval);
    }
    
    this.healthCheckIntervals.clear();
    this.providers.clear();
  }
}

// Instância singleton do serviço de fallback
export const llmFallbackService = new LLMFallbackService();

export default llmFallbackService;
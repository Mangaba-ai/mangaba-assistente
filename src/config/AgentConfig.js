/**
 * Sistema de configuração de agentes
 * Permite seleção de LLM e capacidades de arquivo
 */

import { LLM_PROVIDERS, LLM_MODELS } from '../services/LLMService.js';
import { FILE_TYPES } from '../services/FileProcessingService.js';

// Especializações disponíveis para agentes
export const AGENT_SPECIALIZATIONS = {
  GENERAL: 'general',
  CODE_ANALYSIS: 'code_analysis',
  DOCUMENT_PROCESSING: 'document_processing',
  DATA_ANALYSIS: 'data_analysis',
  IMAGE_PROCESSING: 'image_processing',
  TRANSLATION: 'translation',
  SUMMARIZATION: 'summarization',
  QUESTION_ANSWERING: 'question_answering',
  CREATIVE_WRITING: 'creative_writing',
  TECHNICAL_WRITING: 'technical_writing',
  RESEARCH: 'research',
  PLANNING: 'planning'
};

// Níveis de performance
export const PERFORMANCE_LEVELS = {
  BASIC: 'basic',
  STANDARD: 'standard',
  ADVANCED: 'advanced',
  EXPERT: 'expert'
};

// Templates de configuração pré-definidos
export const AGENT_TEMPLATES = {
  [AGENT_SPECIALIZATIONS.GENERAL]: {
    name: 'Agente Geral',
    description: 'Agente versátil para tarefas gerais',
    recommendedLLM: {
      provider: LLM_PROVIDERS.OLLAMA,
      model: 'llama2:latest'
    },
    supportedFileTypes: [FILE_TYPES.TEXT, FILE_TYPES.CODE, FILE_TYPES.DATA],
    specializations: [AGENT_SPECIALIZATIONS.GENERAL],
    maxConcurrentTasks: 3,
    performanceLevel: PERFORMANCE_LEVELS.STANDARD
  },

  [AGENT_SPECIALIZATIONS.CODE_ANALYSIS]: {
    name: 'Analista de Código',
    description: 'Especializado em análise e revisão de código',
    recommendedLLM: {
      provider: LLM_PROVIDERS.OLLAMA,
      model: 'codellama'
    },
    supportedFileTypes: [FILE_TYPES.CODE, FILE_TYPES.TEXT],
    specializations: [AGENT_SPECIALIZATIONS.CODE_ANALYSIS, AGENT_SPECIALIZATIONS.TECHNICAL_WRITING],
    maxConcurrentTasks: 2,
    performanceLevel: PERFORMANCE_LEVELS.EXPERT
  },

  [AGENT_SPECIALIZATIONS.DOCUMENT_PROCESSING]: {
    name: 'Processador de Documentos',
    description: 'Especializado em processamento de documentos',
    recommendedLLM: {
      provider: LLM_PROVIDERS.OLLAMA,
      model: 'llama2:13b'
    },
    supportedFileTypes: [FILE_TYPES.DOCUMENT, FILE_TYPES.TEXT, FILE_TYPES.DATA],
    specializations: [AGENT_SPECIALIZATIONS.DOCUMENT_PROCESSING, AGENT_SPECIALIZATIONS.SUMMARIZATION],
    maxConcurrentTasks: 4,
    performanceLevel: PERFORMANCE_LEVELS.ADVANCED
  },

  [AGENT_SPECIALIZATIONS.DATA_ANALYSIS]: {
    name: 'Analista de Dados',
    description: 'Especializado em análise de dados e estatísticas',
    recommendedLLM: {
      provider: LLM_PROVIDERS.OLLAMA,
      model: 'llama2:13b'
    },
    supportedFileTypes: [FILE_TYPES.DATA, FILE_TYPES.TEXT],
    specializations: [AGENT_SPECIALIZATIONS.DATA_ANALYSIS, AGENT_SPECIALIZATIONS.RESEARCH],
    maxConcurrentTasks: 2,
    performanceLevel: PERFORMANCE_LEVELS.EXPERT
  },

  [AGENT_SPECIALIZATIONS.IMAGE_PROCESSING]: {
    name: 'Processador de Imagens',
    description: 'Especializado em análise e processamento de imagens',
    recommendedLLM: {
      provider: LLM_PROVIDERS.OLLAMA,
      model: 'llama2:latest'
    },
    supportedFileTypes: [FILE_TYPES.IMAGE, FILE_TYPES.TEXT],
    specializations: [AGENT_SPECIALIZATIONS.IMAGE_PROCESSING],
    maxConcurrentTasks: 1,
    performanceLevel: PERFORMANCE_LEVELS.ADVANCED
  },

  // Templates para agentes locais usando Ollama
  'LOCAL_GENERAL': {
    name: 'Agente Local Geral',
    description: 'Agente versátil usando modelo local Llama2',
    recommendedLLM: {
      provider: LLM_PROVIDERS.OLLAMA,
      model: 'llama2:latest'
    },
    supportedFileTypes: [FILE_TYPES.TEXT, FILE_TYPES.CODE, FILE_TYPES.DATA],
    specializations: [AGENT_SPECIALIZATIONS.GENERAL],
    maxConcurrentTasks: 2,
    performanceLevel: PERFORMANCE_LEVELS.STANDARD
  },

  'LOCAL_CODE_ASSISTANT': {
    name: 'Assistente de Código Local',
    description: 'Especializado em programação usando CodeLlama local',
    recommendedLLM: {
      provider: LLM_PROVIDERS.OLLAMA,
      model: 'codellama'
    },
    supportedFileTypes: [FILE_TYPES.CODE, FILE_TYPES.TEXT],
    specializations: [AGENT_SPECIALIZATIONS.CODE_ANALYSIS, AGENT_SPECIALIZATIONS.TECHNICAL_WRITING],
    maxConcurrentTasks: 1,
    performanceLevel: PERFORMANCE_LEVELS.ADVANCED
  },

  'LOCAL_FAST_ASSISTANT': {
    name: 'Assistente Rápido Local',
    description: 'Assistente rápido usando Mistral local para respostas ágeis',
    recommendedLLM: {
      provider: LLM_PROVIDERS.OLLAMA,
      model: 'mistral'
    },
    supportedFileTypes: [FILE_TYPES.TEXT, FILE_TYPES.CODE],
    specializations: [AGENT_SPECIALIZATIONS.GENERAL, AGENT_SPECIALIZATIONS.QUESTION_ANSWERING],
    maxConcurrentTasks: 3,
    performanceLevel: PERFORMANCE_LEVELS.STANDARD
  },

  'LOCAL_DOCUMENT_PROCESSOR': {
    name: 'Processador de Documentos Local',
    description: 'Processamento de documentos usando modelo local Llama2 13B',
    recommendedLLM: {
      provider: LLM_PROVIDERS.OLLAMA,
      model: 'llama2:13b'
    },
    supportedFileTypes: [FILE_TYPES.DOCUMENT, FILE_TYPES.TEXT, FILE_TYPES.DATA],
    specializations: [AGENT_SPECIALIZATIONS.DOCUMENT_PROCESSING, AGENT_SPECIALIZATIONS.SUMMARIZATION],
    maxConcurrentTasks: 1,
    performanceLevel: PERFORMANCE_LEVELS.ADVANCED
  },

  'LOCAL_CODE_EXPERT': {
    name: 'Especialista em Código Local',
    description: 'Análise avançada de código usando CodeLlama 13B local',
    recommendedLLM: {
      provider: LLM_PROVIDERS.OLLAMA,
      model: 'codellama:13b'
    },
    supportedFileTypes: [FILE_TYPES.CODE, FILE_TYPES.TEXT],
    specializations: [AGENT_SPECIALIZATIONS.CODE_ANALYSIS, AGENT_SPECIALIZATIONS.TECHNICAL_WRITING, AGENT_SPECIALIZATIONS.RESEARCH],
    maxConcurrentTasks: 1,
    performanceLevel: PERFORMANCE_LEVELS.EXPERT
  }
};

/**
 * Classe para configuração de agente
 */
export class AgentConfiguration {
  constructor({
    id = null,
    name,
    description = '',
    llmConfig,
    supportedFileTypes = [],
    specializations = [],
    maxConcurrentTasks = 1,
    performanceLevel = PERFORMANCE_LEVELS.STANDARD,
    contextConfig = {},
    customPrompts = {},
    fallbackConfig = {},
    metadata = {}
  }) {
    this.id = id || this.generateId();
    this.name = name;
    this.description = description;
    this.llmConfig = llmConfig;
    this.supportedFileTypes = supportedFileTypes;
    this.specializations = specializations;
    this.maxConcurrentTasks = maxConcurrentTasks;
    this.performanceLevel = performanceLevel;
    this.contextConfig = contextConfig;
    this.customPrompts = customPrompts;
    this.fallbackConfig = fallbackConfig;
    this.metadata = metadata;
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
  }

  generateId() {
    return `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validar configuração
   * @returns {Object} - Resultado da validação
   */
  validate() {
    const errors = [];
    const warnings = [];

    // Validar nome
    if (!this.name || this.name.trim().length === 0) {
      errors.push('Nome do agente é obrigatório');
    }

    // Validar configuração LLM
    if (!this.llmConfig) {
      errors.push('Configuração LLM é obrigatória');
    } else {
      if (!this.llmConfig.provider) {
        errors.push('Provedor LLM é obrigatório');
      } else if (!Object.values(LLM_PROVIDERS).includes(this.llmConfig.provider)) {
        errors.push(`Provedor LLM inválido: ${this.llmConfig.provider}`);
      }

      if (!this.llmConfig.model) {
        errors.push('Modelo LLM é obrigatório');
      } else {
        const availableModels = LLM_MODELS[this.llmConfig.provider];
        if (availableModels && !availableModels[this.llmConfig.model]) {
          errors.push(`Modelo LLM inválido para provedor ${this.llmConfig.provider}: ${this.llmConfig.model}`);
        }
      }

      if (!this.llmConfig.apiKey && this.llmConfig.provider !== LLM_PROVIDERS.OLLAMA) {
        warnings.push('API Key não configurada - agente pode não funcionar');
      }
    }

    // Validar tipos de arquivo
    for (const fileType of this.supportedFileTypes) {
      if (!Object.values(FILE_TYPES).includes(fileType)) {
        warnings.push(`Tipo de arquivo desconhecido: ${fileType}`);
      }
    }

    // Validar especializações
    for (const specialization of this.specializations) {
      if (!Object.values(AGENT_SPECIALIZATIONS).includes(specialization)) {
        warnings.push(`Especialização desconhecida: ${specialization}`);
      }
    }

    // Validar tarefas concorrentes
    if (this.maxConcurrentTasks < 1) {
      errors.push('Número máximo de tarefas concorrentes deve ser pelo menos 1');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Obter capacidades do agente
   * @returns {Object}
   */
  getCapabilities() {
    const modelInfo = LLM_MODELS[this.llmConfig?.provider]?.[this.llmConfig?.model] || {};
    
    return {
      llmProvider: this.llmConfig?.provider,
      llmModel: this.llmConfig?.model,
      supportedFileTypes: this.supportedFileTypes,
      specializations: this.specializations,
      maxConcurrentTasks: this.maxConcurrentTasks,
      averageResponseTime: this.estimateResponseTime(),
      reliability: this.calculateReliability(),
      contextWindow: modelInfo.contextWindow || 4096,
      supportsFiles: modelInfo.supportsFiles || false
    };
  }

  /**
   * Estimar tempo de resposta
   * @returns {number}
   */
  estimateResponseTime() {
    const baseTime = {
      [PERFORMANCE_LEVELS.BASIC]: 10000,
      [PERFORMANCE_LEVELS.STANDARD]: 7000,
      [PERFORMANCE_LEVELS.ADVANCED]: 5000,
      [PERFORMANCE_LEVELS.EXPERT]: 3000
    };

    return baseTime[this.performanceLevel] || 7000;
  }

  /**
   * Calcular confiabilidade
   * @returns {number}
   */
  calculateReliability() {
    let reliability = 0.8; // Base

    // Ajustar baseado no nível de performance
    const performanceBonus = {
      [PERFORMANCE_LEVELS.BASIC]: 0.0,
      [PERFORMANCE_LEVELS.STANDARD]: 0.05,
      [PERFORMANCE_LEVELS.ADVANCED]: 0.1,
      [PERFORMANCE_LEVELS.EXPERT]: 0.15
    };

    reliability += performanceBonus[this.performanceLevel] || 0;

    // Ajustar baseado na configuração de fallback
    if (this.fallbackConfig.enabled) {
      reliability += 0.05;
    }

    return Math.min(0.99, reliability);
  }

  /**
   * Clonar configuração
   * @returns {AgentConfiguration}
   */
  clone() {
    return new AgentConfiguration({
      name: `${this.name} (Cópia)`,
      description: this.description,
      llmConfig: { ...this.llmConfig },
      supportedFileTypes: [...this.supportedFileTypes],
      specializations: [...this.specializations],
      maxConcurrentTasks: this.maxConcurrentTasks,
      performanceLevel: this.performanceLevel,
      contextConfig: { ...this.contextConfig },
      customPrompts: { ...this.customPrompts },
      fallbackConfig: { ...this.fallbackConfig },
      metadata: { ...this.metadata }
    });
  }

  /**
   * Atualizar configuração
   * @param {Object} updates - Atualizações
   */
  update(updates) {
    Object.assign(this, updates);
    this.updatedAt = Date.now();
  }

  /**
   * Exportar para JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      llmConfig: this.llmConfig,
      supportedFileTypes: this.supportedFileTypes,
      specializations: this.specializations,
      maxConcurrentTasks: this.maxConcurrentTasks,
      performanceLevel: this.performanceLevel,
      contextConfig: this.contextConfig,
      customPrompts: this.customPrompts,
      fallbackConfig: this.fallbackConfig,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Criar a partir de JSON
   * @param {Object} data - Dados JSON
   * @returns {AgentConfiguration}
   */
  static fromJSON(data) {
    return new AgentConfiguration(data);
  }

  /**
   * Criar a partir de template
   * @param {string} templateName - Nome do template
   * @param {Object} overrides - Sobrescrever configurações
   * @returns {AgentConfiguration}
   */
  static fromTemplate(templateName, overrides = {}) {
    const template = AGENT_TEMPLATES[templateName];
    
    if (!template) {
      throw new Error(`Template não encontrado: ${templateName}`);
    }

    return new AgentConfiguration({
      ...template,
      llmConfig: {
        provider: template.recommendedLLM.provider,
        model: template.recommendedLLM.model,
        ...overrides.llmConfig
      },
      ...overrides
    });
  }
}

/**
 * Gerenciador de configurações de agente
 */
export class AgentConfigManager {
  constructor() {
    this.configurations = new Map();
    this.templates = new Map(Object.entries(AGENT_TEMPLATES));
  }

  /**
   * Criar nova configuração
   * @param {Object} configData - Dados da configuração
   * @returns {AgentConfiguration}
   */
  createConfiguration(configData) {
    const config = new AgentConfiguration(configData);
    const validation = config.validate();
    
    if (!validation.isValid) {
      throw new Error(`Configuração inválida: ${validation.errors.join(', ')}`);
    }

    this.configurations.set(config.id, config);
    return config;
  }

  /**
   * Obter configuração por ID
   * @param {string} configId - ID da configuração
   * @returns {AgentConfiguration|null}
   */
  getConfiguration(configId) {
    return this.configurations.get(configId) || null;
  }

  /**
   * Listar todas as configurações
   * @returns {Array<AgentConfiguration>}
   */
  listConfigurations() {
    return Array.from(this.configurations.values());
  }

  /**
   * Atualizar configuração
   * @param {string} configId - ID da configuração
   * @param {Object} updates - Atualizações
   * @returns {AgentConfiguration}
   */
  updateConfiguration(configId, updates) {
    const config = this.configurations.get(configId);
    
    if (!config) {
      throw new Error(`Configuração não encontrada: ${configId}`);
    }

    config.update(updates);
    const validation = config.validate();
    
    if (!validation.isValid) {
      throw new Error(`Configuração inválida após atualização: ${validation.errors.join(', ')}`);
    }

    return config;
  }

  /**
   * Deletar configuração
   * @param {string} configId - ID da configuração
   * @returns {boolean}
   */
  deleteConfiguration(configId) {
    return this.configurations.delete(configId);
  }

  /**
   * Buscar configurações por critérios
   * @param {Object} criteria - Critérios de busca
   * @returns {Array<AgentConfiguration>}
   */
  searchConfigurations(criteria = {}) {
    const results = [];
    
    for (const config of this.configurations.values()) {
      let matches = true;
      
      if (criteria.specialization && !config.specializations.includes(criteria.specialization)) {
        matches = false;
      }
      
      if (criteria.fileType && !config.supportedFileTypes.includes(criteria.fileType)) {
        matches = false;
      }
      
      if (criteria.llmProvider && config.llmConfig?.provider !== criteria.llmProvider) {
        matches = false;
      }
      
      if (criteria.performanceLevel && config.performanceLevel !== criteria.performanceLevel) {
        matches = false;
      }
      
      if (matches) {
        results.push(config);
      }
    }
    
    return results;
  }

  /**
   * Obter templates disponíveis
   * @returns {Array<Object>}
   */
  getAvailableTemplates() {
    return Array.from(this.templates.entries()).map(([key, template]) => ({
      id: key,
      ...template
    }));
  }

  /**
   * Criar configuração a partir de template
   * @param {string} templateName - Nome do template
   * @param {Object} overrides - Sobrescrever configurações
   * @returns {AgentConfiguration}
   */
  createFromTemplate(templateName, overrides = {}) {
    const config = AgentConfiguration.fromTemplate(templateName, overrides);
    this.configurations.set(config.id, config);
    return config;
  }

  /**
   * Validar configuração LLM
   * @param {Object} llmConfig - Configuração LLM
   * @returns {Object}
   */
  validateLLMConfig(llmConfig) {
    const errors = [];
    const warnings = [];

    if (!llmConfig.provider) {
      errors.push('Provedor é obrigatório');
    } else if (!Object.values(LLM_PROVIDERS).includes(llmConfig.provider)) {
      errors.push(`Provedor inválido: ${llmConfig.provider}`);
    }

    if (!llmConfig.model) {
      errors.push('Modelo é obrigatório');
    } else {
      const availableModels = LLM_MODELS[llmConfig.provider];
      if (availableModels && !availableModels[llmConfig.model]) {
        errors.push(`Modelo inválido: ${llmConfig.model}`);
      }
    }

    if (!llmConfig.apiKey && llmConfig.provider !== LLM_PROVIDERS.OLLAMA) {
      warnings.push('API Key não configurada');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Obter modelos disponíveis para provedor
   * @param {string} provider - Provedor LLM
   * @returns {Object}
   */
  getModelsForProvider(provider) {
    return LLM_MODELS[provider] || {};
  }

  /**
   * Exportar todas as configurações
   * @returns {Object}
   */
  exportConfigurations() {
    const configs = Array.from(this.configurations.values()).map(config => config.toJSON());
    
    return {
      configurations: configs,
      exportedAt: Date.now(),
      version: '1.0'
    };
  }

  /**
   * Importar configurações
   * @param {Object} data - Dados de importação
   * @returns {Array<AgentConfiguration>}
   */
  importConfigurations(data) {
    const imported = [];
    
    if (data.configurations && Array.isArray(data.configurations)) {
      for (const configData of data.configurations) {
        try {
          const config = AgentConfiguration.fromJSON(configData);
          const validation = config.validate();
          
          if (validation.isValid) {
            this.configurations.set(config.id, config);
            imported.push(config);
          } else {
            console.warn(`Configuração inválida ignorada: ${config.name}`, validation.errors);
          }
        } catch (error) {
          console.error(`Erro ao importar configuração: ${error.message}`);
        }
      }
    }
    
    return imported;
  }
}

// Instância singleton do gerenciador
export const agentConfigManager = new AgentConfigManager();

export default agentConfigManager;
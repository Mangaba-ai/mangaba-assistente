/**
 * Interface abstrata para LLMs agnósticos
 * Permite diferentes provedores (OpenAI, Anthropic, Google, etc.)
 */

// Tipos de LLM suportados
export const LLM_PROVIDERS = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  GOOGLE: 'google',
  COHERE: 'cohere',
  HUGGINGFACE: 'huggingface',
  LOCAL: 'local',
  OLLAMA: 'ollama'
};

// Modelos disponíveis por provedor
export const LLM_MODELS = {
  [LLM_PROVIDERS.OPENAI]: {
    'gpt-4': { name: 'GPT-4', contextWindow: 8192, supportsFiles: true },
    'gpt-4-turbo': { name: 'GPT-4 Turbo', contextWindow: 128000, supportsFiles: true },
    'gpt-3.5-turbo': { name: 'GPT-3.5 Turbo', contextWindow: 4096, supportsFiles: false }
  },
  [LLM_PROVIDERS.ANTHROPIC]: {
    'claude-3-opus': { name: 'Claude 3 Opus', contextWindow: 200000, supportsFiles: true },
    'claude-3-sonnet': { name: 'Claude 3 Sonnet', contextWindow: 200000, supportsFiles: true },
    'claude-3-haiku': { name: 'Claude 3 Haiku', contextWindow: 200000, supportsFiles: true }
  },
  [LLM_PROVIDERS.GOOGLE]: {
    'gemini-pro': { name: 'Gemini Pro', contextWindow: 32768, supportsFiles: true },
    'gemini-pro-vision': { name: 'Gemini Pro Vision', contextWindow: 32768, supportsFiles: true }
  },
  [LLM_PROVIDERS.OLLAMA]: {
    'llama2:latest': { name: 'Llama 2', contextWindow: 4096, supportsFiles: true },
    'codellama:latest': { name: 'Code Llama', contextWindow: 16384, supportsFiles: true },
    'mistral:latest': { name: 'Mistral 7B', contextWindow: 8192, supportsFiles: true },
    'gpt-oss:20b': { name: 'GPT-OSS 20B', contextWindow: 8192, supportsFiles: true },
    'llama2:13b': { name: 'Llama 2 13B', contextWindow: 4096, supportsFiles: true },
    'codellama:13b': { name: 'Code Llama 13B', contextWindow: 16384, supportsFiles: true }
  }
};

/**
 * Classe abstrata base para todos os provedores de LLM
 */
export class BaseLLMProvider {
  constructor(config) {
    this.provider = config.provider;
    this.model = config.model;
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
    this.config = config;
  }

  /**
   * Método abstrato para enviar mensagem
   * @param {string} message - Mensagem a ser enviada
   * @param {Object} options - Opções adicionais
   * @returns {Promise<string>} - Resposta do LLM
   */
  async sendMessage(message, options = {}) {
    throw new Error('sendMessage deve ser implementado pela classe filha');
  }

  /**
   * Método abstrato para processar arquivos
   * @param {File|string} file - Arquivo ou conteúdo
   * @param {string} prompt - Prompt para processamento
   * @returns {Promise<string>} - Resposta processada
   */
  async processFile(file, prompt) {
    throw new Error('processFile deve ser implementado pela classe filha');
  }

  /**
   * Método abstrato para streaming de resposta
   * @param {string} message - Mensagem
   * @param {Function} onChunk - Callback para cada chunk
   * @returns {Promise<void>}
   */
  async streamMessage(message, onChunk) {
    throw new Error('streamMessage deve ser implementado pela classe filha');
  }

  /**
   * Validar configuração do provedor
   * @returns {boolean}
   */
  validateConfig() {
    return !!(this.provider && this.model && this.apiKey);
  }

  /**
   * Obter informações do modelo
   * @returns {Object}
   */
  getModelInfo() {
    return LLM_MODELS[this.provider]?.[this.model] || {};
  }

  /**
   * Verificar se suporta arquivos
   * @returns {boolean}
   */
  supportsFiles() {
    return this.getModelInfo().supportsFiles || false;
  }

  /**
   * Obter janela de contexto
   * @returns {number}
   */
  getContextWindow() {
    return this.getModelInfo().contextWindow || 4096;
  }
}

/**
 * Implementação para OpenAI
 */
export class OpenAIProvider extends BaseLLMProvider {
  constructor(config) {
    super({ ...config, provider: LLM_PROVIDERS.OPENAI });
    this.baseUrl = config.baseUrl || 'https://api.openai.com/v1';
  }

  async sendMessage(message, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: message }],
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 1000,
          ...options
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Erro OpenAI:', error);
      throw error;
    }
  }

  async processFile(file, prompt) {
    if (!this.supportsFiles()) {
      throw new Error('Este modelo não suporta processamento de arquivos');
    }

    // Implementar processamento de arquivo específico do OpenAI
    const fileContent = typeof file === 'string' ? file : await this.extractFileContent(file);
    const fullPrompt = `${prompt}\n\nConteúdo do arquivo:\n${fileContent}`;
    
    return await this.sendMessage(fullPrompt);
  }

  async streamMessage(message, onChunk) {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: message }],
          stream: true
        })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) onChunk(content);
            } catch (e) {
              // Ignorar erros de parsing
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro streaming OpenAI:', error);
      throw error;
    }
  }

  async extractFileContent(file) {
    // Implementar extração de conteúdo baseada no tipo de arquivo
    if (file.type?.includes('text')) {
      return await file.text();
    }
    // Adicionar suporte para outros tipos de arquivo
    return 'Conteúdo do arquivo não pôde ser extraído';
  }
}

/**
 * Implementação para Anthropic
 */
export class AnthropicProvider extends BaseLLMProvider {
  constructor(config) {
    super({ ...config, provider: LLM_PROVIDERS.ANTHROPIC });
    this.baseUrl = config.baseUrl || 'https://api.anthropic.com/v1';
  }

  async sendMessage(message, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: message }],
          max_tokens: options.maxTokens || 1000,
          ...options
        })
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status}`);
      }

      const data = await response.json();
      return data.content[0]?.text || '';
    } catch (error) {
      console.error('Erro Anthropic:', error);
      throw error;
    }
  }

  async processFile(file, prompt) {
    // Implementação similar ao OpenAI
    const fileContent = typeof file === 'string' ? file : await this.extractFileContent(file);
    const fullPrompt = `${prompt}\n\nConteúdo do arquivo:\n${fileContent}`;
    
    return await this.sendMessage(fullPrompt);
  }

  async streamMessage(message, onChunk) {
    // Implementar streaming para Anthropic
    throw new Error('Streaming não implementado para Anthropic ainda');
  }

  async extractFileContent(file) {
    if (file.type?.includes('text')) {
      return await file.text();
    }
    return 'Conteúdo do arquivo não pôde ser extraído';
  }
}

/**
 * Implementação para Ollama (modelos locais)
 */
export class OllamaProvider extends BaseLLMProvider {
  constructor(config) {
    super({ ...config, provider: LLM_PROVIDERS.OLLAMA });
    this.baseUrl = config.baseUrl || 'http://localhost:11434';
  }

  async sendMessage(message, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          prompt: message,
          stream: false,
          options: {
            temperature: options.temperature || 0.7,
            num_predict: options.maxTokens || 1000,
            ...options
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response || '';
    } catch (error) {
      console.error('Erro Ollama:', error);
      throw error;
    }
  }

  async processFile(file, prompt) {
    const fileContent = typeof file === 'string' ? file : await this.extractFileContent(file);
    const fullPrompt = `${prompt}\n\nConteúdo do arquivo:\n${fileContent}`;
    
    return await this.sendMessage(fullPrompt);
  }

  async streamMessage(message, onChunk) {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          prompt: message,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.response) {
              onChunk(data.response);
            }
            if (data.done) {
              return;
            }
          } catch (e) {
            // Ignorar erros de parsing
          }
        }
      }
    } catch (error) {
      console.error('Erro streaming Ollama:', error);
      throw error;
    }
  }

  async extractFileContent(file) {
    if (file.type?.includes('text')) {
      return await file.text();
    }
    return 'Conteúdo do arquivo não pôde ser extraído';
  }

  validateConfig() {
    // Ollama não precisa de API key, apenas modelo e URL
    return !!(this.provider && this.model);
  }
}

/**
 * Factory para criar provedores de LLM
 */
export class LLMFactory {
  static createProvider(config) {
    switch (config.provider) {
      case LLM_PROVIDERS.OPENAI:
        return new OpenAIProvider(config);
      case LLM_PROVIDERS.ANTHROPIC:
        return new AnthropicProvider(config);
      case LLM_PROVIDERS.OLLAMA:
        return new OllamaProvider(config);
      default:
        throw new Error(`Provedor não suportado: ${config.provider}`);
    }
  }

  static getAvailableProviders() {
    return Object.values(LLM_PROVIDERS);
  }

  static getModelsForProvider(provider) {
    return LLM_MODELS[provider] || {};
  }
}

/**
 * Serviço principal de LLM
 */
export class LLMService {
  constructor() {
    this.providers = new Map();
    this.defaultProvider = null;
  }

  /**
   * Registrar um provedor
   * @param {string} id - ID único do provedor
   * @param {Object} config - Configuração do provedor
   */
  registerProvider(id, config) {
    const provider = LLMFactory.createProvider(config);
    if (!provider.validateConfig()) {
      throw new Error(`Configuração inválida para provedor ${id}`);
    }
    
    this.providers.set(id, provider);
    
    if (!this.defaultProvider) {
      this.defaultProvider = id;
    }
  }

  /**
   * Obter provedor por ID
   * @param {string} id - ID do provedor
   * @returns {BaseLLMProvider}
   */
  getProvider(id) {
    return this.providers.get(id);
  }

  /**
   * Obter provedor padrão
   * @returns {BaseLLMProvider}
   */
  getDefaultProvider() {
    return this.providers.get(this.defaultProvider);
  }

  /**
   * Listar todos os provedores registrados
   * @returns {Array}
   */
  listProviders() {
    return Array.from(this.providers.keys());
  }

  /**
   * Enviar mensagem usando provedor específico ou padrão
   * @param {string} message - Mensagem
   * @param {string} providerId - ID do provedor (opcional)
   * @param {Object} options - Opções
   * @returns {Promise<string>}
   */
  async sendMessage(message, providerId = null, options = {}) {
    const provider = providerId ? this.getProvider(providerId) : this.getDefaultProvider();
    
    if (!provider) {
      throw new Error('Nenhum provedor disponível');
    }

    return await provider.sendMessage(message, options);
  }

  /**
   * Processar arquivo usando provedor específico ou padrão
   * @param {File|string} file - Arquivo
   * @param {string} prompt - Prompt
   * @param {string} providerId - ID do provedor (opcional)
   * @returns {Promise<string>}
   */
  async processFile(file, prompt, providerId = null) {
    const provider = providerId ? this.getProvider(providerId) : this.getDefaultProvider();
    
    if (!provider) {
      throw new Error('Nenhum provedor disponível');
    }

    if (!provider.supportsFiles()) {
      throw new Error('Provedor não suporta processamento de arquivos');
    }

    return await provider.processFile(file, prompt);
  }
}

// Instância singleton
export const llmService = new LLMService();

// Registrar Ollama como provedor padrão
try {
  llmService.registerProvider('ollama-default', {
    provider: LLM_PROVIDERS.OLLAMA,
    model: 'llama2:latest',
    baseUrl: 'http://localhost:11434'
  });
} catch (error) {
  console.warn('Ollama não está disponível:', error.message);
}

export default llmService;
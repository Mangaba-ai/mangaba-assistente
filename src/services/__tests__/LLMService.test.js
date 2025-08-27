import { LLM_PROVIDERS, LLM_MODELS, BaseLLMProvider } from '../LLMService';

// Mock básico para testes

describe('LLMService', () => {
  test('LLM_PROVIDERS contém provedores esperados', () => {
    expect(LLM_PROVIDERS.OPENAI).toBe('openai');
    expect(LLM_PROVIDERS.ANTHROPIC).toBe('anthropic');
    expect(LLM_PROVIDERS.GOOGLE).toBe('google');
    expect(LLM_PROVIDERS.OLLAMA).toBe('ollama');
  });

  test('LLM_MODELS contém modelos para cada provedor', () => {
    expect(LLM_MODELS[LLM_PROVIDERS.OPENAI]).toBeDefined();
    expect(LLM_MODELS[LLM_PROVIDERS.ANTHROPIC]).toBeDefined();
    expect(LLM_MODELS[LLM_PROVIDERS.GOOGLE]).toBeDefined();
    expect(LLM_MODELS[LLM_PROVIDERS.OLLAMA]).toBeDefined();
  });

  test('BaseLLMProvider pode ser instanciada', () => {
    const config = {
      provider: 'test',
      model: 'test-model',
      apiKey: 'test-key'
    };
    
    const provider = new BaseLLMProvider(config);
    expect(provider.provider).toBe('test');
    expect(provider.model).toBe('test-model');
    expect(provider.apiKey).toBe('test-key');
  });

  test('BaseLLMProvider validateConfig funciona corretamente', () => {
    const validConfig = {
      provider: 'test',
      model: 'test-model',
      apiKey: 'test-key'
    };
    
    const invalidConfig = {
      provider: 'test'
    };
    
    const validProvider = new BaseLLMProvider(validConfig);
    const invalidProvider = new BaseLLMProvider(invalidConfig);
    
    expect(validProvider.validateConfig()).toBe(true);
    expect(invalidProvider.validateConfig()).toBe(false);
  });

  test('BaseLLMProvider getContextWindow retorna valor padrão', () => {
    const config = {
      provider: 'unknown',
      model: 'unknown-model',
      apiKey: 'test-key'
    };
    
    const provider = new BaseLLMProvider(config);
    expect(provider.getContextWindow()).toBe(4096);
  });
});
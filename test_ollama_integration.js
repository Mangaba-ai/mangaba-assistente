/**
 * Teste de integração com Ollama
 * Este arquivo testa se a implementação do OllamaProvider está funcionando corretamente
 */

import { LLMService, LLMFactory, LLM_PROVIDERS } from './src/services/LLMService.js';
import { AgentConfiguration, agentConfigManager } from './src/config/AgentConfig.js';

// Função para testar a conexão com Ollama
async function testOllamaConnection() {
  console.log('🔄 Testando conexão com Ollama...');
  
  try {
    // Criar um provedor Ollama
    const ollamaProvider = LLMFactory.createProvider({
      provider: LLM_PROVIDERS.OLLAMA,
      model: 'llama2',
      baseUrl: 'http://localhost:11434'
    });

    console.log('✅ Provedor Ollama criado com sucesso');
    console.log('📋 Informações do modelo:', ollamaProvider.getModelInfo());
    console.log('🔧 Configuração válida:', ollamaProvider.validateConfig());

    // Testar envio de mensagem simples
    console.log('\n🔄 Testando envio de mensagem...');
    const response = await ollamaProvider.sendMessage('Olá! Como você está?', {
      temperature: 0.7,
      maxTokens: 100
    });
    
    console.log('✅ Resposta recebida:', response.substring(0, 200) + '...');
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar Ollama:', error.message);
    return false;
  }
}

// Função para testar criação de agentes locais
async function testLocalAgentCreation() {
  console.log('\n🔄 Testando criação de agentes locais...');
  
  try {
    // Criar agente local geral
    const localAgent = agentConfigManager.createFromTemplate('LOCAL_GENERAL', {
      name: 'Meu Agente Local',
      llmConfig: {
        provider: LLM_PROVIDERS.OLLAMA,
        model: 'llama2',
        baseUrl: 'http://localhost:11434'
      }
    });

    console.log('✅ Agente local criado:', localAgent.name);
    console.log('📋 Capacidades:', localAgent.getCapabilities());
    
    // Validar configuração
    const validation = localAgent.validate();
    console.log('🔧 Validação:', validation.isValid ? '✅ Válido' : '❌ Inválido');
    
    if (validation.warnings.length > 0) {
      console.log('⚠️ Avisos:', validation.warnings);
    }
    
    if (validation.errors.length > 0) {
      console.log('❌ Erros:', validation.errors);
    }

    // Criar agente de código
    const codeAgent = agentConfigManager.createFromTemplate('LOCAL_CODE_ASSISTANT', {
      name: 'Assistente de Código Local',
      llmConfig: {
        provider: LLM_PROVIDERS.OLLAMA,
        model: 'codellama',
        baseUrl: 'http://localhost:11434'
      }
    });

    console.log('✅ Agente de código criado:', codeAgent.name);
    
    // Listar todos os agentes
    const allAgents = agentConfigManager.listConfigurations();
    console.log(`\n📊 Total de agentes configurados: ${allAgents.length}`);
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar agentes:', error.message);
    return false;
  }
}

// Função para testar streaming
async function testOllamaStreaming() {
  console.log('\n🔄 Testando streaming com Ollama...');
  
  try {
    const ollamaProvider = LLMFactory.createProvider({
      provider: LLM_PROVIDERS.OLLAMA,
      model: 'mistral',
      baseUrl: 'http://localhost:11434'
    });

    let streamedContent = '';
    
    await ollamaProvider.streamMessage(
      'Conte uma história curta sobre inteligência artificial.',
      (chunk) => {
        streamedContent += chunk;
        process.stdout.write(chunk);
      }
    );
    
    console.log('\n✅ Streaming concluído com sucesso!');
    console.log(`📊 Total de caracteres recebidos: ${streamedContent.length}`);
    
    return true;
  } catch (error) {
    console.error('❌ Erro no streaming:', error.message);
    return false;
  }
}

// Função principal de teste
async function runTests() {
  console.log('🚀 Iniciando testes de integração com Ollama\n');
  
  const results = {
    connection: false,
    agentCreation: false,
    streaming: false
  };
  
  // Teste 1: Conexão básica
  results.connection = await testOllamaConnection();
  
  // Teste 2: Criação de agentes
  results.agentCreation = await testLocalAgentCreation();
  
  // Teste 3: Streaming
  results.streaming = await testOllamaStreaming();
  
  // Resumo dos resultados
  console.log('\n📊 RESUMO DOS TESTES:');
  console.log('='.repeat(50));
  console.log(`🔗 Conexão com Ollama: ${results.connection ? '✅ PASSOU' : '❌ FALHOU'}`);
  console.log(`🤖 Criação de Agentes: ${results.agentCreation ? '✅ PASSOU' : '❌ FALHOU'}`);
  console.log(`📡 Streaming: ${results.streaming ? '✅ PASSOU' : '❌ FALHOU'}`);
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\n🎯 RESULTADO GERAL: ${allPassed ? '✅ TODOS OS TESTES PASSARAM!' : '❌ ALGUNS TESTES FALHARAM'}`);
  
  if (allPassed) {
    console.log('\n🎉 A integração com Ollama está funcionando perfeitamente!');
    console.log('🚀 Você pode agora usar modelos locais em seus agentes!');
  } else {
    console.log('\n🔧 Verifique os erros acima e certifique-se de que:');
    console.log('   - O Ollama está rodando (ollama serve)');
    console.log('   - Os modelos estão baixados (ollama list)');
    console.log('   - A porta 11434 está acessível');
  }
}

// Executar testes se este arquivo for executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { testOllamaConnection, testLocalAgentCreation, testOllamaStreaming, runTests };
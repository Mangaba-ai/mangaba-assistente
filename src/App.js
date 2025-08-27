import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import GlobalStyles from './styles/GlobalStyles';
import ChatMessage from './components/ChatMessage';
import MessageInput from './components/MessageInput';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Hub from './components/Hub';
import Login from './components/Login';
import useProtocol from './hooks/useProtocol';
import { LLM_PROVIDERS } from './services/LLMService.js';
import agentCoordinationService from './services/AgentCoordinationService';
import CollaborationStatus from './components/CollaborationStatus';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background: ${props => props.theme.gradients.chat};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  transition: background 0.3s ease;
`;

const NavigationSidebar = styled.nav`
  /* Sidebar styles will be applied by the Sidebar component */
`;

const MainSection = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-left: ${props => props.$sidebarOpen ? '280px' : '0'};
  transition: margin-left 0.3s ease;
  
  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const SidebarToggleButton = styled.button`
  position: fixed;
  top: 80px;
  left: ${props => props.$sidebarOpen ? '300px' : '20px'};
  z-index: 1002;
  background: ${props => props.theme.primary.orangeAccessible};
  color: ${props => props.theme.text.inverse};
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  font-size: 18px;
  cursor: pointer;
  box-shadow: ${props => props.theme.shadow.medium};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: ${props => props.theme.primary.orangeHover || props.theme.primary.orange};
    transform: scale(1.05);
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;



const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  ${props => props.$isHubView && `
    padding: 0;
  `}
`;

const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  padding: 0 20px;
  height: 100%;
  overflow: hidden;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
  max-height: calc(100vh - 200px);
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.background.secondary};
    border-radius: 4px;
    margin: 4px 0;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.primary.orange};
    border-radius: 4px;
    border: 1px solid ${props => props.theme.background.secondary};
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.primary.orangeHover || props.theme.primary.orange};
  }
`;

function AppContent() {
  const { theme } = useTheme();
  
  // Estado de autenticação
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  
  // Verificar autenticação ao carregar
  useEffect(() => {
    const checkAuth = () => {
      // Verificar localStorage primeiro (remember me)
      const savedUser = localStorage.getItem('mangaba_user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setIsAuthenticated(true);
          return;
        } catch (error) {
          localStorage.removeItem('mangaba_user');
        }
      }
      
      // Verificar sessionStorage
      const sessionUser = sessionStorage.getItem('mangaba_user');
      if (sessionUser) {
        try {
          const userData = JSON.parse(sessionUser);
          setUser(userData);
          setIsAuthenticated(true);
          return;
        } catch (error) {
          sessionStorage.removeItem('mangaba_user');
        }
      }
    };
    
    checkAuth();
  }, []);
  
  // Função para fazer login
  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };
  
  // Função para fazer logout
  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('mangaba_user');
    sessionStorage.removeItem('mangaba_user');
    // Limpar outras informações do usuário se necessário
    setMessages(loadMessagesFromStorage());
    setCurrentView('chat');
    setSidebarOpen(false);
  };
  
  // Função para carregar mensagens do localStorage
  const loadMessagesFromStorage = () => {
    try {
      const savedMessages = localStorage.getItem('mangaba_messages');
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        // Converter timestamps de string para Date
        return parsedMessages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens do localStorage:', error);
    }
    
    // Retorna mensagem padrão se não houver mensagens salvas
    return [
      {
        id: 1,
        text: 'Olá! Eu sou o Mangaba Assistente, seu assistente de IA inteligente rodando localmente com Ollama. Como posso ajudá-lo hoje?',
        isBot: true,
        timestamp: new Date()
      }
    ];
  };
  
  const [messages, setMessages] = useState(loadMessagesFromStorage);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('chat'); // 'chat' ou 'hub'
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [activeConnection, setActiveConnection] = useState(null);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [activeAgents, setActiveAgents] = useState([]);
  const [coordinationEnabled, setCoordinationEnabled] = useState(false);
  const [collaborationSessions, setCollaborationSessions] = useState([]);
  const messagesEndRef = useRef(null);
  const sidebarRef = useRef(null);
  
  // Criar agente padrão com Ollama
  const createDefaultAgent = () => {
    return {
      id: 'default-ollama-agent',
      name: 'Assistente Mangaba (Ollama)',
      description: 'Assistente inteligente local usando Ollama com modelo llama2',
      active: true,
      protocol: 'MCP',
      parameters: {
        model: 'llama2:latest',
        temperature: 0.7,
        maxTokens: 2048,
        provider: LLM_PROVIDERS.OLLAMA
      },
      systemPrompt: 'Você é o Mangaba Assistente, um assistente de IA inteligente e prestativo. Responda de forma clara, útil e amigável em português brasileiro.',
      protocolConfig: {
        MCP: {
          serverUrl: 'http://localhost:11434',
          clientId: 'mangaba-default',
          contextWindow: 4096,
          tools: ['chat', 'analysis'],
          resources: ['local_models'],
          maxConnections: 5
        }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };
  
  const {
    connections,
    connectA2A,
    connectMCP,
    sendA2AMessage,
    sendMCPPrompt,
    disconnect
  } = useProtocol();
  
  // Carregar agentes ativos do localStorage
  const loadActiveAgents = () => {
    try {
      // Carregar agentes do Hub
      const { AGENT_TEMPLATES } = require('./config/AgentConfig.js');
      const savedAgents = JSON.parse(localStorage.getItem('mangaba_agents') || '[]');
      
      // Carregar estado dos agentes template
      const templateStates = JSON.parse(localStorage.getItem('mangaba_template_states') || '{}');
      
      // Converter templates para formato do Hub
      const templateAgents = Object.entries(AGENT_TEMPLATES).map(([key, template]) => {
        const templateId = template.id || key;
        // Apenas o Agente Geral fica ativo por padrão
        const isGeneralAgent = key === 'general' || template.name === 'Agente Geral';
        const defaultActive = isGeneralAgent;
        
        return {
          id: templateId,
          name: template.name,
          description: template.description,
          active: templateStates[templateId] !== undefined ? templateStates[templateId] : defaultActive,
          protocol: template.protocol || 'OLLAMA',
          parameters: template.parameters || {},
          systemPrompt: template.systemPrompt,
          isTemplate: true
        };
      });
      
      // Combinar agentes de template com agentes salvos
      const allAgents = [...templateAgents, ...savedAgents];
      
      // Filtrar apenas agentes ativos (active: true)
      const active = allAgents.filter(agent => agent.active === true);
      
      console.log('Agentes ativos carregados:', active.length, active.map(a => a.name));
      
      // Registrar agentes ativos no serviço de coordenação
      if (coordinationEnabled) {
        registerActiveAgentsForCoordination(active);
      }
      
      return active;
    } catch (error) {
      console.error('Erro ao carregar agentes ativos:', error);
      return [];
    }
  };

  // Registrar agentes ativos para coordenação
  const registerActiveAgentsForCoordination = async (agents) => {
    for (const agent of agents) {
      try {
        // Simular conexão para agentes que não estão conectados
        let connection = null;
        if (agent.id === selectedAgent?.id && activeConnection) {
          connection = activeConnection;
        } else {
          // Criar conexão simulada para coordenação
          connection = {
            id: `coord_${agent.id}`,
            status: 'connected',
            agent: agent
          };
        }
        
        agentCoordinationService.registerAgent(agent, connection);
      } catch (error) {
        console.error(`Erro ao registrar agente ${agent.name} para coordenação:`, error);
      }
    }
  };

  // Ativar/desativar coordenação de agentes
  const toggleCoordination = () => {
    const newState = !coordinationEnabled;
    setCoordinationEnabled(newState);
    
    if (newState) {
      registerActiveAgentsForCoordination(activeAgents);
      setupCoordinationListeners();
    } else {
      // Desregistrar todos os agentes
      activeAgents.forEach(agent => {
        agentCoordinationService.unregisterAgent(agent.id);
      });
    }
  };

  // Configurar listeners para eventos de coordenação
  const setupCoordinationListeners = () => {
    agentCoordinationService.on('session:completed', (data) => {
      const { session, finalResult } = data;
      
      // Adicionar resultado da colaboração às mensagens
      const collaborationMessage = {
        id: Date.now(),
        text: finalResult,
        isBot: true,
        timestamp: new Date(),
        type: 'collaboration_result',
        sessionId: session.id,
        participatingAgents: session.assignedAgents.map(a => a.agentId)
      };
      
      setMessages(prev => [...prev, collaborationMessage]);
      
      // Atualizar sessões de colaboração
      setCollaborationSessions(prev => {
        const updated = prev.map(s => s.id === session.id ? session : s);
        if (!updated.find(s => s.id === session.id)) {
          updated.push(session);
        }
        return updated;
      });
    });
    
    agentCoordinationService.on('task:distributed', (data) => {
      console.log('Tarefa distribuída:', data);
    });
  };
  
  // Inicializar agente padrão e carregar agentes ativos quando o componente montar
  useEffect(() => {
    const initializeAgents = async () => {
      try {
        // Carregar agentes ativos
        const agents = loadActiveAgents();
        setActiveAgents(agents);
        
        // Inicializar agente padrão se não houver agente selecionado (sem mensagem de sistema)
        if (!selectedAgent && agents.length > 0) {
          const defaultAgent = agents.find(agent => agent.name.includes('Mangaba')) || agents[0];
          setSelectedAgent(defaultAgent);
          console.log('Agente padrão inicializado silenciosamente:', defaultAgent.name);
        }
      } catch (error) {
        console.warn('Erro ao inicializar agentes:', error.message);
        // Criar agente padrão como fallback
        const defaultAgent = createDefaultAgent();
        setActiveAgents([defaultAgent]);
        setSelectedAgent(defaultAgent);
      }
    };
    
    // Aguardar um pouco para garantir que os serviços estejam prontos
    const timer = setTimeout(initializeAgents, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Função para salvar mensagens no localStorage
  const saveMessagesToStorage = (messagesToSave) => {
    try {
      localStorage.setItem('mangaba_messages', JSON.stringify(messagesToSave));
    } catch (error) {
      console.error('Erro ao salvar mensagens no localStorage:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-save das mensagens quando o estado mudar
  useEffect(() => {
    saveMessagesToStorage(messages);
    scrollToBottom();
    
    // Salvar conversa atual no histórico se houver ID de conversa
    if (currentConversationId && sidebarRef.current && messages.length > 1) {
      // Gerar título baseado na primeira mensagem do usuário
      const firstUserMessage = messages.find(msg => !msg.isBot && !msg.isSystem);
      const title = firstUserMessage ? 
        firstUserMessage.text.substring(0, 50) + (firstUserMessage.text.length > 50 ? '...' : '') :
        'Nova Conversa';
      
      sidebarRef.current.saveCurrentConversation(messages, title);
    }
  }, [messages, currentConversationId, sidebarRef]);
  
  // Função para criar nova conversa
  const handleNewConversation = (conversation) => {
    setCurrentConversationId(conversation.id);
    setMessages([
          {
            id: 1,
            text: 'Olá! Eu sou o Mangaba Assistente, seu assistente de IA inteligente rodando localmente com Ollama. Como posso ajudá-lo hoje?',
            isBot: true,
            timestamp: new Date()
          }
        ]);
  };
  
  // Função para carregar conversa existente
  const handleLoadConversation = (conversation) => {
    setCurrentConversationId(conversation.id);
    
    if (conversation.messages && conversation.messages.length > 0) {
      // Carregar mensagens da conversa
      const loadedMessages = conversation.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
      setMessages(loadedMessages);
    } else {
      // Se não há mensagens salvas, carregar mensagem padrão
      setMessages([
        {
          id: 1,
          text: 'Olá! Eu sou o Mangaba Assistente, seu assistente de IA inteligente rodando localmente com Ollama. Como posso ajudá-lo hoje?',
          isBot: true,
          timestamp: new Date()
        }
      ]);
    }
  };
  
  // Função para limpar cache de conversas
  const handleClearCache = () => {
    try {
      localStorage.removeItem('mangaba_messages');
      localStorage.removeItem('mangaba_chat_history');
      
      // Resetar estado
      setMessages([
        {
          id: 1,
          text: 'Olá! Eu sou o Mangaba Assistente, seu assistente de IA inteligente rodando localmente com Ollama. Como posso ajudá-lo hoje?',
          isBot: true,
          timestamp: new Date()
        }
      ]);
      setCurrentConversationId(null);
      
      console.log('Cache limpo com sucesso!');
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    }
  };

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    // Adiciona mensagem do usuário
    const userMessage = {
      id: Date.now(),
      text: messageText,
      isBot: false,
      timestamp: new Date(),
      agent: selectedAgent
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let responseText = '';
      
      // Verificar se deve usar coordenação de agentes
      if (coordinationEnabled && activeAgents.length > 1 && 
          (messageText.toLowerCase().includes('colaborar') || 
           messageText.toLowerCase().includes('trabalhem juntos') ||
           messageText.toLowerCase().includes('em conjunto'))) {
        try {
          // Criar sessão de colaboração
          const session = await agentCoordinationService.createCollaborationSession(
            messageText,
            activeAgents.slice(0, 3) // Limitar a 3 agentes para evitar sobrecarga
          );
          
          responseText = `Iniciando colaboração entre ${session.assignedAgents.length} agentes para processar sua solicitação...`;
          
          // Adicionar sessão às colaborações ativas
          setCollaborationSessions(prev => [...prev, session]);
          
          // A resposta final será enviada via listener
        } catch (error) {
          console.error('Erro na coordenação de agentes:', error);
          responseText = 'Erro ao coordenar agentes. Processando com agente individual...';
        }
      }
      
      // Processamento individual se não há coordenação ou falhou
      if (!responseText) {
        // Verificar se é um agente Ollama e usar LLM diretamente
        if (selectedAgent && selectedAgent.parameters?.provider === 'OLLAMA') {
          try {
            const llmService = await import('./services/LLMService.js');
            const response = await llmService.default.sendMessage(messageText);
            responseText = response || 'Resposta recebida do Ollama';
          } catch (error) {
            console.warn('Erro ao usar Ollama diretamente:', error);
            responseText = `Erro ao conectar com Ollama: ${error.message}. Verifique se o Ollama está rodando.`;
          }
        } else if (selectedAgent && activeConnection) {
          // Usar protocolo real baseado no agente selecionado
          if (selectedAgent.protocol === 'A2A') {
            await sendA2AMessage(activeConnection.id, messageText, 'target-agent-id');
            responseText = `[${selectedAgent.name} via A2A] Mensagem enviada através do protocolo Agent-to-Agent. Aguardando resposta...`;
          } else if (selectedAgent.protocol === 'MCP') {
            await sendMCPPrompt(activeConnection.id, messageText, { 
              agent: selectedAgent.name,
              systemPrompt: selectedAgent.systemPrompt 
            });
            responseText = `[${selectedAgent.name} via MCP] Processando através do Model Context Protocol...`;
          }
        } else {
          // Usar LLM diretamente quando não há agente conectado (fallback)
          try {
            const llmService = await import('./services/LLMService.js');
            const response = await llmService.default.sendMessage(messageText);
            responseText = response || 'Resposta recebida do Ollama';
          } catch (error) {
            console.warn('Erro ao usar Ollama diretamente:', error);
            responseText = `Obrigado por sua mensagem: "${messageText}". Esta é uma resposta simulada. Para melhor experiência, certifique-se de que o Ollama está rodando localmente.`;
          }
        }
      }
      
      const botMessage = {
        id: Date.now() + 1,
        text: responseText,
        isBot: true,
        timestamp: new Date(),
        agent: selectedAgent
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: `Erro ao processar mensagem: ${error.message}`,
        isBot: true,
        timestamp: new Date(),
        agent: selectedAgent
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToHub = () => {
    setCurrentView('hub');
    setSidebarOpen(false);
  };

  const handleNavigateToChat = () => {
    setCurrentView('chat');
  };

  // Função para recarregar agentes ativos
  const reloadActiveAgents = () => {
    const agents = loadActiveAgents();
    setActiveAgents(agents);
    console.log('Agentes ativos recarregados:', agents.length);
    return agents;
  };
  
  const handleSelectAgent = async (agent) => {
    // Evitar reprocessamento se o mesmo agente já está selecionado
    if (selectedAgent && selectedAgent.id === agent.id) {
      setCurrentView('chat');
      return;
    }
    
    setSelectedAgent(agent);
    setCurrentView('chat');
    
    // Desconectar conexão anterior se existir
    if (activeConnection) {
      await disconnect(activeConnection.id);
      setActiveConnection(null);
    }
    
    if (agent) {
      try {
        let connectionId;
        
        // Conectar usando o protocolo do agente
        if (agent.protocol === 'A2A') {
          connectionId = await connectA2A(agent.protocolConfig?.A2A || {
            endpoint: 'https://api.example.com/a2a',
            apiKey: '',
            agentId: agent.name.toLowerCase().replace(/\s+/g, '-'),
            capabilities: ['chat', 'analysis']
          });
        } else if (agent.protocol === 'MCP') {
          connectionId = await connectMCP(agent.protocolConfig?.MCP || {
            serverUrl: 'ws://localhost:8080/mcp',
            clientId: agent.name.toLowerCase().replace(/\s+/g, '-'),
            contextWindow: 4096,
            tools: ['web_search', 'code_analysis']
          });
        }
        
        // Encontrar a conexão criada
        const connection = connections.find(conn => conn.id === connectionId);
        if (connection) {
          setActiveConnection(connection);
        }
        
        // Adicionar mensagem informativa sobre a ativação do agente apenas se não for inicialização silenciosa
        const systemMessage = {
          id: Date.now(),
          text: `Agente ${agent.name} ativado. Protocolo: ${agent.protocol}. ${agent.description}`,
          isBot: true,
          isSystem: true,
          timestamp: new Date(),
          agent: agent
        };
        setMessages(prev => [...prev, systemMessage]);
        
      } catch (error) {
        console.error('Erro ao conectar agente:', error);
        
        const errorMessage = {
          id: Date.now(),
          text: `Erro ao ativar agente ${agent.name}: ${error.message}`,
          isBot: true,
          isSystem: true,
          timestamp: new Date(),
          agent: agent
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    }
  };

  const renderChatView = () => (
    <MainContent as="main">
      <Header 
          onMenuClick={() => setSidebarOpen(true)}
          selectedAgent={selectedAgent}
          onNavigateToHub={handleNavigateToHub}
          coordinationEnabled={coordinationEnabled}
          onToggleCoordination={toggleCoordination}
          activeAgentsCount={activeAgents.length}
          user={user}
          onLogout={handleLogout}
        />
      
      <ChatContainer>
        <MessagesContainer theme={theme}>
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message.text}
              isBot={message.isBot}
              isSystem={message.isSystem}
              timestamp={message.timestamp}
              agent={message.agent}
            />
          ))}
          
          {/* Exibir status de colaborações ativas */}
          {collaborationSessions
            .filter(session => session.status === 'in_progress')
            .map(session => (
              <CollaborationStatus
                key={session.id}
                session={session}
                activeAgents={activeAgents}
              />
            ))}
          
          {isLoading && (
            <ChatMessage
              message="Digitando..."
              isBot={true}
              isLoading={true}
            />
          )}
          <div ref={messagesEndRef} />
        </MessagesContainer>
        <MessageInput onSendMessage={handleSendMessage} disabled={isLoading} />
      </ChatContainer>
    </MainContent>
  );

  const renderHubView = () => (
    <MainContent as="main" $isHubView>
      <Hub 
        onNavigateToChat={handleNavigateToChat}
        onSelectAgent={handleSelectAgent}
        onAgentsChange={reloadActiveAgents}
      />
    </MainContent>
  );

  // Se não estiver autenticado, mostrar tela de login
  if (!isAuthenticated) {
    return (
      <>
        <GlobalStyles theme={theme} />
        <Login onLogin={handleLogin} />
      </>
    );
  }

  // Se estiver autenticado, mostrar aplicação principal
  return (
    <>
      <GlobalStyles theme={theme} />
      <AppContainer theme={theme}>
        <NavigationSidebar as="nav">
          <SidebarToggleButton 
            theme={theme}
            $sidebarOpen={sidebarOpen}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? 'Ocultar sidebar' : 'Mostrar sidebar'}
            aria-label={sidebarOpen ? 'Ocultar menu de navegação' : 'Mostrar menu de navegação'}
          >
            {sidebarOpen ? '◀' : '▶'}
          </SidebarToggleButton>
          <Sidebar 
            ref={sidebarRef}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onNavigateToHub={handleNavigateToHub}
            onNavigateToChat={handleNavigateToChat}
            currentView={currentView}
            selectedAgent={selectedAgent}
            activeAgents={activeAgents}
            onNewConversation={handleNewConversation}
            onLoadConversation={handleLoadConversation}
            onClearCache={handleClearCache}
            onSelectAgent={handleSelectAgent}
          />
        </NavigationSidebar>
        
        <MainSection $sidebarOpen={sidebarOpen}>
          {currentView === 'chat' ? renderChatView() : renderHubView()}
        </MainSection>
      </AppContainer>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
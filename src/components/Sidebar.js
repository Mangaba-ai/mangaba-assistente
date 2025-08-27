import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';

const SidebarOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  
  @media (min-width: 768px) {
    display: none;
  }
`;

const SidebarContainer = styled.aside`
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: ${props => props.theme.background.sidebar};
  box-shadow: ${props => props.theme.shadow.medium};
  z-index: 1001;
  transform: translateX(${props => props.$isOpen ? '0' : '-100%'});
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  
  @media (min-width: 768px) {
    position: fixed;
    transform: translateX(${props => props.$isOpen ? '0' : '-100%'});
    box-shadow: ${props => props.theme.shadow.medium};
    border-right: 1px solid ${props => props.theme.border.light};
  }
`;

const SidebarHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${props => props.theme.border.light};
  background: ${props => props.theme.gradients.primary};
  color: ${props => props.theme.text.inverse};
  transition: all 0.3s ease;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: ${props => props.theme.text.inverse};
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  @media (min-width: 768px) {
    display: none;
  }
`;

const SidebarTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const NewChatButton = styled.button`
  width: 100%;
  padding: 12px 20px;
  margin: 16px 0;
  background: ${props => props.theme.gradients.nature};
  color: ${props => props.theme.text.inverse};
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(46, 125, 50, 0.4);
    background: ${props => props.theme.gradients.greenDark};
  }
`;

const SidebarContent = styled.div`
  flex: 1;
  padding: 0 20px;
  overflow-y: auto;
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
`;

const ChatHistoryList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ChatHistoryItem = styled.li`
  padding: 8px 12px;
  margin-bottom: 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  color: ${props => props.theme.text.primary};
  position: relative;
  display: flex;
  flex-direction: column;
  
  &:hover {
    background: ${props => props.theme.background.hover};
    
    .chat-actions {
      opacity: 1;
      visibility: visible;
    }
  }
  
  &.active {
    background: ${props => props.theme.primary.lightGreen};
    border-left: 3px solid ${props => props.theme.primary.darkGreen};
  }
`;

const ChatTitle = styled.div`
  font-weight: 500;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
`;

const ChatContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const ChatInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ChatActions = styled.div`
  display: flex;
  gap: 4px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  margin-left: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.text.secondary};
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  font-size: 12px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.background.secondary};
    color: ${props => props.theme.text.primary};
  }
  
  &.delete:hover {
    background: ${props => props.theme.gradients.destructive};
    color: ${props => props.theme.text.inverse};
    box-shadow: 0 2px 8px ${props => props.theme.primary.darkRed}40;
    transform: translateY(-1px);
  }
  
  &.critical:hover {
    background: ${props => props.theme.gradients.critical};
    color: ${props => props.theme.text.inverse};
    box-shadow: 0 2px 8px ${props => props.theme.primary.crimsonRed}40;
    transform: translateY(-1px);
  }
`;

const EditInput = styled.input`
  background: ${props => props.theme.background.primary};
  border: 1px solid ${props => props.theme.border.light};
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 14px;
  color: ${props => props.theme.text.primary};
  width: 100%;
  margin-bottom: 4px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary.orangeAccessible};
  }
`;

const ChatDate = styled.div`
  font-size: 12px;
  color: ${props => props.theme.text.secondary};
  transition: all 0.3s ease;
`;

const MenuList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const MenuItem = styled.li`
  padding: 12px;
  margin-bottom: 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  color: ${props => props.theme.text.primary};
  display: flex;
  align-items: center;
  gap: 12px;
  
  &:hover {
    background: ${props => props.theme.background.hover};
  }
  
  ${props => props.$active && `
    background: ${props.theme.primary.lightYellow};
    color: ${props.theme.primary.orangeAccessible};
    font-weight: 600;
  `}
`;

const AgentSection = styled.div`
  padding: 20px;
  border-top: 1px solid ${props => props.theme.border.light};
  border-bottom: 1px solid ${props => props.theme.border.light};
  margin: 16px 0;
  transition: all 0.3s ease;
`;

const AgentTitle = styled.h4`
  color: ${props => props.theme.primary.orangeAccessible};
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
`;

const AgentCard = styled.div`
  background: ${props => props.theme.primary.lightYellow};
  border: 1px solid ${props => props.theme.primary.orangeAccessible}30;
  border-radius: 8px;
  padding: 12px;
  margin-top: 8px;
  transition: all 0.3s ease;
`;

const AgentName = styled.div`
  color: ${props => props.theme.primary.orangeAccessible};
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
  transition: all 0.3s ease;
`;

const AgentProtocol = styled.div`
  color: ${props => props.theme.text.secondary};
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s ease;
`;

const NoAgentText = styled.div`
  color: ${props => props.theme.text.secondary};
  font-size: 12px;
  font-style: italic;
  text-align: center;
  padding: 16px 0;
  transition: all 0.3s ease;
`;

const MenuIcon = styled.span`
  font-size: 16px;
  width: 20px;
  text-align: center;
`;

const SidebarFooter = styled.div`
  padding: 20px;
  border-top: 1px solid ${props => props.theme.border.light};
  background: ${props => props.theme.background.secondary};
  transition: all 0.3s ease;
`;

const FooterText = styled.p`
  margin: 0;
  font-size: 12px;
  color: ${props => props.theme.text.secondary};
  text-align: center;
  transition: all 0.3s ease;
`;

// Modal Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: ${props => props.theme.background.primary};
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: ${props => props.theme.shadow.large};
  border: 1px solid ${props => props.theme.border.light};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${props => props.theme.border.light};
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: ${props => props.theme.primary.orangeAccessible};
  font-size: 18px;
  font-weight: 600;
`;

const ModalCloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.text.secondary};
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.background.hover};
    color: ${props => props.theme.text.primary};
  }
`;

const ModalContent = styled.div`
  color: ${props => props.theme.text.primary};
  line-height: 1.6;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid ${props => props.theme.border.light};
  
  &:last-child {
    border-bottom: none;
  }
`;

const SettingLabel = styled.span`
  font-weight: 500;
`;

const SettingValue = styled.span`
  color: ${props => props.theme.text.secondary};
  font-size: 14px;
`;

const ThemeOption = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px;
  margin-bottom: 8px;
  background: ${props => props.$active ? props.theme.primary.lightYellow : props.theme.background.secondary};
  border: 1px solid ${props => props.$active ? props.theme.primary.orangeAccessible : props.theme.border.light};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.background.hover};
  }
`;

const StatCard = styled.div`
  background: ${props => props.theme.background.secondary};
  border: 1px solid ${props => props.theme.border.light};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: ${props => props.theme.primary.orangeAccessible};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: ${props => props.theme.text.secondary};
`;

const FeedbackForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FeedbackTextarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 1px solid ${props => props.theme.border.light};
  border-radius: 8px;
  background: ${props => props.theme.background.secondary};
  color: ${props => props.theme.text.primary};
  font-family: inherit;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary.orangeAccessible};
  }
`;

const FeedbackButton = styled.button`
  padding: 12px 24px;
  background: ${props => props.theme.gradients.primary};
  color: ${props => props.theme.text.inverse};
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadow.orange};
  }
`;

const Sidebar = React.forwardRef(({ isOpen, onClose, onNavigateToHub, onNavigateToChat, currentView, selectedAgent, activeAgents = [], onLoadConversation, onNewConversation, onClearCache, onSelectAgent }, ref) => {
  const { theme, toggleTheme, isDark } = useTheme();
  const [feedbackText, setFeedbackText] = useState('');
  
  // Função para carregar histórico de conversas do localStorage
  const loadChatHistory = () => {
    try {
      const savedHistory = localStorage.getItem('mangaba_chat_history');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        return parsedHistory.map(chat => ({
          ...chat,
          date: new Date(chat.date)
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar histórico do localStorage:', error);
    }
    return [];
  };
  
  // Função para salvar histórico no localStorage
  const saveChatHistory = (history) => {
    try {
      localStorage.setItem('mangaba_chat_history', JSON.stringify(history));
    } catch (error) {
      console.error('Erro ao salvar histórico no localStorage:', error);
    }
  };
  
  const [chatHistory, setChatHistory] = useState(loadChatHistory);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  
  // Carregar histórico ao montar o componente
  useEffect(() => {
    const history = loadChatHistory();
    setChatHistory(history);
    
    // Definir conversa ativa se houver
    const activeChat = history.find(chat => chat.active);
    if (activeChat) {
      setActiveConversationId(activeChat.id);
    }
  }, []);
  
  // Salvar histórico sempre que mudar
  useEffect(() => {
    if (chatHistory.length > 0) {
      saveChatHistory(chatHistory);
    }
  }, [chatHistory]);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const menuItems = [
    { icon: '⚙️', label: 'Configurações', action: () => setShowSettingsModal(true) },
    { icon: '🎨', label: 'Temas', action: () => setShowThemeModal(true) },
    { icon: '📊', label: 'Estatísticas', action: () => setShowStatsModal(true) },
    { icon: '🗑️', label: 'Limpar Cache', action: () => {
      if (window.confirm('Tem certeza que deseja limpar todo o histórico de conversas? Esta ação não pode ser desfeita.')) {
        if (onClearCache) {
          onClearCache();
        }
        // Recarregar histórico
        setChatHistory([]);
        setActiveConversationId(null);
      }
    }},
    { icon: '❓', label: 'Ajuda', action: () => setShowHelpModal(true) },
    { icon: '📝', label: 'Feedback', action: () => setShowFeedbackModal(true) }
  ];

  const formatDate = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Ontem';
    if (diffDays <= 7) return `${diffDays} dias atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  // Função para criar uma nova conversa
  const handleNewChat = () => {
    const newConversation = {
      id: Date.now(),
      title: 'Nova Conversa',
      date: new Date(),
      active: true,
      messages: []
    };
    
    // Desativar todas as outras conversas
    const updatedHistory = chatHistory.map(chat => ({ ...chat, active: false }));
    
    // Adicionar nova conversa no início
    const newHistory = [newConversation, ...updatedHistory];
    setChatHistory(newHistory);
    setActiveConversationId(newConversation.id);
    
    // Notificar o componente pai sobre a nova conversa
    if (onNewConversation) {
      onNewConversation(newConversation);
    }
    
    onClose();
  };
  
  // Função para carregar uma conversa específica
  const handleLoadConversation = (conversationId) => {
    // Atualizar estado ativo
    const updatedHistory = chatHistory.map(chat => ({
      ...chat,
      active: chat.id === conversationId
    }));
    
    setChatHistory(updatedHistory);
    setActiveConversationId(conversationId);
    
    // Notificar o componente pai sobre a conversa carregada
    const selectedConversation = updatedHistory.find(chat => chat.id === conversationId);
    if (onLoadConversation && selectedConversation) {
      onLoadConversation(selectedConversation);
    }
    
    onClose();
  };
  
  // Função para salvar conversa atual
  const saveCurrentConversation = (messages, title = null) => {
    if (activeConversationId) {
      const updatedHistory = chatHistory.map(chat => {
        if (chat.id === activeConversationId) {
          return {
            ...chat,
            messages: messages,
            title: title || chat.title,
            date: new Date()
          };
        }
        return chat;
      });
      
      setChatHistory(updatedHistory);
    }
  };
  
  // Função para deletar conversa
  const handleDeleteConversation = (conversationId, event) => {
    event.stopPropagation();
    
    if (window.confirm('Tem certeza que deseja deletar esta conversa? Esta ação não pode ser desfeita.')) {
      const updatedHistory = chatHistory.filter(chat => chat.id !== conversationId);
      setChatHistory(updatedHistory);
      
      // Se a conversa deletada era a ativa, limpar seleção
      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
        if (onNewConversation) {
          onNewConversation({ id: null, title: '', messages: [] });
        }
      }
    }
  };
  
  // Função para iniciar edição do título
  const handleStartEdit = (conversationId, currentTitle, event) => {
    event.stopPropagation();
    setEditingChatId(conversationId);
    setEditingTitle(currentTitle);
  };
  
  // Função para salvar título editado
  const handleSaveEdit = (conversationId) => {
    if (editingTitle.trim()) {
      const updatedHistory = chatHistory.map(chat => {
        if (chat.id === conversationId) {
          return { ...chat, title: editingTitle.trim() };
        }
        return chat;
      });
      setChatHistory(updatedHistory);
    }
    setEditingChatId(null);
    setEditingTitle('');
  };
  
  // Função para cancelar edição
  const handleCancelEdit = () => {
    setEditingChatId(null);
    setEditingTitle('');
  };
  
  // Função para lidar com teclas durante edição
  const handleEditKeyPress = (event, conversationId) => {
    if (event.key === 'Enter') {
      handleSaveEdit(conversationId);
    } else if (event.key === 'Escape') {
      handleCancelEdit();
    }
  };
  
  // Função para enviar feedback
  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (feedbackText.trim()) {
      // Aqui você pode implementar o envio do feedback para um servidor
      console.log('Feedback enviado:', feedbackText);
      alert('Obrigado pelo seu feedback! Sua opinião é muito importante para nós.');
      setFeedbackText('');
      setShowFeedbackModal(false);
    }
  };

  // Calcular estatísticas
  const getStats = () => {
    const totalConversations = chatHistory.length;
    const totalMessages = chatHistory.reduce((acc, chat) => acc + (chat.messages?.length || 0), 0);
    const activeConversations = chatHistory.filter(chat => chat.active).length;
    const oldestConversation = chatHistory.length > 0 ? 
      new Date(Math.min(...chatHistory.map(chat => new Date(chat.date)))) : null;
    
    return {
      totalConversations,
      totalMessages,
      activeConversations,
      oldestConversation
    };
  };

  // Expor função para o componente pai
  React.useImperativeHandle(ref, () => ({
    saveCurrentConversation
  }));

  return (
    <>
      <SidebarOverlay $isOpen={isOpen} onClick={onClose} />
      <SidebarContainer $isOpen={isOpen} theme={theme}>
        <SidebarHeader theme={theme}>
          <CloseButton theme={theme} onClick={onClose}>×</CloseButton>
          <SidebarTitle>Mangaba Assistente</SidebarTitle>
        </SidebarHeader>
        
        <SidebarContent>
          <NewChatButton theme={theme} onClick={handleNewChat}>
            <span>+</span>
            Nova Conversa
          </NewChatButton>
          
          <Section>
            <SectionTitle theme={theme}>Histórico</SectionTitle>
            {chatHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: theme.text.secondary, fontSize: '14px' }}>
                Nenhuma conversa salva ainda.
              </div>
            ) : (
              <ChatHistoryList>
                {chatHistory.map((chat) => (
                  <ChatHistoryItem
                    key={chat.id}
                    theme={theme}
                    className={chat.id === activeConversationId ? 'active' : ''}
                    onClick={() => editingChatId !== chat.id && handleLoadConversation(chat.id)}
                  >
                    <ChatContent>
                      <ChatInfo>
                        {editingChatId === chat.id ? (
                          <EditInput
                            theme={theme}
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => handleEditKeyPress(e, chat.id)}
                            onBlur={() => handleSaveEdit(chat.id)}
                            autoFocus
                          />
                        ) : (
                          <ChatTitle>{chat.title}</ChatTitle>
                        )}
                        <ChatDate theme={theme}>{formatDate(chat.date)}</ChatDate>
                      </ChatInfo>
                      <ChatActions className="chat-actions">
                        <ActionButton
                          theme={theme}
                          onClick={(e) => handleStartEdit(chat.id, chat.title, e)}
                          title="Renomear conversa"
                        >
                          ✏️
                        </ActionButton>
                        <ActionButton
                          theme={theme}
                          className="delete"
                          onClick={(e) => handleDeleteConversation(chat.id, e)}
                          title="Deletar conversa"
                        >
                          🗑️
                        </ActionButton>
                      </ChatActions>
                    </ChatContent>
                  </ChatHistoryItem>
                ))}
              </ChatHistoryList>
            )}
          </Section>
          
          <Section>
            <SectionTitle theme={theme}>Navegação</SectionTitle>
            <MenuList>
              <MenuItem 
                theme={theme}
                $active={currentView === 'chat'}
                onClick={() => {
                  onNavigateToChat();
                  onClose();
                }}
              >
                <MenuIcon>💬</MenuIcon>
                Chat
              </MenuItem>
              <MenuItem 
                theme={theme}
                $active={currentView === 'hub'}
                onClick={() => {
                  onNavigateToHub();
                  onClose();
                }}
              >
                <MenuIcon>🤖</MenuIcon>
                Hub de Agentes
              </MenuItem>
            </MenuList>
          </Section>
          
          <AgentSection theme={theme}>
            <AgentTitle theme={theme}>Agentes Ativos ({activeAgents.length})</AgentTitle>
            {activeAgents.length > 0 ? (
              <div>
                {activeAgents.map((agent) => (
                  <AgentCard 
                    key={agent.id} 
                    theme={theme}
                    style={{
                      cursor: 'pointer',
                      border: selectedAgent?.id === agent.id ? `2px solid ${theme.primary.orangeAccessible}` : `1px solid ${theme.primary.orangeAccessible}30`,
                      background: selectedAgent?.id === agent.id ? `${theme.primary.orangeAccessible}20` : theme.primary.lightYellow
                    }}
                    onClick={() => {
                      if (onSelectAgent) {
                        onSelectAgent(agent);
                      }
                      onClose();
                    }}
                  >
                    <AgentName theme={theme}>
                      {selectedAgent?.id === agent.id && '🔹 '}{agent.name}
                    </AgentName>
                    <AgentProtocol theme={theme}>
                      <span>📡</span> {agent.protocol}
                      {agent.isTemplate && <span style={{ marginLeft: '8px', fontSize: '10px', opacity: 0.7 }}>📋 Template</span>}
                    </AgentProtocol>
                  </AgentCard>
                ))}
              </div>
            ) : (
              <NoAgentText theme={theme}>
                Nenhum agente ativo encontrado
              </NoAgentText>
            )}
          </AgentSection>
          
          <Section>
            <SectionTitle theme={theme}>Menu</SectionTitle>
            <MenuList>
              {menuItems.map((item, index) => (
                <MenuItem key={index} theme={theme} onClick={item.action}>
                  <MenuIcon>{item.icon}</MenuIcon>
                  {item.label}
                </MenuItem>
              ))}
            </MenuList>
          </Section>
        </SidebarContent>
        
        <SidebarFooter theme={theme}>
          <FooterText theme={theme}>
            Mangaba Assistente v1.0
            <br />
            Powered by IA
          </FooterText>
        </SidebarFooter>
      </SidebarContainer>
      
      {/* Modal de Configurações */}
      {showSettingsModal && (
        <ModalOverlay onClick={() => setShowSettingsModal(false)}>
          <ModalContainer theme={theme} onClick={(e) => e.stopPropagation()}>
            <ModalHeader theme={theme}>
              <ModalTitle theme={theme}>⚙️ Configurações</ModalTitle>
              <ModalCloseButton theme={theme} onClick={() => setShowSettingsModal(false)}>×</ModalCloseButton>
            </ModalHeader>
            <ModalContent theme={theme}>
              <SettingItem theme={theme}>
                <SettingLabel>Versão do App</SettingLabel>
                <SettingValue theme={theme}>v1.0.0</SettingValue>
              </SettingItem>
              <SettingItem theme={theme}>
                <SettingLabel>Tema Atual</SettingLabel>
                <SettingValue theme={theme}>{isDark ? 'Escuro' : 'Claro'}</SettingValue>
              </SettingItem>
              <SettingItem theme={theme}>
                <SettingLabel>Agentes Ativos</SettingLabel>
                <SettingValue theme={theme}>{activeAgents.length}</SettingValue>
              </SettingItem>
              <SettingItem theme={theme}>
                <SettingLabel>Conversas Salvas</SettingLabel>
                <SettingValue theme={theme}>{chatHistory.length}</SettingValue>
              </SettingItem>
              <SettingItem theme={theme}>
                <SettingLabel>Armazenamento Local</SettingLabel>
                <SettingValue theme={theme}>Ativo</SettingValue>
              </SettingItem>
            </ModalContent>
          </ModalContainer>
        </ModalOverlay>
      )}
      
      {/* Modal de Temas */}
      {showThemeModal && (
        <ModalOverlay onClick={() => setShowThemeModal(false)}>
          <ModalContainer theme={theme} onClick={(e) => e.stopPropagation()}>
            <ModalHeader theme={theme}>
              <ModalTitle theme={theme}>🎨 Temas</ModalTitle>
              <ModalCloseButton theme={theme} onClick={() => setShowThemeModal(false)}>×</ModalCloseButton>
            </ModalHeader>
            <ModalContent theme={theme}>
              <p>Escolha o tema da interface:</p>
              <ThemeOption 
                theme={theme} 
                $active={!isDark}
                onClick={() => {
                  if (isDark) toggleTheme();
                  setShowThemeModal(false);
                }}
              >
                <span>☀️</span>
                <div>
                  <div style={{ fontWeight: '600' }}>Tema Claro</div>
                  <div style={{ fontSize: '14px', color: theme.text.secondary }}>Interface clara e vibrante</div>
                </div>
              </ThemeOption>
              <ThemeOption 
                theme={theme} 
                $active={isDark}
                onClick={() => {
                  if (!isDark) toggleTheme();
                  setShowThemeModal(false);
                }}
              >
                <span>🌙</span>
                <div>
                  <div style={{ fontWeight: '600' }}>Tema Escuro</div>
                  <div style={{ fontSize: '14px', color: theme.text.secondary }}>Interface escura e elegante</div>
                </div>
              </ThemeOption>
            </ModalContent>
          </ModalContainer>
        </ModalOverlay>
      )}
      
      {/* Modal de Estatísticas */}
      {showStatsModal && (
        <ModalOverlay onClick={() => setShowStatsModal(false)}>
          <ModalContainer theme={theme} onClick={(e) => e.stopPropagation()}>
            <ModalHeader theme={theme}>
              <ModalTitle theme={theme}>📊 Estatísticas</ModalTitle>
              <ModalCloseButton theme={theme} onClick={() => setShowStatsModal(false)}>×</ModalCloseButton>
            </ModalHeader>
            <ModalContent theme={theme}>
              {(() => {
                const stats = getStats();
                return (
                  <>
                    <StatCard theme={theme}>
                      <StatNumber theme={theme}>{stats.totalConversations}</StatNumber>
                      <StatLabel theme={theme}>Conversas Totais</StatLabel>
                    </StatCard>
                    <StatCard theme={theme}>
                      <StatNumber theme={theme}>{stats.totalMessages}</StatNumber>
                      <StatLabel theme={theme}>Mensagens Enviadas</StatLabel>
                    </StatCard>
                    <StatCard theme={theme}>
                      <StatNumber theme={theme}>{activeAgents.length}</StatNumber>
                      <StatLabel theme={theme}>Agentes Ativos</StatLabel>
                    </StatCard>
                    {stats.oldestConversation && (
                      <StatCard theme={theme}>
                        <StatNumber theme={theme} style={{ fontSize: '16px' }}>
                          {stats.oldestConversation.toLocaleDateString('pt-BR')}
                        </StatNumber>
                        <StatLabel theme={theme}>Primeira Conversa</StatLabel>
                      </StatCard>
                    )}
                  </>
                );
              })()}
            </ModalContent>
          </ModalContainer>
        </ModalOverlay>
      )}
      
      {/* Modal de Ajuda */}
      {showHelpModal && (
        <ModalOverlay onClick={() => setShowHelpModal(false)}>
          <ModalContainer theme={theme} onClick={(e) => e.stopPropagation()}>
            <ModalHeader theme={theme}>
              <ModalTitle theme={theme}>❓ Ajuda</ModalTitle>
              <ModalCloseButton theme={theme} onClick={() => setShowHelpModal(false)}>×</ModalCloseButton>
            </ModalHeader>
            <ModalContent theme={theme}>
              <h4>Como usar o Mangaba Assistente:</h4>
              <ul>
                <li><strong>💬 Chat:</strong> Digite suas mensagens na caixa de texto e pressione Enter ou clique no botão enviar.</li>
                <li><strong>🤖 Agentes:</strong> Acesse o Hub de Agentes para criar e gerenciar diferentes assistentes IA.</li>
                <li><strong>📝 Conversas:</strong> Suas conversas são salvas automaticamente no histórico.</li>
                <li><strong>✏️ Editar:</strong> Clique no ícone de lápis para renomear conversas.</li>
                <li><strong>🗑️ Deletar:</strong> Use o ícone de lixeira para remover conversas.</li>
                <li><strong>🎨 Temas:</strong> Alterne entre tema claro e escuro nas configurações.</li>
              </ul>
              <h4>Atalhos do Teclado:</h4>
              <ul>
                <li><strong>Enter:</strong> Enviar mensagem</li>
                <li><strong>Shift + Enter:</strong> Nova linha</li>
                <li><strong>Esc:</strong> Cancelar edição</li>
              </ul>
              <h4>Protocolos Suportados:</h4>
              <ul>
                <li><strong>Ollama:</strong> Modelos locais (llama2, codellama, mistral)</li>
                <li><strong>A2A:</strong> Comunicação entre agentes</li>
                <li><strong>MCP:</strong> Protocolo de contexto de modelo</li>
              </ul>
            </ModalContent>
          </ModalContainer>
        </ModalOverlay>
      )}
      
      {/* Modal de Feedback */}
      {showFeedbackModal && (
        <ModalOverlay onClick={() => setShowFeedbackModal(false)}>
          <ModalContainer theme={theme} onClick={(e) => e.stopPropagation()}>
            <ModalHeader theme={theme}>
              <ModalTitle theme={theme}>📝 Feedback</ModalTitle>
              <ModalCloseButton theme={theme} onClick={() => setShowFeedbackModal(false)}>×</ModalCloseButton>
            </ModalHeader>
            <ModalContent theme={theme}>
              <p>Sua opinião é muito importante para nós! Compartilhe suas sugestões, problemas encontrados ou elogios:</p>
              <FeedbackForm onSubmit={handleFeedbackSubmit}>
                <FeedbackTextarea
                  theme={theme}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Descreva sua experiência, sugestões de melhorias, bugs encontrados ou qualquer comentário..."
                  required
                />
                <FeedbackButton theme={theme} type="submit">
                  📤 Enviar Feedback
                </FeedbackButton>
              </FeedbackForm>
            </ModalContent>
          </ModalContainer>
        </ModalOverlay>
      )}
    </>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
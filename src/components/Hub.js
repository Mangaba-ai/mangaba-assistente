import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';
import AgentCreator from './AgentCreator';

const HubContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, ${props => props.theme.primary.orangeAccessible}10, ${props => props.theme.primary.yellow}10);
  overflow: hidden;
  transition: all 0.3s ease;
`;

const HubHeader = styled.div`
  background: ${props => props.theme.background.primary};
  border-bottom: 2px solid ${props => props.theme.primary.orangeAccessible};
  padding: 1.5rem 2rem;
  box-shadow: ${props => props.theme.shadow.medium};
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
`;

const BackButton = styled.button`
  background: ${props => props.theme.background.primary};
  color: ${props => props.theme.primary.orangeAccessible};
  border: 2px solid ${props => props.theme.primary.orangeAccessible};
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${props => props.theme.primary.orangeAccessible};
    color: ${props => props.theme.text.inverse};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadow.orange};
  }
`;

const HubTitle = styled.h1`
  color: ${props => props.theme.primary.orangeAccessible};
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.3s ease;
  
  &::before {
    content: '🤖';
    font-size: 1.8rem;
  }
`;

const HubSubtitle = styled.p`
  color: ${props => props.theme.text.secondary};
  margin: 0.5rem 0 0 0;
  font-size: 1rem;
  transition: color 0.3s ease;
`;

const HubContent = styled.div`
  flex: 1;
  display: flex;
  gap: 2rem;
  padding: 2rem;
  overflow: hidden;
`;

const AgentsList = styled.div`
  flex: 1;
  background: ${props => props.theme.background.primary};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: ${props => props.theme.shadow.large};
  overflow-y: auto;
  transition: all 0.3s ease;
`;

const AgentCard = styled.div`
  background: ${props => props.theme.background.secondary};
  border: 2px solid ${props => props.theme.primary.orangeAccessible}20;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${props => props.theme.primary.orangeAccessible};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadow.orange};
  }
  
  ${props => props.$isSelected && `
    border-color: ${props.theme.primary.orangeAccessible};
    background: ${props.theme.primary.orangeAccessible}10;
  `}
`;

const AgentName = styled.h3`
  color: ${props => props.theme.primary.orangeAccessible};
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  transition: color 0.3s ease;
`;

const AgentDescription = styled.p`
  color: ${props => props.theme.text.secondary};
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  line-height: 1.4;
  transition: color 0.3s ease;
`;

const AgentStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: ${props => props.theme.text.tertiary};
  transition: color 0.3s ease;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$active ? props.theme.status.success : props.theme.neutral.gray400};
  transition: background 0.3s ease;
`;

const AgentEditor = styled.div`
  flex: 1;
  background: ${props => props.theme.background.primary};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: ${props => props.theme.shadow.large};
  overflow-y: auto;
  transition: all 0.3s ease;
`;

const AgentActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.$variant === 'edit' ? `
    background: ${props.theme.primary.orangeAccessible};
    color: ${props.theme.text.inverse};
    border-color: ${props.theme.primary.orangeAccessible};
    
    &:hover {
      background: ${props.theme.primary.orangeAccessible}dd;
    }
  ` : props.$variant === 'delete' ? `
    background: ${props.theme.gradients.destructive};
    color: ${props.theme.text.inverse};
    border-color: transparent;
    
    &:hover {
      background: ${props.theme.gradients.critical};
      box-shadow: 0 2px 8px ${props.theme.primary.darkRed}40;
      transform: translateY(-1px);
    }
  ` : props.$variant === 'primary' ? `
    background: ${props.theme.gradients.confirmation};
    color: ${props.theme.text.inverse};
    border-color: transparent;
    
    &:hover {
      transform: translateY(-2px);
      background: ${props.theme.gradients.success};
      box-shadow: 0 4px 15px ${props.theme.primary.darkGreen}40;
    }
  ` : `
    background: ${props.theme.background.primary};
    color: ${props.theme.text.secondary};
    border-color: ${props.theme.border.light};
    
    &:hover {
      background: ${props.theme.background.secondary};
    }
  `}
`;

const AgentDetails = styled.div`
  margin-top: 2rem;
`;

const DetailSection = styled.div`
  margin-bottom: 1.5rem;
  
  h3 {
    color: ${props => props.theme.primary.orangeAccessible};
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    transition: color 0.3s ease;
  }
  
  p {
    color: ${props => props.theme.text.secondary};
    margin: 0.25rem 0;
    font-size: 0.9rem;
    transition: color 0.3s ease;
  }
`;

const SystemPromptBox = styled.div`
  background: ${props => props.theme.background.secondary};
  border: 1px solid ${props => props.theme.border.light};
  border-radius: 6px;
  padding: 1rem;
  margin-top: 0.5rem;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  line-height: 1.4;
  color: ${props => props.theme.text.primary};
  max-height: 150px;
  overflow-y: auto;
  transition: all 0.3s ease;
`;

const CreateAgentButton = styled.button`
  background: ${props => props.theme.gradients.notification};
  color: ${props => props.theme.text.inverse};
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
  width: 100%;
  
  &:hover {
    transform: translateY(-2px);
    background: ${props => props.theme.gradients.alert};
    box-shadow: 0 4px 15px ${props => props.theme.primary.yellow}40;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60%;
  color: ${props => props.theme.text.tertiary};
  text-align: center;
  transition: color 0.3s ease;
  
  &::before {
    content: '🤖';
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.8;
  }
`;

const Hub = ({ onNavigateToChat, onSelectAgent, onAgentsChange }) => {
  const { theme } = useTheme();
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // Carregar agentes pré-definidos e salvos
  useEffect(() => {
    const loadAgents = async () => {
      try {
        // Importar configurações de agentes
        const { AGENT_TEMPLATES } = await import('../config/AgentConfig.js');
        
        // Carregar agentes salvos do localStorage
        const savedAgents = JSON.parse(localStorage.getItem('mangaba_agents') || '[]');
        
        // Inicializar estado dos agentes template com apenas o Agente Geral ativo
        let templateStates = JSON.parse(localStorage.getItem('mangaba_template_states') || '{}');
        
        // Se é a primeira vez ou não há configurações, definir apenas Agente Geral como ativo
        if (Object.keys(templateStates).length === 0) {
          templateStates = {};
          Object.keys(AGENT_TEMPLATES).forEach(key => {
            const template = AGENT_TEMPLATES[key];
            const isGeneralAgent = key === 'general' || template.name === 'Agente Geral';
            templateStates[template.id || key] = isGeneralAgent;
          });
          localStorage.setItem('mangaba_template_states', JSON.stringify(templateStates));
        }
        
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
            parameters: {
              provider: template.parameters?.provider || 'OLLAMA',
              model: template.parameters?.model || 'llama2:latest',
              temperature: template.parameters?.temperature || 0.7,
              maxTokens: template.parameters?.maxTokens || 2048
            },
            systemPrompt: template.systemPrompt,
            createdAt: template.createdAt || new Date().toISOString(),
            isTemplate: true
          };
        });
        
        // Combinar agentes de template com agentes salvos
        const allAgents = [...templateAgents, ...savedAgents];
        setAgents(allAgents);
        
      } catch (error) {
        console.error('Erro ao carregar agentes:', error);
        // Fallback para agentes de exemplo
        const fallbackAgents = [
          {
            id: 'mangaba-ollama',
            name: 'Assistente Mangaba (Ollama)',
            description: 'Assistente de IA inteligente rodando localmente com Ollama',
            active: true,
            protocol: 'OLLAMA',
            parameters: {
              provider: 'OLLAMA',
              model: 'llama2:latest',
              temperature: 0.7,
              maxTokens: 2048
            },
            systemPrompt: 'Você é o Mangaba Assistente, um assistente de IA inteligente e prestativo.',
            isTemplate: true
          }
        ];
        setAgents(fallbackAgents);
      }
    };
    
    loadAgents();
  }, []);

  const handleCreateAgent = () => {
    setIsCreating(true);
    setSelectedAgent(null);
  };

  const handleSelectAgent = (agent) => {
    setSelectedAgent(agent);
    setIsCreating(false);
  };

  const handleUseAgent = (agent) => {
    onSelectAgent?.(agent);
  };

  const handleSaveAgent = (agentData) => {
    let updatedAgents;
    
    if (selectedAgent) {
      // Atualizar agente existente
      updatedAgents = agents.map(agent => 
        agent.id === selectedAgent.id ? { ...agentData, updatedAt: new Date().toISOString() } : agent
      );
    } else {
      // Criar novo agente
      const newAgent = {
        ...agentData,
        id: agentData.id || `agent-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isTemplate: false
      };
      updatedAgents = [...agents, newAgent];
    }
    
    setAgents(updatedAgents);
    
    // Salvar apenas agentes criados pelo usuário (não templates)
    const userAgents = updatedAgents.filter(agent => !agent.isTemplate);
    localStorage.setItem('mangaba_agents', JSON.stringify(userAgents));
    
    // Notificar mudança nos agentes
    if (onAgentsChange) {
      onAgentsChange();
    }
    
    setIsCreating(false);
    setSelectedAgent(updatedAgents.find(agent => agent.id === (agentData.id || selectedAgent?.id)));
  };

  const handleEditAgent = () => {
    setIsCreating(true);
  };

  const handleDeleteAgent = () => {
    if (selectedAgent && window.confirm(`Tem certeza que deseja excluir o agente "${selectedAgent.name}"?`)) {
      // Não permitir deletar agentes template
      if (selectedAgent.isTemplate) {
        alert('Agentes pré-definidos não podem ser excluídos. Você pode desativá-los se necessário.');
        return;
      }
      
      const updatedAgents = agents.filter(agent => agent.id !== selectedAgent.id);
      setAgents(updatedAgents);
      
      // Atualizar localStorage
      const userAgents = updatedAgents.filter(agent => !agent.isTemplate);
      localStorage.setItem('mangaba_agents', JSON.stringify(userAgents));
      
      // Notificar mudança nos agentes
      if (onAgentsChange) {
        onAgentsChange();
      }
      
      setSelectedAgent(null);
    }
  };

  const handleToggleAgent = () => {
    if (selectedAgent) {
      const updatedAgent = { 
        ...selectedAgent, 
        active: !selectedAgent.active,
        updatedAt: new Date().toISOString()
      };
      
      const updatedAgents = agents.map(agent => 
        agent.id === selectedAgent.id ? updatedAgent : agent
      );
      
      setAgents(updatedAgents);
      
      // Salvar no localStorage
      if (selectedAgent.isTemplate) {
        // Salvar estado dos agentes template separadamente
        const templateStates = JSON.parse(localStorage.getItem('mangaba_template_states') || '{}');
        templateStates[selectedAgent.id] = updatedAgent.active;
        localStorage.setItem('mangaba_template_states', JSON.stringify(templateStates));
      } else {
        // Salvar agentes criados pelo usuário
        const userAgents = updatedAgents.filter(agent => !agent.isTemplate);
        localStorage.setItem('mangaba_agents', JSON.stringify(userAgents));
      }
      
      // Notificar mudança nos agentes
      if (onAgentsChange) {
        onAgentsChange();
      }
      
      setSelectedAgent(updatedAgent);
    }
  };

  const handleCancelEdit = () => {
    setIsCreating(false);
  };

  return (
    <HubContainer theme={theme}>
      <HubHeader theme={theme}>
        <HeaderLeft>
          <HubTitle theme={theme}>Hub de Agentes</HubTitle>
          <HubSubtitle theme={theme}>
            Crie e gerencie seus agentes personalizados com protocolos A2A e MCP
          </HubSubtitle>
        </HeaderLeft>
        
        <BackButton onClick={onNavigateToChat} theme={theme}>
          ← Voltar ao Chat
        </BackButton>
      </HubHeader>
      
      <HubContent>
        <AgentsList theme={theme}>
          <CreateAgentButton onClick={handleCreateAgent} theme={theme}>
            + Criar Novo Agente
          </CreateAgentButton>
          
          {agents.length === 0 ? (
            <EmptyState theme={theme}>
              <h2>Nenhum agente criado ainda</h2>
              <p>Clique em "Criar Novo Agente" para começar</p>
            </EmptyState>
          ) : (
            agents.map(agent => (
              <AgentCard
                key={agent.id}
                $isSelected={selectedAgent?.id === agent.id}
                onClick={() => handleSelectAgent(agent)}
                theme={theme}
              >
                <AgentName theme={theme}>{agent.name}</AgentName>
                <AgentDescription theme={theme}>{agent.description}</AgentDescription>
                <AgentStatus theme={theme}>
                  <StatusDot $active={agent.active} theme={theme} />
                  {agent.active ? 'Ativo' : 'Inativo'} • {agent.protocol}
                </AgentStatus>
              </AgentCard>
            ))
          )}
        </AgentsList>
        
        <AgentEditor theme={theme}>
          {isCreating ? (
            <div>
              <h2 style={{ color: theme.primary.orangeAccessible, marginTop: 0 }}>
                {selectedAgent ? 'Editar Agente' : 'Criar Novo Agente'}
              </h2>
              <AgentCreator
                initialData={selectedAgent}
                onSave={handleSaveAgent}
                onCancel={handleCancelEdit}
              />
            </div>
          ) : selectedAgent ? (
            <div>
              <h2 style={{ color: theme.primary.orangeAccessible, marginTop: 0 }}>
                {selectedAgent.name}
              </h2>
              <p style={{ color: theme.text.secondary }}>
                {selectedAgent.description}
              </p>
              
              <AgentActions>
                <ActionButton $variant="edit" onClick={handleEditAgent} theme={theme}>
                  ✏️ Editar
                </ActionButton>
                <ActionButton $variant="toggle" onClick={handleToggleAgent} theme={theme}>
                  {selectedAgent.active ? '⏸️ Desativar' : '▶️ Ativar'}
                </ActionButton>
                <ActionButton $variant="delete" onClick={handleDeleteAgent} theme={theme}>
                   🗑️ Excluir
                 </ActionButton>
                 <ActionButton $variant="primary" onClick={() => handleUseAgent(selectedAgent)} theme={theme}>
                   ✅ Usar Agente
                 </ActionButton>
               </AgentActions>
              
              <AgentDetails>
                <DetailSection theme={theme}>
                  <h3>Configurações do Modelo</h3>
                  <p><strong>Protocolo:</strong> {selectedAgent.protocol}</p>
                  <p><strong>Modelo:</strong> {selectedAgent.parameters.model}</p>
                  <p><strong>Temperatura:</strong> {selectedAgent.parameters.temperature}</p>
                  <p><strong>Máximo de Tokens:</strong> {selectedAgent.parameters.maxTokens}</p>
                </DetailSection>
                
                {selectedAgent.systemPrompt && (
                  <DetailSection theme={theme}>
                    <h3>Prompt do Sistema</h3>
                    <SystemPromptBox theme={theme}>
                      {selectedAgent.systemPrompt}
                    </SystemPromptBox>
                  </DetailSection>
                )}
                
                <DetailSection theme={theme}>
                  <h3>Informações</h3>
                  <p><strong>Status:</strong> {selectedAgent.active ? 'Ativo' : 'Inativo'}</p>
                  <p><strong>Criado em:</strong> {selectedAgent.createdAt ? new Date(selectedAgent.createdAt).toLocaleDateString('pt-BR') : 'N/A'}</p>
                  <p><strong>Última atualização:</strong> {selectedAgent.updatedAt ? new Date(selectedAgent.updatedAt).toLocaleDateString('pt-BR') : 'N/A'}</p>
                </DetailSection>
              </AgentDetails>
            </div>
          ) : (
            <EmptyState theme={theme}>
              <h2>Selecione um agente</h2>
              <p>Escolha um agente da lista para visualizar detalhes ou criar um novo</p>
            </EmptyState>
          )}
        </AgentEditor>
      </HubContent>
    </HubContainer>
  );
};

export default Hub;
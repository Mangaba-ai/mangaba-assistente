import React, { useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';
import ProtocolManager from './ProtocolManager';

const CreatorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-height: 100%;
  overflow-y: auto;
`;

const Section = styled.div`
  background: ${props => props.theme.background.secondary};
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid ${props => props.theme.border.light};
  transition: all 0.3s ease;
`;

const SectionTitle = styled.h3`
  color: ${props => props.theme.primary.orangeAccessible};
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.3s ease;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  color: ${props => props.theme.text.secondary};
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  transition: color 0.3s ease;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid ${props => props.theme.border.light};
  border-radius: 6px;
  font-size: 0.9rem;
  background: ${props => props.theme.background.primary};
  color: ${props => props.theme.text.primary};
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary.orangeAccessible};
  }
  
  &::placeholder {
    color: ${props => props.theme.text.muted};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid ${props => props.theme.border.light};
  border-radius: 6px;
  font-size: 0.9rem;
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
  background: ${props => props.theme.background.primary};
  color: ${props => props.theme.text.primary};
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary.orangeAccessible};
  }
  
  &::placeholder {
    color: ${props => props.theme.text.muted};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid ${props => props.theme.border.light};
  border-radius: 6px;
  font-size: 0.9rem;
  background: ${props => props.theme.background.primary};
  color: ${props => props.theme.text.primary};
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary.orangeAccessible};
  }
`;

const ProtocolCard = styled.div`
  border: 2px solid ${props => props.$selected ? props.theme.primary.orangeAccessible : props.theme.border.light};
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.$selected ? '#FFF4E6' : props.theme.background.primary};
  
  &:hover {
    border-color: ${props => props.theme.primary.orangeAccessible};
  }
`;

const ProtocolTitle = styled.h4`
  color: ${props => props.theme.primary.orangeAccessible};
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
`;

const ProtocolDescription = styled.p`
  color: ${props => props.theme.text.secondary};
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.4;
`;

const ProtocolGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const ParameterGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${props => props.theme.border.light};
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  
  ${props => props.$variant === 'primary' ? `
    background: ${props.theme.gradients.confirmation};
    color: ${props.theme.text.inverse};
    box-shadow: 0 2px 8px ${props.theme.primary.darkGreen}30;
    
    &:hover {
      transform: translateY(-2px);
      background: ${props.theme.gradients.success};
      box-shadow: 0 4px 15px ${props.theme.primary.darkGreen}40;
    }
  ` : props.$variant === 'danger' ? `
    background: ${props.theme.gradients.destructive};
    color: ${props.theme.text.inverse};
    box-shadow: 0 2px 8px ${props.theme.primary.darkRed}30;
    
    &:hover {
      transform: translateY(-2px);
      background: ${props.theme.gradients.critical};
      box-shadow: 0 4px 15px ${props.theme.primary.darkRed}40;
    }
  ` : `
    background: ${props.theme.background.primary};
    color: ${props.theme.text.secondary};
    border-color: ${props.theme.border.light};
    
    &:hover {
      background: ${props.theme.background.secondary};
      border-color: ${props.theme.border.medium};
    }
  `}
`;

const AgentCreator = ({ onSave, onCancel, initialData = null }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    protocol: initialData?.protocol || 'MCP',
    model: initialData?.parameters?.model || 'llama2:latest',
    temperature: initialData?.parameters?.temperature || 0.7,
    maxTokens: initialData?.parameters?.maxTokens || 2048,
    systemPrompt: initialData?.systemPrompt || '',
    capabilities: initialData?.capabilities || [],
    active: initialData?.active || true,
    protocolConfig: initialData?.protocolConfig || {
      A2A: {
        endpoint: 'https://api.example.com/a2a',
        apiKey: '',
        agentId: '',
        timeout: 30,
        retryAttempts: 3,
        capabilities: ['chat', 'analysis']
      },
      MCP: {
        serverUrl: 'ws://localhost:8080/mcp',
        clientId: '',
        contextWindow: 4096,
        tools: ['web_search', 'code_analysis'],
        resources: ['documents'],
        maxConnections: 5
      }
    }
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProtocolConfigChange = (protocol, config) => {
    setFormData(prev => ({
      ...prev,
      protocolConfig: {
        ...prev.protocolConfig,
        [protocol]: config
      }
    }));
  };

  const handleProtocolSelect = (protocol) => {
    setFormData(prev => ({
      ...prev,
      protocol
    }));
  };

  const handleSave = () => {
    const agentData = {
      id: initialData?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      protocol: formData.protocol,
      active: formData.active,
      systemPrompt: formData.systemPrompt,
      capabilities: formData.capabilities,
      parameters: {
        model: formData.model,
        temperature: parseFloat(formData.temperature),
        maxTokens: parseInt(formData.maxTokens)
      },
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    onSave(agentData);
  };

  return (
    <CreatorContainer>
      <Section theme={theme}>
        <SectionTitle theme={theme}>ℹ️ Informações Básicas</SectionTitle>
        <FormGroup>
          <Label theme={theme}>Nome do Agente</Label>
          <Input
            theme={theme}
            type="text"
            placeholder="Ex: Assistente Médico, Tutor de Programação..."
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <Label theme={theme}>Descrição</Label>
          <TextArea
            theme={theme}
            placeholder="Descreva o propósito e especialidade do seu agente..."
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
          />
        </FormGroup>
      </Section>

      <Section theme={theme}>
        <SectionTitle theme={theme}>🔗 Protocolo de Comunicação</SectionTitle>
        <ProtocolGrid>
          <ProtocolCard
            theme={theme}
            $selected={formData.protocol === 'A2A'}
            onClick={() => handleProtocolSelect('A2A')}
          >
            <ProtocolTitle theme={theme}>A2A (Agent-to-Agent)</ProtocolTitle>
            <ProtocolDescription theme={theme}>
              Protocolo para comunicação direta entre agentes de IA.
              Permite colaboração e delegação de tarefas entre múltiplos agentes.
            </ProtocolDescription>
          </ProtocolCard>
          
          <ProtocolCard
            theme={theme}
            $selected={formData.protocol === 'MCP'}
            onClick={() => handleProtocolSelect('MCP')}
          >
            <ProtocolTitle theme={theme}>MCP (Model Context Protocol)</ProtocolTitle>
            <ProtocolDescription theme={theme}>
              Protocolo para contexto e ferramentas de modelo de linguagem.
              Ideal para agentes que precisam de controle fino sobre o contexto.
            </ProtocolDescription>
          </ProtocolCard>
        </ProtocolGrid>
      </Section>

      <Section theme={theme}>
        <SectionTitle theme={theme}>🔗 Configuração do Protocolo</SectionTitle>
        <ProtocolManager 
          protocol={formData.protocol}
          config={formData.protocolConfig[formData.protocol]}
          onConfigChange={(config) => handleProtocolConfigChange(formData.protocol, config)}
        />
      </Section>

      <Section theme={theme}>
        <SectionTitle theme={theme}>⚙️ Parâmetros do Modelo</SectionTitle>
        <ParameterGrid>
          <FormGroup>
            <Label theme={theme}>Modelo</Label>
            <Select
              theme={theme}
              value={formData.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
            >
              <optgroup label="Ollama (Local)">
                <option value="llama2:latest">Llama 2 (Recomendado)</option>
                <option value="codellama">Code Llama</option>
                <option value="mistral">Mistral</option>
                <option value="neural-chat">Neural Chat</option>
                <option value="starcode">StarCode</option>
              </optgroup>
              <optgroup label="OpenAI">
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </optgroup>
              <optgroup label="Anthropic">
                <option value="claude-3">Claude 3</option>
              </optgroup>
              <optgroup label="Google">
                <option value="gemini-pro">Gemini Pro</option>
              </optgroup>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label theme={theme}>Temperatura ({formData.temperature})</Label>
            <Input
              theme={theme}
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={formData.temperature}
              onChange={(e) => handleInputChange('temperature', e.target.value)}
            />
          </FormGroup>
          
          <FormGroup>
            <Label theme={theme}>Máximo de Tokens</Label>
            <Input
              theme={theme}
              type="number"
              min="256"
              max="8192"
              step="256"
              value={formData.maxTokens}
              onChange={(e) => handleInputChange('maxTokens', e.target.value)}
            />
          </FormGroup>
        </ParameterGrid>
      </Section>

      <Section theme={theme}>
        <SectionTitle theme={theme}>📝 Prompt do Sistema</SectionTitle>
        <FormGroup>
          <Label theme={theme}>Instruções para o Agente</Label>
          <TextArea
            theme={theme}
            placeholder="Defina o comportamento, personalidade e instruções específicas para seu agente..."
            value={formData.systemPrompt}
            onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
            style={{ minHeight: '120px' }}
          />
        </FormGroup>
      </Section>

      <ButtonGroup theme={theme}>
        <Button theme={theme} $variant="danger" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          theme={theme}
          $variant="primary" 
          onClick={handleSave}
          disabled={!formData.name.trim() || !formData.description.trim()}
        >
          {initialData ? 'Atualizar Agente' : 'Criar Agente'}
        </Button>
      </ButtonGroup>
    </CreatorContainer>
  );
};

export default AgentCreator;
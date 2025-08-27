import React, { useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';
import useProtocol from '../hooks/useProtocol';

const ProtocolContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ProtocolHeader = styled.div`
  background: ${props => props.theme.background.primary};
  border: 2px solid ${props => props.theme.primary.orangeAccessible};
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.3s ease;
`;

const ProtocolTitle = styled.h4`
  color: ${props => props.theme.primary.orangeAccessible};
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
`;

const ProtocolDescription = styled.p`
  color: ${props => props.theme.text.secondary};
  margin: 0;
  line-height: 1.5;
  transition: all 0.3s ease;
`;

const ConfigSection = styled.div`
  background: ${props => props.theme.background.secondary};
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid ${props => props.theme.border.light};
  transition: all 0.3s ease;
`;

const SectionTitle = styled.h5`
  color: ${props => props.theme.primary.orangeAccessible};
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s ease;
`;

const ConfigGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`;

const ConfigItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: ${props => props.theme.text.secondary};
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.3s ease;
`;

const Input = styled.input`
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

const Select = styled.select`
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

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 2px solid ${props => props.theme.border.light};
  border-radius: 6px;
  font-size: 0.9rem;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  background: ${props => props.theme.background.primary};
  color: ${props => props.theme.text.primary};
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary.orangeAccessible};
  }
`;

const ToggleSwitch = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.theme.text.primary};
  transition: all 0.3s ease;
  
  input[type="checkbox"] {
    width: 40px;
    height: 20px;
    appearance: none;
    background: ${props => props.theme.border.light};
    border-radius: 10px;
    position: relative;
    cursor: pointer;
    transition: background 0.3s ease;
    
    &:checked {
      background: ${props => props.theme.primary.orangeAccessible};
    }
    
    &::before {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: ${props => props.theme.background.primary};
      top: 2px;
      left: 2px;
      transition: transform 0.3s ease;
    }
    
    &:checked::before {
      transform: translateX(20px);
    }
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  
  ${props => props.$status === 'connected' ? `
    background: ${props.theme.gradients.success};
    color: ${props.theme.text.inverse};
    border: 1px solid ${props.theme.primary.darkGreen};
    box-shadow: 0 2px 8px ${props.theme.primary.darkGreen}30;
  ` : props.$status === 'connecting' ? `
    background: ${props.theme.gradients.warning};
    color: ${props.theme.text.inverse};
    border: 1px solid ${props.theme.primary.yellow};
    box-shadow: 0 2px 8px ${props.theme.primary.yellow}30;
  ` : `
    background: ${props.theme.gradients.critical};
    color: ${props.theme.text.inverse};
    border: 1px solid ${props.theme.primary.darkRed};
    box-shadow: 0 2px 8px ${props.theme.primary.darkRed}30;
  `}
`;

const ActionButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.$variant === 'primary' ? `
    background: ${props.theme.gradients.confirmation};
    color: ${props.theme.text.inverse};
    
    &:hover {
      transform: translateY(-2px);
      background: ${props.theme.gradients.success};
      box-shadow: 0 4px 15px ${props.theme.primary.darkGreen}40;
    }
  ` : props.$variant === 'danger' ? `
    background: ${props.theme.gradients.destructive};
    color: ${props.theme.text.inverse};
    
    &:hover {
      transform: translateY(-2px);
      background: ${props.theme.gradients.critical};
      box-shadow: 0 4px 15px ${props.theme.primary.darkRed}40;
    }
  ` : props.$variant === 'warning' ? `
    background: ${props.theme.gradients.caution};
    color: ${props.theme.text.inverse};
    
    &:hover {
      transform: translateY(-2px);
      background: ${props.theme.gradients.alert};
      box-shadow: 0 4px 15px ${props.theme.primary.yellow}40;
    }
  ` : `
    background: ${props.theme.background.secondary};
    color: ${props.theme.text.secondary};
    border: 1px solid ${props.theme.border.medium};
    
    &:hover {
      background: ${props.theme.background.hover};
    }
  `}
`;

const ProtocolManager = ({ protocol, config, onConfigChange }) => {
  const { theme } = useTheme();
  const {
    connections,
    isConnecting,
    error,
    messages,
    connectA2A,
    connectMCP,
    sendA2AMessage,
    sendMCPPrompt,
    disconnect,
    clearError
  } = useProtocol();
  
  const [localConfig, setLocalConfig] = useState(config || {});
  const [testMessage, setTestMessage] = useState('');
  const [testPrompt, setTestPrompt] = useState('');

  const handleConfigChange = (key, value) => {
    const newConfig = { ...localConfig, [key]: value };
    setLocalConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const handleTestConnection = async () => {
    try {
      if (protocol === 'MCP') {
        await connectMCP(localConfig);
      } else {
        await connectA2A(localConfig);
      }
    } catch (error) {
      console.error('Erro ao conectar:', error);
    }
  };
  
  const handleTestMessage = async () => {
    if (protocol === 'A2A' && testMessage.trim()) {
      const connection = connections.find(conn => conn.type === 'A2A');
      if (connection) {
        try {
          await sendA2AMessage(connection.id, testMessage, 'target-agent-id');
          setTestMessage('');
        } catch (error) {
          console.error('Erro ao enviar mensagem A2A:', error);
        }
      }
    } else if (protocol === 'MCP' && testPrompt.trim()) {
      const connection = connections.find(conn => conn.type === 'MCP');
      if (connection) {
        try {
          await sendMCPPrompt(connection.id, testPrompt, { source: 'test' });
          setTestPrompt('');
        } catch (error) {
          console.error('Erro ao enviar prompt MCP:', error);
        }
      }
    }
  };
  
  const getConnectionByType = (type) => {
    return connections.find(conn => conn.type === type);
  };
  
  const currentConnection = getConnectionByType(protocol);
  const connectionStatus = currentConnection?.status || 'disconnected';

  const renderMCPConfig = () => (
    <>
      <ProtocolHeader theme={theme}>
        <ProtocolTitle theme={theme}>🔗 MCP (Model Context Protocol)</ProtocolTitle>
        <ProtocolDescription theme={theme}>
          Configurações para comunicação direta com modelos de linguagem.
          O MCP permite controle fino sobre o contexto e parâmetros do modelo.
        </ProtocolDescription>
      </ProtocolHeader>

      <ConfigSection theme={theme}>
        <SectionTitle theme={theme}>Configurações de Conexão</SectionTitle>
        <ConfigGrid>
          <ConfigItem>
            <Label theme={theme}>Endpoint da API</Label>
            <Input
              theme={theme}
              type="url"
              placeholder="https://api.openai.com/v1"
              value={localConfig.endpoint || ''}
              onChange={(e) => handleConfigChange('endpoint', e.target.value)}
            />
          </ConfigItem>
          
          <ConfigItem>
            <Label theme={theme}>Chave da API</Label>
            <Input
              theme={theme}
              type="password"
              placeholder="sk-..."
              value={localConfig.apiKey || ''}
              onChange={(e) => handleConfigChange('apiKey', e.target.value)}
            />
          </ConfigItem>
          
          <ConfigItem>
            <Label theme={theme}>Timeout (segundos)</Label>
            <Input
              theme={theme}
              type="number"
              min="5"
              max="300"
              value={localConfig.timeout || 30}
              onChange={(e) => handleConfigChange('timeout', parseInt(e.target.value))}
            />
          </ConfigItem>
          
          <ConfigItem>
            <Label theme={theme}>Retry Attempts</Label>
            <Input
              theme={theme}
              type="number"
              min="0"
              max="10"
              value={localConfig.retryAttempts || 3}
              onChange={(e) => handleConfigChange('retryAttempts', parseInt(e.target.value))}
            />
          </ConfigItem>
        </ConfigGrid>
      </ConfigSection>

      <ConfigSection theme={theme}>
        <SectionTitle theme={theme}>Configurações Avançadas</SectionTitle>
        <ConfigGrid>
          <ConfigItem>
            <Label theme={theme}>Streaming</Label>
            <ToggleSwitch theme={theme}>
              <input
                type="checkbox"
                checked={localConfig.streaming || false}
                onChange={(e) => handleConfigChange('streaming', e.target.checked)}
              />
              <span>Habilitar streaming de respostas</span>
            </ToggleSwitch>
          </ConfigItem>
          
          <ConfigItem>
            <Label theme={theme}>Context Window</Label>
            <Select
              theme={theme}
              value={localConfig.contextWindow || '4096'}
              onChange={(e) => handleConfigChange('contextWindow', e.target.value)}
            >
              <option value="2048">2K tokens</option>
              <option value="4096">4K tokens</option>
              <option value="8192">8K tokens</option>
              <option value="16384">16K tokens</option>
              <option value="32768">32K tokens</option>
            </Select>
          </ConfigItem>
        </ConfigGrid>
        
        <ConfigItem style={{ marginTop: '1rem' }}>
          <Label theme={theme}>Headers Customizados (JSON)</Label>
          <TextArea
            theme={theme}
            placeholder='{"Authorization": "Bearer token", "Custom-Header": "value"}'
            value={localConfig.customHeaders || ''}
            onChange={(e) => handleConfigChange('customHeaders', e.target.value)}
          />
        </ConfigItem>
      </ConfigSection>
    </>
  );

  const renderA2AConfig = () => (
    <>
      <ProtocolHeader theme={theme}>
        <ProtocolTitle theme={theme}>🤝 A2A (Agent-to-Agent)</ProtocolTitle>
        <ProtocolDescription theme={theme}>
          Configurações para comunicação entre agentes.
          Permite colaboração e delegação de tarefas entre múltiplos agentes.
        </ProtocolDescription>
      </ProtocolHeader>

      <ConfigSection theme={theme}>
        <SectionTitle theme={theme}>Configurações de Rede</SectionTitle>
        <ConfigGrid>
          <ConfigItem>
            <Label theme={theme}>Broker URL</Label>
            <Input
              theme={theme}
              type="url"
              placeholder="ws://localhost:8080/agents"
              value={localConfig.brokerUrl || ''}
              onChange={(e) => handleConfigChange('brokerUrl', e.target.value)}
            />
          </ConfigItem>
          
          <ConfigItem>
            <Label theme={theme}>Agent ID</Label>
            <Input
              theme={theme}
              type="text"
              placeholder="agent-unique-id"
              value={localConfig.agentId || ''}
              onChange={(e) => handleConfigChange('agentId', e.target.value)}
            />
          </ConfigItem>
          
          <ConfigItem>
            <Label theme={theme}>Namespace</Label>
            <Input
              theme={theme}
              type="text"
              placeholder="default"
              value={localConfig.namespace || 'default'}
              onChange={(e) => handleConfigChange('namespace', e.target.value)}
            />
          </ConfigItem>
          
          <ConfigItem>
            <Label theme={theme}>Heartbeat Interval (ms)</Label>
            <Input
              theme={theme}
              type="number"
              min="1000"
              max="60000"
              value={localConfig.heartbeatInterval || 5000}
              onChange={(e) => handleConfigChange('heartbeatInterval', parseInt(e.target.value))}
            />
          </ConfigItem>
        </ConfigGrid>
      </ConfigSection>

      <ConfigSection theme={theme}>
        <SectionTitle theme={theme}>Configurações de Colaboração</SectionTitle>
        <ConfigGrid>
          <ConfigItem>
            <Label theme={theme}>Descoberta Automática</Label>
            <ToggleSwitch theme={theme}>
              <input
                type="checkbox"
                checked={localConfig.autoDiscovery || true}
                onChange={(e) => handleConfigChange('autoDiscovery', e.target.checked)}
              />
              <span>Descobrir outros agentes automaticamente</span>
            </ToggleSwitch>
          </ConfigItem>
          
          <ConfigItem>
            <Label theme={theme}>Delegação de Tarefas</Label>
            <ToggleSwitch theme={theme}>
              <input
                type="checkbox"
                checked={localConfig.taskDelegation || true}
                onChange={(e) => handleConfigChange('taskDelegation', e.target.checked)}
              />
              <span>Permitir delegação de tarefas</span>
            </ToggleSwitch>
          </ConfigItem>
          
          <ConfigItem>
            <Label theme={theme}>Prioridade do Agente</Label>
            <Select
              theme={theme}
              value={localConfig.priority || 'medium'}
              onChange={(e) => handleConfigChange('priority', e.target.value)}
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </Select>
          </ConfigItem>
        </ConfigGrid>
        
        <ConfigItem style={{ marginTop: '1rem' }}>
          <Label theme={theme}>Capacidades do Agente</Label>
          <TextArea
            theme={theme}
            placeholder="Descreva as capacidades e especialidades deste agente..."
            value={localConfig.capabilities || ''}
            onChange={(e) => handleConfigChange('capabilities', e.target.value)}
          />
        </ConfigItem>
      </ConfigSection>
    </>
  );

  return (
    <ProtocolContainer theme={theme}>
      {protocol === 'MCP' ? renderMCPConfig() : renderA2AConfig()}
      
      <ConfigSection theme={theme}>
        <SectionTitle theme={theme}>Status da Conexão</SectionTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <StatusIndicator theme={theme} $status={connectionStatus}>
            {connectionStatus === 'connected' && '✅ Conectado'}
            {connectionStatus === 'connecting' && '🔄 Conectando...'}
            {connectionStatus === 'disconnected' && '❌ Desconectado'}
            {connectionStatus === 'error' && '❌ Erro de Conexão'}
          </StatusIndicator>
          
          {!currentConnection ? (
            <ActionButton theme={theme} $variant="primary" onClick={handleTestConnection} disabled={isConnecting}>
              {isConnecting ? 'Conectando...' : 'Conectar'}
            </ActionButton>
          ) : (
            <ActionButton 
              theme={theme}
              onClick={() => disconnect(currentConnection.id)}
            >
              Desconectar
            </ActionButton>
          )}
        </div>
        
        {/* Seção de Teste */}
        {currentConnection && (
          <div style={{ marginTop: '1rem' }}>
            <Label theme={theme}>Teste de {protocol}:</Label>
            {protocol === 'A2A' ? (
              <>
                <Input
                  theme={theme}
                  type="text"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Digite uma mensagem para teste A2A"
                  style={{ marginBottom: '0.5rem' }}
                />
                <ActionButton theme={theme} onClick={handleTestMessage} disabled={!testMessage.trim()}>
                  Enviar Mensagem A2A
                </ActionButton>
              </>
            ) : (
              <>
                <TextArea
                  theme={theme}
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  placeholder="Digite um prompt para teste MCP"
                  style={{ marginBottom: '0.5rem' }}
                />
                <ActionButton theme={theme} onClick={handleTestMessage} disabled={!testPrompt.trim()}>
                  Enviar Prompt MCP
                </ActionButton>
              </>
            )}
          </div>
        )}
        
        {/* Mensagens Recebidas */}
        {messages.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <Label theme={theme}>Mensagens Recebidas:</Label>
            <div style={{ 
              maxHeight: '150px', 
              overflowY: 'auto', 
              border: `1px solid ${theme.border.light}`, 
              borderRadius: '6px',
              padding: '0.5rem',
              marginTop: '0.5rem'
            }}>
              {messages.slice(-3).map((message, index) => (
                <div key={index} style={{ 
                  padding: '0.5rem', 
                  margin: '0.25rem 0', 
                  background: theme.background.secondary, 
                  borderRadius: '4px',
                  fontSize: '0.85rem'
                }}>
                  <strong>[{message.type}]</strong> {message.content}
                  <div style={{ fontSize: '0.75rem', color: theme.text.secondary }}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Erro */}
        {error && (
          <div style={{ 
            padding: '1rem', 
            background: '#FEF2F2', 
            border: `1px solid ${theme.status.error}`, 
            borderRadius: '8px', 
            color: '#B91C1C',
            marginTop: '1rem'
          }}>
            <strong>Erro:</strong> {error}
            <ActionButton 
              theme={theme}
              onClick={clearError} 
              style={{ marginLeft: '1rem', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
            >
              Fechar
            </ActionButton>
          </div>
        )}
      </ConfigSection>
    </ProtocolContainer>
  );
};

export default ProtocolManager;
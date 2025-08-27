import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';
import { CopyButton, MessageBubbleWithCopy } from './CopyButton';

// Função para formatar texto com markdown básico
const formatText = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  // Converter quebras de linha
  let formatted = text.replace(/\n/g, '<br>');
  
  // Converter **texto** para negrito
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Converter *texto* para itálico
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Converter `código` para código inline
  formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Converter ```código``` para bloco de código
  formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  
  // Converter links [texto](url)
  formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  
  return formatted;
};

const MessageContainer = styled.div`
  display: flex;
  justify-content: ${props => props.$isBot ? 'flex-start' : 'flex-end'};
  margin-bottom: 16px;
  animation: fadeIn 0.3s ease-in;
  
  ${props => props.$isSystem && `
    justify-content: center;
    margin-bottom: 1rem;
  `}
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const SystemMessage = styled.div`
  background: ${props => props.theme.primary.orangeAccessible}15;
  border: 1px solid ${props => props.theme.primary.orangeAccessible}30;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  color: ${props => props.theme.primary.orangeAccessible};
  font-size: 0.85rem;
  font-weight: 500;
  text-align: center;
  max-width: 80%;
  transition: all 0.3s ease;
`;

const AgentBadge = styled.div`
  background: ${props => props.theme.primary.orangeAccessible};
  color: ${props => props.theme.text.inverse};
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  display: inline-block;
  transition: all 0.3s ease;
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;
  word-wrap: break-word;
  transition: all 0.3s ease;
  
  ${props => props.$isBot ? `
    background: ${props.theme.background.primary};
    color: ${props.theme.text.primary};
    border: 1px solid ${props.theme.border.light};
    border-bottom-left-radius: 4px;
    box-shadow: ${props.theme.shadow.small};
    padding-top: ${props.$showCopy ? '32px' : '12px'};
  ` : `
    background: ${props.theme.gradients.primary};
    color: ${props.theme.text.inverse};
    border-bottom-right-radius: 4px;
    box-shadow: ${props.theme.shadow.medium};
  `}
  
  ${props => props.$isLoading && `
    background: ${props.theme.background.secondary};
    color: ${props.theme.text.secondary};
  `}
`;



const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  margin-right: 8px;
  transition: all 0.3s ease;
  
  ${props => props.$isBot ? `
    background: ${props.theme.gradients.primary};
    color: ${props.theme.text.inverse};
  ` : `
    background: ${props.theme.neutral.darkGray};
    color: ${props.theme.text.inverse};
  `}
`;

const MessageContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

const MessageText = styled.div`
  margin: 0;
  line-height: 1.4;
  font-size: 14px;
  transition: all 0.3s ease;
  white-space: pre-wrap;
  word-wrap: break-word;
  
  /* Estilos para elementos formatados */
  strong {
    font-weight: 600;
    color: ${props => props.$isBot ? props.theme.primary.orangeAccessible : 'inherit'};
  }
  
  em {
    font-style: italic;
    opacity: 0.9;
  }
  
  code {
    background: ${props => props.$isBot ? props.theme.background.secondary : 'rgba(255,255,255,0.2)'};
    color: ${props => props.$isBot ? props.theme.text.primary : 'inherit'};
    padding: 2px 4px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 13px;
  }
  
  pre {
    background: ${props => props.$isBot ? props.theme.background.secondary : 'rgba(255,255,255,0.1)'};
    border: 1px solid ${props => props.$isBot ? props.theme.border.light : 'rgba(255,255,255,0.2)'};
    border-radius: 8px;
    padding: 12px;
    margin: 8px 0;
    overflow-x: auto;
    
    code {
      background: none;
      padding: 0;
      border-radius: 0;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.4;
    }
  }
  
  a {
    color: ${props => props.$isBot ? props.theme.primary.orangeAccessible : props.theme.text.inverse};
    text-decoration: underline;
    
    &:hover {
      opacity: 0.8;
    }
  }
  
  ${props => props.$isLoading && `
    &::after {
      content: '';
      display: inline-block;
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: ${props.theme.text.secondary};
      margin-left: 4px;
      animation: typing 1.4s infinite;
    }
    
    @keyframes typing {
      0%, 60%, 100% {
        transform: translateY(0);
      }
      30% {
        transform: translateY(-10px);
      }
    }
  `}
`;

const Timestamp = styled.span`
  font-size: 11px;
  opacity: 0.8;
  margin-top: 4px;
  display: block;
`;

const LoadingDots = styled.div`
  display: inline-flex;
  gap: 2px;
  
  span {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: ${props => props.theme.text.secondary};
    animation: bounce 1.4s infinite;
    
    &:nth-child(1) { animation-delay: 0s; }
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
  
  @keyframes bounce {
    0%, 60%, 100% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-8px);
    }
  }
`;

function ChatMessage({ message, isBot, timestamp, isLoading, isSystem, agent }) {
  const { theme } = useTheme();
  
  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Renderizar mensagem do sistema
  if (isSystem) {
    return (
      <MessageContainer $isSystem>
        <SystemMessage theme={theme}>
          {message}
        </SystemMessage>
      </MessageContainer>
    );
  }

  return (
    <MessageContainer $isBot={isBot}>
      <MessageContent>
        {isBot && (
          <Avatar $isBot={isBot} theme={theme}>
            🥭
          </Avatar>
        )}
        <div>
          {isBot && agent && (
            <AgentBadge theme={theme}>
              {agent.name} • {agent.protocol}
            </AgentBadge>
          )}
          {isBot && !isLoading ? (
            <MessageBubbleWithCopy>
              <MessageBubble $isBot={isBot} $isLoading={isLoading} $showCopy={true} theme={theme}>
                <CopyButton text={message} />
                <MessageText $isLoading={isLoading} $isBot={isBot} theme={theme}>
                  <div dangerouslySetInnerHTML={{ __html: formatText(message) }} />
                </MessageText>
                {timestamp && (
                  <Timestamp>
                    {formatTime(timestamp)}
                  </Timestamp>
                )}
              </MessageBubble>
            </MessageBubbleWithCopy>
          ) : (
            <MessageBubble $isBot={isBot} $isLoading={isLoading} theme={theme}>
              <MessageText $isLoading={isLoading} $isBot={isBot} theme={theme}>
                {isLoading ? (
                  <>
                    Digitando
                    <LoadingDots theme={theme}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </LoadingDots>
                  </>
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: formatText(message) }} />
                )}
              </MessageText>
              {timestamp && !isLoading && (
                <Timestamp>
                  {formatTime(timestamp)}
                </Timestamp>
              )}
            </MessageBubble>
          )}
        </div>
        {!isBot && (
          <Avatar $isBot={isBot} theme={theme}>
            👤
          </Avatar>
        )}
      </MessageContent>
      </MessageContainer>
    );
  }

export default ChatMessage;
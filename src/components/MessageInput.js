import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';

const InputContainer = styled.div`
  padding: 20px 0;
  border-top: 1px solid ${props => props.theme.border.light};
  background: ${props => props.theme.background.primary};
  position: sticky;
  bottom: 0;
  transition: all 0.3s ease;
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-end;
  max-width: 100%;
  position: relative;
`;

const TextAreaWrapper = styled.div`
  flex: 1;
  position: relative;
  background: ${props => props.theme.background.secondary};
  border-radius: 24px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  
  &:focus-within {
    border-color: ${props => props.theme.primary.orangeAccessible};
    box-shadow: ${props => props.theme.shadow.orangeFocus};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 44px;
  max-height: 120px;
  padding: 12px 50px 12px 16px;
  border: none;
  background: transparent;
  resize: none;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.4;
  color: ${props => props.theme.text.primary};
  outline: none;
  transition: all 0.3s ease;
  
  &::placeholder {
    color: ${props => props.theme.text.secondary};
  }
  
  &:disabled {
    opacity: 0.8;
    cursor: not-allowed;
  }
`;

const SendButton = styled.button`
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: ${props => props.disabled ? props.theme.neutral.gray : props.theme.gradients.success};
  color: ${props => props.theme.text.inverse};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.3s ease;
  opacity: ${props => props.disabled ? 0.8 : 1};
  
  &:hover:not(:disabled) {
    transform: scale(1.05);
    background: ${props => props.theme.gradients.confirmation};
    box-shadow: 0 4px 15px ${props => props.theme.primary.darkGreen}40;
  }
  
  &:active:not(:disabled) {
    transform: scale(0.95);
  }
`;

const CharacterCount = styled.div`
  position: absolute;
  bottom: -20px;
  right: 0;
  font-size: 11px;
  padding: ${props => props.$isNearLimit ? '2px 6px' : '0'};
  border-radius: 8px;
  background: ${props => props.$isNearLimit ? props.theme.gradients.warning : 'transparent'};
  color: ${props => props.$isNearLimit ? props.theme.text.inverse : props.theme.text.secondary};
  opacity: ${props => props.$show ? 1 : 0};
  transition: all 0.3s ease;
  font-weight: ${props => props.$isNearLimit ? '600' : '400'};
`;

const QuickActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
`;

const QuickActionButton = styled.button`
  padding: 6px 12px;
  border: 1px solid transparent;
  background: ${props => props.theme.gradients.notification};
  color: ${props => props.theme.text.inverse};
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px ${props => props.theme.primary.yellow}20;
  
  &:hover {
    transform: translateY(-2px);
    background: ${props => props.theme.gradients.alert};
    box-shadow: 0 4px 15px ${props => props.theme.primary.yellow}40;
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const MAX_CHARACTERS = 2000;

function MessageInput({ onSendMessage, disabled }) {
  const { theme } = useTheme();
  const [message, setMessage] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(true);
  const textAreaRef = useRef(null);

  const quickActions = [
    'Como você pode me ajudar?',
    'Explique um conceito',
    'Resolva um problema',
    'Crie um código'
  ];

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled && message.length <= MAX_CHARACTERS) {
      onSendMessage(message.trim());
      setMessage('');
      setShowQuickActions(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleQuickAction = (action) => {
    setMessage(action);
    setShowQuickActions(false);
    textAreaRef.current?.focus();
  };

  const isNearLimit = message.length > MAX_CHARACTERS * 0.8;
  const showCharCount = message.length > MAX_CHARACTERS * 0.5;

  return (
    <InputContainer theme={theme}>
      <form onSubmit={handleSubmit}>
        <InputWrapper>
          <TextAreaWrapper theme={theme}>
            <TextArea
              ref={textAreaRef}
              theme={theme}
              value={message}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CHARACTERS) {
                  setMessage(e.target.value);
                }
              }}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              disabled={disabled}
              rows={1}
            />
            <SendButton
              theme={theme}
              type="submit"
              disabled={disabled || !message.trim() || message.length > MAX_CHARACTERS}
            >
              ➤
            </SendButton>
            <CharacterCount theme={theme} $show={showCharCount} $isNearLimit={isNearLimit}>
              {message.length}/{MAX_CHARACTERS}
            </CharacterCount>
          </TextAreaWrapper>
        </InputWrapper>
      </form>
      
      {showQuickActions && message.length === 0 && (
        <QuickActions>
          {quickActions.map((action, index) => (
            <QuickActionButton
              key={index}
              theme={theme}
              onClick={() => handleQuickAction(action)}
              type="button"
            >
              {action}
            </QuickActionButton>
          ))}
        </QuickActions>
      )}
    </InputContainer>
  );
}

export default MessageInput;
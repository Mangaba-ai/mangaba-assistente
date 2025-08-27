import React, { useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';

const CopyButtonContainer = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: ${props => props.theme.background.secondary};
  border: 1px solid ${props => props.theme.border.light};
  border-radius: 6px;
  padding: 6px 8px;
  cursor: pointer;
  opacity: 0;
  transition: all 0.3s ease;
  font-size: 12px;
  color: ${props => props.theme.text.secondary};
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 10;
  
  &:hover {
    background: ${props => props.theme.primary.orangeAccessible};
    color: ${props => props.theme.text.inverse};
    border-color: ${props => props.theme.primary.orangeAccessible};
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  ${props => props.$copied && `
    background: ${props.theme.primary.darkGreen};
    color: ${props.theme.text.inverse};
    border-color: ${props.theme.primary.forestGreen};
  `}
`;

const MessageBubbleWithCopy = styled.div`
  position: relative;
  
  &:hover ${CopyButtonContainer} {
    opacity: 1;
  }
`;

function CopyButton({ text, className }) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async (e) => {
    e.stopPropagation();
    
    try {
      // Remover tags HTML do texto antes de copiar
      const cleanText = text
        .replace(/<br>/g, '\n')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      
      await navigator.clipboard.writeText(cleanText);
      setCopied(true);
      
      // Reset do estado após 2 segundos
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Erro ao copiar texto:', error);
      
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea');
      textArea.value = text.replace(/<[^>]*>/g, '').replace(/<br>/g, '\n');
      document.body.appendChild(textArea);
      textArea.select();
      
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackError) {
        console.error('Erro no fallback de cópia:', fallbackError);
      }
      
      document.body.removeChild(textArea);
    }
  };
  
  return (
    <CopyButtonContainer
      theme={theme}
      onClick={handleCopy}
      $copied={copied}
      className={className}
      title={copied ? 'Copiado!' : 'Copiar resposta'}
    >
      {copied ? (
        <>
          ✓ Copiado
        </>
      ) : (
        <>
          📋 Copiar
        </>
      )}
    </CopyButtonContainer>
  );
}

export { CopyButton, MessageBubbleWithCopy };
export default CopyButton;
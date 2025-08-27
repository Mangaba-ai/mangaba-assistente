import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';

const ToggleContainer = styled.button`
  position: relative;
  width: 60px;
  height: 30px;
  border-radius: 15px;
  border: none;
  cursor: pointer;
  background: ${props => props.theme.border.medium};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3px;
  
  &:hover {
    background: ${props => props.theme.gradients.alert};
    transform: scale(1.05);
    box-shadow: 0 4px 15px ${props => props.theme.primary.yellow}40;
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.primary.yellow};
    outline-offset: 2px;
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const ToggleSlider = styled.div`
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.theme.background.primary};
  box-shadow: ${props => props.theme.shadow.medium};
  transition: transform 0.3s ease;
  transform: translateX(${props => props.$isDark ? '30px' : '0'});
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
`;

const SunIcon = styled.span`
  position: absolute;
  left: 6px;
  font-size: 14px;
  opacity: ${props => props.$isDark ? 0.7 : 1};
  transition: all 0.3s ease;
  color: ${props => props.theme.primary.yellow};
  filter: ${props => props.$isDark ? 'none' : 'drop-shadow(0 0 8px #FFD23F80)'};
  
  &:hover {
    filter: drop-shadow(0 0 12px #FFD23F);
  }
`;

const MoonIcon = styled.span`
  position: absolute;
  right: 6px;
  font-size: 14px;
  opacity: ${props => props.$isDark ? 1 : 0.7};
    transition: opacity 0.3s ease;
  color: ${props => props.theme.text.secondary};
`;

const ThemeToggle = ({ className }) => {
  const { isDarkMode, toggleTheme, theme } = useTheme();

  return (
    <ToggleContainer 
      onClick={toggleTheme}
      className={className}
      title={isDarkMode ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
      aria-label={isDarkMode ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
      theme={theme}
    >
      <IconContainer>
        <SunIcon $isDark={isDarkMode} theme={theme}>☀️</SunIcon>
        <MoonIcon $isDark={isDarkMode} theme={theme}>🌙</MoonIcon>
      </IconContainer>
      <ToggleSlider $isDark={isDarkMode} theme={theme}>
        {isDarkMode ? '🌙' : '☀️'}
      </ToggleSlider>
    </ToggleContainer>
  );
};

export default ThemeToggle;
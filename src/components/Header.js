import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

const HeaderContainer = styled.header`
  background: ${props => props.theme.gradients.nature};
  padding: 16px 24px;
  box-shadow: ${props => props.theme.shadow.medium};
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;
  min-height: 80px;
  width: 100%;
  box-sizing: border-box;
  
  @media (max-width: 1024px) {
    padding: 14px 20px;
    min-height: 72px;
  }
  
  @media (max-width: 768px) {
    padding: 12px 16px;
    min-height: 64px;
  }
  
  @media (max-width: 480px) {
    padding: 10px 12px;
    min-height: 56px;
  }
`;

const AgentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #FFF4E6;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid #FFD4B3;
  transition: all 0.3s ease;
  flex-shrink: 1;
  min-width: 0;
  max-width: 300px;
  
  @media (max-width: 1024px) {
    padding: 0.4rem 0.8rem;
    gap: 0.5rem;
    max-width: 250px;
  }
  
  @media (max-width: 768px) {
    padding: 0.3rem 0.6rem;
    max-width: 200px;
  }
`;

const AgentName = styled.span`
  color: ${props => props.theme.primary.orangeAccessible};
  font-weight: 600;
  font-size: 0.9rem;
  transition: color 0.3s ease;
`;

const AgentProtocol = styled.span`
  background: ${props => props.theme.gradients.notification};
  color: ${props => props.theme.text.inverse};
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 500;
  transition: all 0.3s ease;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
  flex-wrap: wrap;
  
  @media (max-width: 1024px) {
    gap: 0.5rem;
  }
  
  @media (max-width: 768px) {
    gap: 0.25rem;
  }
`;

const HubButton = styled.button`
  background: ${props => props.theme.gradients.confirmation};
  color: ${props => props.theme.text.inverse};
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    background: ${props => props.theme.gradients.success};
    box-shadow: 0 4px 15px ${props => props.theme.primary.darkGreen}40;
  }
  
  @media (max-width: 768px) {
    padding: 0.5rem;
    
    span {
      display: none;
    }
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
  min-width: 0;
  max-width: 60%;
  
  @media (max-width: 1024px) {
    gap: 12px;
    max-width: 55%;
  }
  
  @media (max-width: 768px) {
    gap: 8px;
    max-width: 50%;
  }
  
  @media (max-width: 480px) {
    gap: 6px;
    max-width: 45%;
  }
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.text.inverse};
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  @media (min-width: 768px) {
    display: none;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${props => props.theme.background.primary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: ${props => props.theme.shadow.light};
  transition: all 0.3s ease;
`;

const Title = styled.h1`
  color: ${props => props.theme.text.inverse};
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  line-height: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: color 0.3s ease;
  white-space: nowrap;
  
  @media (max-width: 1024px) {
    font-size: 20px;
  }
  
  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const Subtitle = styled.span`
  color: ${props => props.theme.text.inverse};
  font-size: 14px;
  opacity: 1;
  margin-left: 8px;
  font-weight: 400;
  transition: color 0.3s ease;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 12px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  background: ${props => props.theme.background.primary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.primary.orange};
  box-shadow: ${props => props.theme.shadow.light};
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const UserName = styled.span`
  color: ${props => props.theme.text.inverse};
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
`;

const UserEmail = styled.span`
  color: ${props => props.theme.text.inverse};
  font-size: 12px;
  opacity: 0.8;
  line-height: 1;
`;

const LogoutButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  color: ${props => props.theme.text.inverse};
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    padding: 8px;
    font-size: 14px;
  }
`;

const StatusIndicator = styled.div`
  width: 8px;
  height: 8px;
  background: ${props => props.theme.status.success};
  border-radius: 50%;
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 1;
    }
  }
`;

const StatusText = styled.span`
  color: ${props => props.theme.text.inverse};
  font-size: 12px;
  opacity: 1;
  transition: color 0.3s ease;
`;

const CoordinationButton = styled.button`
  background: ${props => props.$enabled ? 
    'linear-gradient(135deg, #4CAF50, #45a049)' : 
    'linear-gradient(135deg, #757575, #616161)'};
  color: ${props => props.theme.text.inverse};
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  white-space: nowrap;
  flex-shrink: 0;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 1024px) {
    padding: 0.4rem 0.8rem;
    font-size: 0.75rem;
  }
  
  @media (max-width: 768px) {
    padding: 0.5rem;
    
    span {
      display: none;
    }
  }
`;

const AgentCounter = styled.span`
  background: ${props => props.theme.primary.orangeAccessible};
  color: ${props => props.theme.text.inverse};
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
  position: absolute;
  top: -5px;
  right: -5px;
  border: 2px solid ${props => props.theme.background.primary};
  
  @media (max-width: 768px) {
    width: 18px;
    height: 18px;
    font-size: 0.65rem;
    top: -4px;
    right: -4px;
  }
  
  @media (max-width: 480px) {
    width: 16px;
    height: 16px;
    font-size: 0.6rem;
    top: -3px;
    right: -3px;
  }
`;

function Header({ 
  onMenuClick, 
  selectedAgent, 
  onNavigateToHub, 
  coordinationEnabled = false, 
  onToggleCoordination, 
  activeAgentsCount = 0,
  user = null,
  onLogout = null
}) {
  const { theme } = useTheme();
  
  const getUserInitials = (name) => {
    if (!name) return '👤';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  
  return (
    <HeaderContainer as="header" theme={theme}>
      <LeftSection>
        <MenuButton onClick={onMenuClick} theme={theme}>
          ☰
        </MenuButton>
        <Logo>
          <LogoIcon theme={theme}>
            🥭
          </LogoIcon>
          <div>
            <Title theme={theme}>
              Mangaba Assistente
              <Subtitle theme={theme}>IA</Subtitle>
            </Title>
          </div>
        </Logo>
      </LeftSection>
      <HeaderActions>
        {selectedAgent && (
          <AgentInfo theme={theme}>
            <AgentName theme={theme}>{selectedAgent.name}</AgentName>
            <AgentProtocol theme={theme}>{selectedAgent.protocol}</AgentProtocol>
          </AgentInfo>
        )}
        
        {activeAgentsCount > 1 && (
          <CoordinationButton 
            onClick={onToggleCoordination}
            $enabled={coordinationEnabled}
            theme={theme}
            title={coordinationEnabled ? 'Desativar coordenação de agentes' : 'Ativar coordenação de agentes'}
          >
            {coordinationEnabled ? '🤝' : '👥'}
            <span>{coordinationEnabled ? 'Coordenação ON' : 'Coordenação OFF'}</span>
            {activeAgentsCount > 0 && (
              <AgentCounter theme={theme}>
                {activeAgentsCount}
              </AgentCounter>
            )}
          </CoordinationButton>
        )}
        
        <ThemeToggle />
        
        <HubButton onClick={onNavigateToHub} theme={theme}>
          🤖 <span>Hub</span>
        </HubButton>
        
        {user ? (
          <UserSection theme={theme}>
            <UserAvatar theme={theme}>
              {getUserInitials(user.name)}
            </UserAvatar>
            <UserInfo>
              <UserName theme={theme}>{user.name}</UserName>
              <UserEmail theme={theme}>{user.email}</UserEmail>
            </UserInfo>
            <LogoutButton onClick={onLogout} theme={theme} title="Sair">
              🚪
            </LogoutButton>
          </UserSection>
        ) : (
          <RightSection>
            <StatusIndicator theme={theme} />
            <StatusText theme={theme}>Online</StatusText>
          </RightSection>
        )}
      </HeaderActions>
    </HeaderContainer>
  );
}

export default Header;
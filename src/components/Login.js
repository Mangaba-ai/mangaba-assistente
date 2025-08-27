import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';
import logoSvg from '../assets/logo.svg';

// Animações avançadas
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const slideInFromLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInFromRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-8px) rotate(1deg);
  }
  66% {
    transform: translateY(-4px) rotate(-1deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 20px rgba(255, 140, 66, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 30px rgba(255, 140, 66, 0.5);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const particleFloat = keyframes`
  0%, 100% {
    transform: translateY(0px) translateX(0px);
    opacity: 0.3;
  }
  25% {
    transform: translateY(-20px) translateX(10px);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-10px) translateX(-5px);
    opacity: 1;
  }
  75% {
    transform: translateY(-30px) translateX(15px);
    opacity: 0.5;
  }
`;

// Styled Components avançados
const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, 
    ${props => props.theme.background.primary} 0%,
    ${props => props.theme.background.secondary} 25%,
    ${props => props.theme.primary.darkGreen}15 50%,
    ${props => props.theme.primary.yellow}10 75%,
    ${props => props.theme.background.primary} 100%);
  background-size: 400% 400%;
  animation: ${float} 20s ease-in-out infinite;
  padding: 20px;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 15% 85%, ${props => props.theme.primary.orange}15 0%, transparent 60%),
      radial-gradient(circle at 85% 15%, ${props => props.theme.primary.lightYellow}15 0%, transparent 60%),
      radial-gradient(circle at 50% 50%, ${props => props.theme.primary.orange}08 0%, transparent 80%);
    z-index: 0;
    animation: ${shimmer} 8s ease-in-out infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="0.5" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    z-index: 1;
    opacity: 0.3;
  }
`;

const FloatingParticles = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
  
  &::before, &::after {
    content: '';
    position: absolute;
    width: 4px;
    height: 4px;
    background: ${props => props.theme.primary.orange};
    border-radius: 50%;
    animation: ${particleFloat} 6s ease-in-out infinite;
  }
  
  &::before {
    top: 20%;
    left: 10%;
    animation-delay: 0s;
  }
  
  &::after {
    top: 70%;
    right: 15%;
    animation-delay: 3s;
  }
`;

const LoginCard = styled.div`
  background: ${props => props.theme.background.primary};
  border-radius: 24px;
  padding: 50px;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  width: 100%;
  max-width: 450px;
  position: relative;
  z-index: 2;
  animation: ${fadeIn} 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid ${props => props.theme.border.light};
  backdrop-filter: blur(20px) saturate(180%);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.1) 0%, 
      rgba(255, 255, 255, 0.05) 50%, 
      rgba(255, 255, 255, 0.02) 100%);
    border-radius: 24px;
    z-index: -1;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, 
      ${props => props.theme.primary.orange}40,
      ${props => props.theme.primary.lightYellow}40,
      ${props => props.theme.primary.orange}40);
    border-radius: 26px;
    z-index: -2;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::after {
    opacity: 1;
  }
`;

const LogoContainer = styled.div`
  text-align: center;
  margin-bottom: 40px;
  animation: ${float} 4s ease-in-out infinite;
  position: relative;
`;

const Logo = styled.div`
  width: 100px;
  height: 100px;
  margin: 0 auto 25px;
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: visible;
  
  img {
    width: 90%;
    height: 90%;
    object-fit: contain;
    filter: drop-shadow(0 8px 16px rgba(255, 140, 66, 0.3));
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    background: conic-gradient(from 0deg, 
      ${props => props.theme.primary.orange}, 
      ${props => props.theme.primary.lightYellow}, 
      ${props => props.theme.primary.orange});
    border-radius: 30px;
    z-index: -2;
    opacity: 0.6;
    animation: ${pulse} 3s ease-in-out infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    background: ${props => props.theme.background.primary};
    border-radius: 28px;
    z-index: -1;
  }
  
  &:hover img {
    transform: scale(1.1) rotate(5deg);
    filter: drop-shadow(0 12px 24px rgba(255, 140, 66, 0.5));
  }
`;

const AppTitle = styled.h1`
  font-size: 32px;
  font-weight: 800;
  margin: 0 0 12px 0;
  text-align: center;
  background: linear-gradient(135deg, 
    ${props => props.theme.primary.orange} 0%,
    ${props => props.theme.primary.lightYellow} 50%,
    ${props => props.theme.primary.orange} 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${shimmer} 3s ease-in-out infinite;
  letter-spacing: -0.5px;
  position: relative;
  
  &::after {
    content: 'Mangaba AI';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    background: ${props => props.theme.text.primary};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    opacity: 0.1;
    transform: translate(2px, 2px);
    z-index: -1;
  }
`;

const AppSubtitle = styled.p`
  color: ${props => props.theme.text.secondary};
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 40px 0;
  text-align: center;
  line-height: 1.6;
  opacity: 0.8;
  animation: ${slideInFromLeft} 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
  
  &::before {
    content: '✨';
    margin-right: 8px;
    font-size: 14px;
  }
  
  &::after {
    content: '🚀';
    margin-left: 8px;
    font-size: 14px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 25px;
  animation: ${slideInFromRight} 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both;
`;

const InputGroup = styled.div`
  position: relative;
  
  &:nth-child(1) {
    animation: ${slideInFromLeft} 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.6s both;
  }
  
  &:nth-child(2) {
    animation: ${slideInFromRight} 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.7s both;
  }
`;

const Label = styled.label`
  display: block;
  color: ${props => props.theme.text.primary};
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  opacity: 0.9;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px 20px;
  border: 2px solid ${props => props.theme.border.light};
  border-radius: 16px;
  font-size: 16px;
  background: ${props => props.theme.background.secondary};
  color: ${props => props.theme.text.primary};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
  position: relative;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary.darkGreen};
    box-shadow: 
      0 0 0 4px ${props => props.theme.primary.darkGreen}20,
      0 8px 25px -8px ${props => props.theme.primary.darkGreen}40;
    transform: translateY(-2px) scale(1.02);
    background: ${props => props.theme.background.primary};
  }
  
  &::placeholder {
    color: ${props => props.theme.text.tertiary};
    font-style: italic;
  }
  
  &:hover {
    border-color: ${props => props.theme.primary.darkGreen}60;
    transform: translateY(-1px);
  }
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 18px;
  background: ${props => props.theme.gradients.confirmation};
  color: ${props => props.theme.text.inverse};
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 15px;
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 1px;
  animation: ${slideInFromLeft} 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.8s both;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
      transparent, 
      rgba(255, 255, 255, 0.3), 
      transparent);
    transition: left 0.6s ease;
  }
  
  &:hover {
    transform: translateY(-3px) scale(1.02);
    background: ${props => props.theme.gradients.success};
    box-shadow: 
      0 15px 35px -10px ${props => props.theme.primary.darkGreen}60,
      0 0 0 1px rgba(255, 255, 255, 0.1);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(-1px) scale(0.98);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    animation: none;
    
    &:hover {
      transform: none;
      box-shadow: none;
      background: ${props => props.theme.gradients.confirmation};
      
      &::before {
        left: -100%;
      }
    }
  }
`;

const RememberMe = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: ${props => props.theme.primary.darkGreen};
  }
  
  label {
    color: ${props => props.theme.text.secondary};
    font-size: 14px;
    margin: 0;
    cursor: pointer;
  }
`;

const ForgotPassword = styled.a`
  color: ${props => props.theme.primary.yellow};
  text-decoration: none;
  font-size: 14px;
  text-align: center;
  margin-top: 15px;
  display: block;
  transition: color 0.3s ease;
  
  &:hover {
    color: ${props => props.theme.primary.orange};
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.div`
  background: ${props => props.theme.gradients.destructive}20;
  color: ${props => props.theme.primary.darkRed};
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  border: 1px solid ${props => props.theme.primary.darkRed}40;
  box-shadow: 0 2px 8px ${props => props.theme.primary.darkRed}20;
`;

const SuccessMessage = styled.div`
  background: ${props => props.theme.gradients.success}20;
  color: ${props => props.theme.primary.darkGreen};
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  border: 1px solid ${props => props.theme.primary.darkGreen}40;
  box-shadow: 0 2px 8px ${props => props.theme.primary.darkGreen}20;
`;

const DemoCredentials = styled.div`
  background: ${props => props.theme.background.secondary};
  border: 1px solid ${props => props.theme.border.light};
  border-radius: 8px;
  padding: 12px;
  margin-top: 20px;
  font-size: 12px;
  color: ${props => props.theme.text.secondary};
  
  h4 {
    margin: 0 0 8px 0;
    color: ${props => props.theme.text.primary};
    font-size: 13px;
  }
  
  p {
    margin: 4px 0;
    font-family: monospace;
  }
`;

const Login = ({ onLogin }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpar mensagens de erro/sucesso quando o usuário começar a digitar
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Simular autenticação (substituir por lógica real)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Credenciais de demonstração
      if (formData.email === 'admin@mangaba.ai' && formData.password === 'mangaba123') {
        setSuccess('Login realizado com sucesso!');
        
        // Salvar dados de autenticação
        const userData = {
          email: formData.email,
          name: 'Administrador',
          avatar: null,
          loginTime: new Date().toISOString(),
          rememberMe: formData.rememberMe
        };
        
        if (formData.rememberMe) {
          localStorage.setItem('mangaba_user', JSON.stringify(userData));
        } else {
          sessionStorage.setItem('mangaba_user', JSON.stringify(userData));
        }
        
        setTimeout(() => {
          onLogin(userData);
        }, 1000);
      } else {
        setError('Email ou senha incorretos. Tente as credenciais de demonstração.');
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer theme={theme}>
      <FloatingParticles theme={theme} />
      <LoginCard theme={theme}>
        <LogoContainer>
          <Logo theme={theme}>
            <img src={logoSvg} alt="Mangaba AI Logo" />
          </Logo>
          <AppTitle theme={theme}>Mangaba AI</AppTitle>
          <AppSubtitle theme={theme}>
            Assistente Inteligente com IA Local
          </AppSubtitle>
        </LogoContainer>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage theme={theme}>{error}</ErrorMessage>}
          {success && <SuccessMessage theme={theme}>{success}</SuccessMessage>}
          
          <InputGroup>
            <Label theme={theme}>Email</Label>
            <Input
              theme={theme}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="seu@email.com"
              required
            />
          </InputGroup>

          <InputGroup>
            <Label theme={theme}>Senha</Label>
            <Input
              theme={theme}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              required
            />
          </InputGroup>

          <RememberMe theme={theme}>
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange}
            />
            <label htmlFor="rememberMe">Lembrar de mim</label>
          </RememberMe>

          <LoginButton
            theme={theme}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </LoginButton>

          <ForgotPassword theme={theme} href="#">
            Esqueceu sua senha?
          </ForgotPassword>
        </Form>

        <DemoCredentials theme={theme}>
          <h2>Credenciais de Demonstração:</h2>
          <p>Email: admin@mangaba.ai</p>
          <p>Senha: mangaba123</p>
        </DemoCredentials>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;
// Paleta de cores baseada na fruta mangaba com suporte a tema escuro
const lightTheme = {
  // Cores primárias da mangaba
  primary: {
    orange: '#F97518',
    yellow: '#FF9C24',
    green: '#8FBC8F',
    darkOrange: '#C25B11',
    lightYellow: '#FAE4BE',
    orangeAccessible: '#C25B11',
    orangeDark: '#C25B11',
    greenAccessible: '#5A8A5A',
    yellowAccessible: '#B8A000',
    // Novos tons de verde
    darkGreen: '#2E7D32',
    forestGreen: '#1B5E20',
    emeraldGreen: '#00695C',
    lightGreen: '#A5D6A7',
    // Novos tons de vermelho escuro
    darkRed: '#B71C1C',
    crimsonRed: '#8E0000',
    burgundy: '#7B1FA2',
    maroonRed: '#6D1B7B'
  },
  
  // Cores neutras - tema claro
  neutral: {
    white: '#FFFFFF',
    lightGray: '#F8F9FA',
    gray50: '#F9FAFB',
    gray: '#CCCCCC',
    gray200: '#D1D5DB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    darkGray: '#3E4B57',
    black: '#333333'
  },
  
  // Cores de fundo e texto
  background: {
    primary: '#FFF8F5',
    secondary: '#FFF4ED',
    tertiary: '#FAE4BE',
    card: '#FFFFFF',
    sidebar: '#FFF4ED',
    hover: '#FFDAC2'
  },

  text: {
    primary: '#1E0D01',
    secondary: '#402B22',
    tertiary: '#6B7280',
    muted: '#402B22',
    inverse: '#FFF8F5'
  },
  
  // Cores de estado
  status: {
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',
    // Estados com novos tons
    successDark: '#2E7D32',
    errorDark: '#B71C1C',
    criticalError: '#8E0000',
    activeGreen: '#00695C'
  },
  
  // Gradientes
  gradients: {
    primary: 'linear-gradient(135deg, #F97518 0%, #FF9C24 100%)',
    secondary: 'linear-gradient(135deg, #FF9C24 0%, #8FBC8F 100%)',
    chat: 'linear-gradient(180deg, #FFF4ED 0%, #FFF8F5 100%)',
    sidebar: 'linear-gradient(180deg, #FFF8F5 0%, #FFF4ED 100%)',
    // Gradientes Verde - Para sucesso, confirmação e ações positivas
    greenDark: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
    nature: 'linear-gradient(135deg, #00695C 0%, #2E7D32 50%, #1B5E20 100%)',
    success: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
    confirmation: 'linear-gradient(135deg, #00695C 0%, #4CAF50 100%)',
    // Gradientes Vermelho - Para ações críticas, destrutivas e erros
    redDark: 'linear-gradient(135deg, #B71C1C 0%, #8E0000 100%)',
    danger: 'linear-gradient(135deg, #8E0000 0%, #B71C1C 50%, #7B1FA2 100%)',
    critical: 'linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)',
    destructive: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)',
    // Gradientes Amarelo - Para notificações, avisos e alertas
    warning: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
    notification: 'linear-gradient(135deg, #FF9C24 0%, #FFC107 100%)',
    alert: 'linear-gradient(135deg, #FFC107 0%, #FF8F00 100%)',
    caution: 'linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)'
  },
  
  // Bordas e sombras
  border: {
    light: '#E5E7EB',
    medium: '#D1D5DB',
    dark: '#6B7280'
  },
  
  shadow: {
    light: '0 2px 4px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 8px rgba(0, 0, 0, 0.15)',
    dark: '0 8px 16px rgba(0, 0, 0, 0.2)',
    orange: '0 4px 15px rgba(249, 117, 24, 0.3)',
    orangeLight: '0 4px 15px rgba(249, 117, 24, 0.2)',
    orangeFocus: '0 0 0 3px rgba(249, 117, 24, 0.1)',
    orangeHover: '0 2px 8px rgba(249, 117, 24, 0.3)',
    success: '0 4px 15px rgba(76, 175, 80, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    whiteOverlay: 'rgba(255, 255, 255, 0.1)',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
  }
};

const darkTheme = {
  // Cores primárias da mangaba (mantidas para consistência)
  primary: {
    orange: '#F97518',
    yellow: '#FF9C24',
    green: '#8FBC8F',
    darkOrange: '#C25B11',
    lightYellow: '#2A2A1A',
    orangeAccessible: '#FF9C24',
    orangeDark: '#FFB380',
    greenAccessible: '#A8CCA8',
    yellowAccessible: '#FFE066',
    // Novos tons de verde (ajustados para tema escuro)
    darkGreen: '#4CAF50',
    forestGreen: '#66BB6A',
    emeraldGreen: '#26A69A',
    lightGreen: '#81C784',
    // Novos tons de vermelho escuro (ajustados para tema escuro)
    darkRed: '#EF5350',
    crimsonRed: '#F44336',
    burgundy: '#AB47BC',
    maroonRed: '#BA68C8'
  },
  
  // Cores neutras - tema escuro
  neutral: {
    white: '#1A1A1A',
    lightGray: '#2A2A2A',
    gray50: '#1F2937',
    gray: '#404040',
    gray200: '#404040',
    gray300: '#555555',
    gray400: '#6B7280',
    gray500: '#9CA3AF',
    gray600: '#D1D5DB',
    gray700: '#D1D5DB',
    darkGray: '#CCCCCC',
    black: '#FFFFFF'
  },
  
  // Cores de fundo e texto
  background: {
    primary: '#1A1A1A',
    secondary: '#2A2A2A',
    tertiary: '#333333',
    card: '#2A2A2A',
    sidebar: '#1F1F1F',
    hover: '#333333'
  },
  
  text: {
    primary: '#FFFFFF',
    secondary: '#E5E7EB',
    tertiary: '#D1D5DB',
    muted: '#9CA3AF',
    inverse: '#1A1A1A'
  },
  
  // Cores de estado (ajustadas para melhor contraste)
  status: {
    success: '#66BB6A',
    error: '#EF5350',
    warning: '#FFA726',
    info: '#42A5F5',
    // Estados com novos tons (tema escuro)
    successDark: '#4CAF50',
    errorDark: '#F44336',
    criticalError: '#EF5350',
    activeGreen: '#26A69A'
  },
  
  // Gradientes
  gradients: {
    primary: 'linear-gradient(135deg, #F97518 0%, #FF9C24 100%)',
    secondary: 'linear-gradient(135deg, #FF9C24 0%, #8FBC8F 100%)',
    chat: 'linear-gradient(180deg, #2A2A2A 0%, #1A1A1A 100%)',
    sidebar: 'linear-gradient(180deg, #1F1F1F 0%, #1A1A1A 100%)',
    // Gradientes Verde - Para sucesso, confirmação e ações positivas (tema escuro)
    greenDark: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
    nature: 'linear-gradient(135deg, #26A69A 0%, #4CAF50 50%, #66BB6A 100%)',
    success: 'linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%)',
    confirmation: 'linear-gradient(135deg, #26A69A 0%, #66BB6A 100%)',
    // Gradientes Vermelho - Para ações críticas, destrutivas e erros (tema escuro)
    redDark: 'linear-gradient(135deg, #EF5350 0%, #F44336 100%)',
    danger: 'linear-gradient(135deg, #F44336 0%, #EF5350 50%, #AB47BC 100%)',
    critical: 'linear-gradient(135deg, #F44336 0%, #EF5350 100%)',
    destructive: 'linear-gradient(135deg, #FF5722 0%, #F44336 100%)',
    // Gradientes Amarelo - Para notificações, avisos e alertas (tema escuro)
    warning: 'linear-gradient(135deg, #FFA726 0%, #FF9800 100%)',
    notification: 'linear-gradient(135deg, #FFE066 0%, #FFC107 100%)',
    alert: 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)',
    caution: 'linear-gradient(135deg, #FFCC80 0%, #FFA726 100%)'
  },
  
  // Bordas e sombras
  border: {
    light: '#404040',
    medium: '#555555',
    dark: '#666666'
  },
  
  shadow: {
    light: '0 2px 4px rgba(0, 0, 0, 0.3)',
    medium: '0 4px 8px rgba(0, 0, 0, 0.4)',
    dark: '0 8px 16px rgba(0, 0, 0, 0.5)',
    orange: '0 4px 15px rgba(249, 117, 24, 0.4)',
    orangeLight: '0 4px 15px rgba(249, 117, 24, 0.3)',
    orangeFocus: '0 0 0 3px rgba(249, 117, 24, 0.2)',
    orangeHover: '0 2px 8px rgba(249, 117, 24, 0.4)',
    success: '0 4px 15px rgba(76, 175, 80, 0.4)',
    overlay: 'rgba(0, 0, 0, 0.7)',
    whiteOverlay: 'rgba(255, 255, 255, 0.05)',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
  }
};

// Tema padrão (compatibilidade com código existente)
const colors = lightTheme;

// Exportações usando sintaxe ES6
export { lightTheme, darkTheme };
export default colors;
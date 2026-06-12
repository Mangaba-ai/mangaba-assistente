import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: ${props => props.theme?.background?.secondary || '#F8F9FA'};
    color: ${props => props.theme?.text?.primary || '#2D3748'};
    line-height: 1.6;
    overflow-x: hidden;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* Scrollbar customization */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${props => props.theme?.background?.secondary || '#F8F9FA'};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme?.primary?.orangeAccessible || '#C25B11'};
    border-radius: 4px;
    transition: background 0.2s ease;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme?.primary?.darkOrange || '#C25B11'};
  }

  /* Focus styles */
  *:focus {
    outline: 2px solid ${props => props.theme?.primary?.orangeAccessible || '#C25B11'};
    outline-offset: 2px;
  }

  button:focus,
  input:focus,
  textarea:focus,
  select:focus {
    outline: 2px solid ${props => props.theme?.primary?.orangeAccessible || '#C25B11'};
    outline-offset: 2px;
  }

  /* Button reset */
  button {
    border: none;
    background: none;
    cursor: pointer;
    font-family: inherit;
  }

  /* Link styles */
  a {
    color: ${props => props.theme?.primary?.orangeAccessible || '#C25B11'};
    text-decoration: none;
    transition: color 0.2s ease;
  }

  a:hover {
    color: ${props => props.theme?.primary?.darkOrange || '#C25B11'};
    text-decoration: underline;
  }

  /* Selection styles */
  ::selection {
    background: ${props => props.theme?.primary?.lightYellow || '#FAE4BE'};
    color: ${props => props.theme?.text?.primary || '#2D3748'};
  }

  ::-moz-selection {
    background: ${props => props.theme?.primary?.lightYellow || '#FAE4BE'};
    color: ${props => props.theme?.text?.primary || '#2D3748'};
  }

  /* Utility classes */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .text-center {
    text-align: center;
  }

  .text-left {
    text-align: left;
  }

  .text-right {
    text-align: right;
  }

  .mb-0 { margin-bottom: 0; }
  .mb-1 { margin-bottom: 0.25rem; }
  .mb-2 { margin-bottom: 0.5rem; }
  .mb-3 { margin-bottom: 1rem; }
  .mb-4 { margin-bottom: 1.5rem; }
  .mb-5 { margin-bottom: 3rem; }

  .mt-0 { margin-top: 0; }
  .mt-1 { margin-top: 0.25rem; }
  .mt-2 { margin-top: 0.5rem; }
  .mt-3 { margin-top: 1rem; }
  .mt-4 { margin-top: 1.5rem; }
  .mt-5 { margin-top: 3rem; }

  /* Responsive typography */
  @media (max-width: 768px) {
    html {
      font-size: 14px;
    }
  }

  /* Animation utilities */
  .fade-in {
    animation: fadeIn 0.3s ease-in;
  }

  .slide-in-left {
    animation: slideInLeft 0.3s ease-out;
  }

  .slide-in-right {
    animation: slideInRight 0.3s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideInLeft {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }

  @keyframes slideInRight {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }

  /* Loading animation */
  .loading {
    position: relative;
    overflow: hidden;
  }

  .loading::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
    animation: loading 1.5s infinite;
  }

  @keyframes loading {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }

  /* Print styles */
  @media print {
    * {
      background: white !important;
      color: black !important;
      box-shadow: none !important;
    }
    
    .no-print {
      display: none !important;
    }
  }
`;

export default GlobalStyles;
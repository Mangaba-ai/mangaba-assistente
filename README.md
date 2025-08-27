# 🥭 Mangaba Assistente

Um assistente de IA moderno e inteligente com design inspirado na fruta mangaba, desenvolvido em React. Uma plataforma de conversação avançada que combina múltiplos agentes de IA para oferecer uma experiência única e personalizada.

## 🎨 Design

O Mangaba Assistente utiliza uma paleta de cores inspirada na fruta mangaba:
- **Laranja vibrante** (#FF8C42) - Cor principal da mangaba madura
- **Amarelo dourado** (#FFD23F) - Tons dourados da fruta
- **Verde suave** (#8FBC8F) - Cor das folhas
- **Gradientes** - Combinações harmoniosas das cores principais

## ✨ Funcionalidades

- 🤖 **Sistema Multi-Agente** - Múltiplos agentes de IA especializados
- 💬 **Interface de Chat Avançada** - Conversação em tempo real
- 🎨 **Design Responsivo** - Paleta inspirada na mangaba
- 📱 **Hub de Agentes** - Gerenciamento e criação de agentes personalizados
- 🔗 **Coordenação de Agentes** - Colaboração inteligente entre agentes
- ⚡ **Animações Fluidas** - Transições suaves e interativas
- 🔄 **Sistema de Loading** - Indicadores visuais elegantes
- 📝 **Campo de Entrada Inteligente** - Contador de caracteres e ações rápidas
- 🌙 **Modo Escuro/Claro** - Alternância de temas
- 🔐 **Sistema de Login** - Autenticação segura

## 🚀 Como executar

### Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd mangaba-assistente
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Execute o projeto:
```bash
npm start
# ou
yarn start
```

4. Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🛠️ Tecnologias utilizadas

- **React** 18.2.0 - Biblioteca principal
- **Styled Components** 6.0.0 - Estilização CSS-in-JS
- **React Router DOM** 6.14.0 - Roteamento
- **Axios** 1.4.0 - Requisições HTTP
- **Socket.io Client** 4.7.0 - Comunicação em tempo real
- **UUID** 9.0.0 - Geração de IDs únicos
- **Ollama** - Integração com modelos de IA locais
- **Context API** - Gerenciamento de estado global

## 📁 Estrutura do projeto

```
src/
├── components/              # Componentes React
│   ├── Header.js           # Cabeçalho da aplicação
│   ├── Sidebar.js          # Barra lateral com navegação
│   ├── Hub.js              # Hub de gerenciamento de agentes
│   ├── Login.js            # Tela de autenticação
│   ├── ChatMessage.js      # Componente de mensagem
│   ├── MessageInput.js     # Campo de entrada de mensagens
│   ├── AgentCreator.js     # Criador de agentes personalizados
│   └── ThemeToggle.js      # Alternador de temas
├── services/               # Serviços e APIs
│   ├── LLMService.js       # Serviço de integração com IA
│   ├── AgentCoordinationService.js # Coordenação entre agentes
│   └── FileProcessingService.js    # Processamento de arquivos
├── config/                 # Configurações
│   └── AgentConfig.js      # Configuração de agentes
├── contexts/               # Contextos React
│   └── ThemeContext.js     # Contexto de temas
├── styles/                 # Estilos e temas
│   ├── colors.js           # Paleta de cores da mangaba
│   └── GlobalStyles.js     # Estilos globais
├── protocols/              # Protocolos de comunicação
├── interfaces/             # Interfaces de comunicação
├── App.js                  # Componente principal
└── index.js                # Ponto de entrada
```

## 🎯 Próximas funcionalidades

- [ ] Integração com mais provedores de IA (OpenAI, Anthropic, Google)
- [ ] Persistência avançada de conversas
- [ ] Suporte a arquivos e imagens
- [ ] Sistema de plugins para agentes
- [ ] Configurações avançadas de agentes
- [ ] Exportação de conversas em múltiplos formatos
- [ ] Temas personalizáveis
- [ ] API REST para integração externa
- [ ] Sistema de backup e sincronização

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🙏 Agradecimentos

- Inspirado no design natural da fruta mangaba
- Interface baseada nas melhores práticas de UX/UI
- Comunidade React por todas as ferramentas incríveis

---

**Mangaba Assistente** - Seu assistente de IA com o sabor tropical da mangaba! 🥭✨
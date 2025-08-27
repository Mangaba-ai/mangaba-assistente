# Mangaba Assistente - API Documentation

## Overview

Mangaba Assistente is a multi-agent AI system that provides intelligent assistance through various LLM providers. This documentation covers the main services and their APIs.

## Table of Contents

1. [LLM Service](#llm-service)
2. [Agent Coordination Service](#agent-coordination-service)
3. [File Processing Service](#file-processing-service)
4. [Protocol Service](#protocol-service)
5. [Configuration](#configuration)
6. [Error Handling](#error-handling)

## LLM Service

The LLM Service provides an abstraction layer for different Large Language Model providers.

### Supported Providers

- **OpenAI**: GPT-3.5, GPT-4, GPT-4 Turbo
- **Anthropic**: Claude 3 (Opus, Sonnet, Haiku)
- **Google**: Gemini Pro, Gemini Pro Vision
- **Ollama**: Local models (Llama 2, Code Llama, Mistral, etc.)

### Base LLM Provider Class

```javascript
class BaseLLMProvider {
  constructor(config)
  async sendMessage(message, options = {})
  async processFile(file, prompt)
  async streamMessage(message, onChunk)
  validateConfig()
  getModelInfo()
  supportsFiles()
  getContextWindow()
}
```

### Configuration

```javascript
const config = {
  provider: 'openai', // 'openai', 'anthropic', 'google', 'ollama'
  model: 'gpt-4',
  apiKey: 'your-api-key',
  baseUrl: 'https://api.openai.com/v1' // optional
};
```

### Methods

#### `sendMessage(message, options)`

Sends a message to the LLM and returns the response.

**Parameters:**
- `message` (string): The message to send
- `options` (object): Optional parameters
  - `temperature` (number): Controls randomness (0-1)
  - `maxTokens` (number): Maximum tokens in response
  - `model` (string): Override default model

**Returns:** Promise<string> - The LLM response

**Example:**
```javascript
const response = await provider.sendMessage('Hello, how are you?', {
  temperature: 0.7,
  maxTokens: 1000
});
```

#### `processFile(file, prompt)`

Processes a file with a given prompt.

**Parameters:**
- `file` (File|string): File object or file content
- `prompt` (string): Processing instructions

**Returns:** Promise<string> - Processed response

#### `streamMessage(message, onChunk)`

Streams the LLM response in real-time.

**Parameters:**
- `message` (string): The message to send
- `onChunk` (function): Callback for each response chunk

**Returns:** Promise<void>

**Example:**
```javascript
await provider.streamMessage('Tell me a story', (chunk) => {
  console.log(chunk);
});
```

## Agent Coordination Service

Manages multiple AI agents and their coordination.

### Methods

#### `createAgent(config)`

Creates a new agent instance.

**Parameters:**
- `config` (object): Agent configuration
  - `name` (string): Agent name
  - `model` (string): LLM model to use
  - `capabilities` (array): List of capabilities
  - `systemPrompt` (string): System prompt for the agent

**Returns:** Promise<Agent> - Created agent instance

#### `activateAgent(agentId)`

Activates an agent for use.

**Parameters:**
- `agentId` (string): Unique agent identifier

**Returns:** Promise<boolean> - Success status

#### `deactivateAgent(agentId)`

Deactivates an agent.

**Parameters:**
- `agentId` (string): Unique agent identifier

**Returns:** Promise<boolean> - Success status

#### `coordinateAgents(task, agentIds)`

Coordinates multiple agents to work on a task.

**Parameters:**
- `task` (string): Task description
- `agentIds` (array): List of agent IDs to coordinate

**Returns:** Promise<object> - Coordination result

## File Processing Service

Handles file upload, processing, and analysis.

### Supported File Types

- Text files (.txt, .md, .json, .xml)
- Code files (.js, .py, .java, .cpp, etc.)
- Documents (.pdf, .docx)
- Images (.jpg, .png, .gif)

### Methods

#### `processFile(file, options)`

Processes an uploaded file.

**Parameters:**
- `file` (File): File object
- `options` (object): Processing options
  - `extractText` (boolean): Extract text content
  - `analyzeStructure` (boolean): Analyze file structure
  - `generateSummary` (boolean): Generate content summary

**Returns:** Promise<object> - Processing result

**Example:**
```javascript
const result = await fileService.processFile(file, {
  extractText: true,
  generateSummary: true
});
```

#### `extractContent(file)`

Extracts content from a file.

**Parameters:**
- `file` (File): File to process

**Returns:** Promise<string> - Extracted content

#### `analyzeFile(file, prompt)`

Analyzes a file with AI assistance.

**Parameters:**
- `file` (File): File to analyze
- `prompt` (string): Analysis instructions

**Returns:** Promise<string> - Analysis result

## Protocol Service

Manages communication protocols between agents.

### Supported Protocols

- **A2A Protocol**: Agent-to-Agent communication
- **MCP Protocol**: Model Context Protocol

### Methods

#### `initializeProtocol(type, config)`

Initializes a communication protocol.

**Parameters:**
- `type` (string): Protocol type ('a2a' or 'mcp')
- `config` (object): Protocol configuration

**Returns:** Promise<Protocol> - Protocol instance

#### `sendMessage(protocol, message, target)`

Sends a message through a protocol.

**Parameters:**
- `protocol` (Protocol): Protocol instance
- `message` (object): Message to send
- `target` (string): Target agent/service

**Returns:** Promise<object> - Response

## Configuration

### Environment Variables

```bash
# LLM Provider Configuration
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_API_KEY=your_google_key

# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434

# Application Configuration
REACT_APP_API_BASE_URL=http://localhost:3001
REACT_APP_DEFAULT_MODEL=gpt-3.5-turbo
```

### Agent Configuration

```javascript
const agentConfig = {
  name: 'Assistant Agent',
  model: 'gpt-4',
  capabilities: ['text-generation', 'file-analysis', 'code-review'],
  systemPrompt: 'You are a helpful AI assistant...',
  maxTokens: 4096,
  temperature: 0.7
};
```

## Error Handling

### Common Error Types

#### `LLMError`
Thrown when LLM service encounters an error.

```javascript
try {
  const response = await provider.sendMessage(message);
} catch (error) {
  if (error instanceof LLMError) {
    console.error('LLM Error:', error.message);
  }
}
```

#### `AgentError`
Thrown when agent operations fail.

#### `FileProcessingError`
Thrown when file processing fails.

#### `ProtocolError`
Thrown when protocol communication fails.

### Error Response Format

```javascript
{
  error: {
    type: 'LLMError',
    message: 'API rate limit exceeded',
    code: 'RATE_LIMIT_EXCEEDED',
    details: {
      retryAfter: 60
    }
  }
}
```

## Rate Limiting

### OpenAI
- GPT-3.5: 3,500 requests/minute
- GPT-4: 200 requests/minute

### Anthropic
- Claude 3: 1,000 requests/minute

### Local Models (Ollama)
- No rate limits (hardware dependent)

## Best Practices

1. **Error Handling**: Always wrap API calls in try-catch blocks
2. **Rate Limiting**: Implement exponential backoff for rate-limited APIs
3. **Caching**: Cache responses when appropriate to reduce API calls
4. **Security**: Never expose API keys in client-side code
5. **Monitoring**: Log API usage and errors for debugging

## Examples

### Basic Chat Implementation

```javascript
import { OpenAIProvider } from './services/LLMService';

const provider = new OpenAIProvider({
  model: 'gpt-3.5-turbo',
  apiKey: process.env.OPENAI_API_KEY
});

async function chat(message) {
  try {
    const response = await provider.sendMessage(message);
    return response;
  } catch (error) {
    console.error('Chat error:', error);
    throw error;
  }
}
```

### Multi-Agent Coordination

```javascript
import { AgentCoordinationService } from './services/AgentCoordinationService';

const coordinator = new AgentCoordinationService();

// Create agents
const codeAgent = await coordinator.createAgent({
  name: 'Code Assistant',
  model: 'gpt-4',
  capabilities: ['code-generation', 'code-review']
});

const docAgent = await coordinator.createAgent({
  name: 'Documentation Assistant',
  model: 'gpt-3.5-turbo',
  capabilities: ['documentation', 'writing']
});

// Coordinate task
const result = await coordinator.coordinateAgents(
  'Create a React component with documentation',
  [codeAgent.id, docAgent.id]
);
```

## Support

For questions or issues, please refer to:
- [GitHub Issues](https://github.com/your-repo/mangaba-assistente/issues)
- [Documentation](./README.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
/**
 * Parser universal de arquivos com extração de conteúdo inteligente
 * Suporta múltiplos formatos e extração contextual
 */

// Tipos de conteúdo extraído
export const CONTENT_TYPES = {
  TEXT: 'text',
  CODE: 'code',
  STRUCTURED_DATA: 'structured_data',
  METADATA: 'metadata',
  BINARY: 'binary',
  MIXED: 'mixed'
};

// Estratégias de parsing
export const PARSING_STRATEGIES = {
  FULL: 'full',
  SUMMARY: 'summary',
  METADATA_ONLY: 'metadata_only',
  SMART: 'smart',
  SELECTIVE: 'selective'
};

// Níveis de qualidade de extração
export const EXTRACTION_QUALITY = {
  BASIC: 'basic',
  STANDARD: 'standard',
  HIGH: 'high',
  PREMIUM: 'premium'
};

/**
 * Classe base para parsers específicos
 */
export class BaseParser {
  constructor(fileType, options = {}) {
    this.fileType = fileType;
    this.options = {
      strategy: PARSING_STRATEGIES.SMART,
      quality: EXTRACTION_QUALITY.STANDARD,
      maxSize: 50 * 1024 * 1024, // 50MB
      timeout: 30000, // 30 segundos
      ...options
    };
  }

  /**
   * Verificar se pode processar o arquivo
   * @param {File} file - Arquivo
   * @returns {boolean}
   */
  canParse(file) {
    throw new Error('Método canParse deve ser implementado');
  }

  /**
   * Extrair conteúdo do arquivo
   * @param {File|Blob|ArrayBuffer} file - Arquivo
   * @returns {Promise<Object>}
   */
  async parse(file) {
    throw new Error('Método parse deve ser implementado');
  }

  /**
   * Validar tamanho do arquivo
   * @param {File} file - Arquivo
   * @returns {boolean}
   */
  validateFileSize(file) {
    return file.size <= this.options.maxSize;
  }

  /**
   * Extrair metadados básicos
   * @param {File} file - Arquivo
   * @returns {Object}
   */
  extractBasicMetadata(file) {
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      extension: this.getFileExtension(file.name)
    };
  }

  /**
   * Obter extensão do arquivo
   * @param {string} filename - Nome do arquivo
   * @returns {string}
   */
  getFileExtension(filename) {
    return filename.toLowerCase().substring(filename.lastIndexOf('.'));
  }

  /**
   * Detectar encoding do texto
   * @param {ArrayBuffer} buffer - Buffer do arquivo
   * @returns {string}
   */
  detectEncoding(buffer) {
    const uint8Array = new Uint8Array(buffer);
    
    // Verificar BOM UTF-8
    if (uint8Array.length >= 3 && 
        uint8Array[0] === 0xEF && 
        uint8Array[1] === 0xBB && 
        uint8Array[2] === 0xBF) {
      return 'utf-8';
    }
    
    // Verificar BOM UTF-16
    if (uint8Array.length >= 2) {
      if ((uint8Array[0] === 0xFF && uint8Array[1] === 0xFE) ||
          (uint8Array[0] === 0xFE && uint8Array[1] === 0xFF)) {
        return 'utf-16';
      }
    }
    
    // Assumir UTF-8 por padrão
    return 'utf-8';
  }
}

/**
 * Parser para arquivos de texto
 */
export class TextParser extends BaseParser {
  constructor(options = {}) {
    super('text', options);
    this.supportedExtensions = ['.txt', '.md', '.rtf', '.log'];
  }

  canParse(file) {
    const extension = this.getFileExtension(file.name);
    return this.supportedExtensions.includes(extension) || 
           file.type?.startsWith('text/');
  }

  async parse(file) {
    try {
      const content = await file.text();
      const metadata = this.extractBasicMetadata(file);
      
      const analysis = this.analyzeText(content);
      
      return {
        success: true,
        contentType: CONTENT_TYPES.TEXT,
        content,
        metadata: {
          ...metadata,
          encoding: 'utf-8',
          ...analysis
        },
        structure: this.extractTextStructure(content),
        summary: this.generateSummary(content)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        contentType: CONTENT_TYPES.TEXT
      };
    }
  }

  analyzeText(content) {
    const lines = content.split('\n');
    const words = content.trim().split(/\s+/).filter(w => w.length > 0);
    const characters = content.length;
    
    return {
      lineCount: lines.length,
      wordCount: words.length,
      characterCount: characters,
      averageWordsPerLine: words.length / lines.length,
      language: this.detectLanguage(content)
    };
  }

  extractTextStructure(content) {
    const lines = content.split('\n');
    const structure = {
      headings: [],
      paragraphs: [],
      lists: [],
      codeBlocks: []
    };
    
    let currentParagraph = '';
    let inCodeBlock = false;
    let currentCodeBlock = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detectar headings (markdown)
      if (line.startsWith('#')) {
        const level = line.match(/^#+/)[0].length;
        const text = line.replace(/^#+\s*/, '');
        structure.headings.push({ level, text, lineNumber: i + 1 });
      }
      
      // Detectar code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          structure.codeBlocks.push({
            content: currentCodeBlock,
            language: this.detectCodeLanguage(currentCodeBlock),
            lineNumber: i + 1
          });
          currentCodeBlock = '';
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        continue;
      }
      
      if (inCodeBlock) {
        currentCodeBlock += line + '\n';
        continue;
      }
      
      // Detectar listas
      if (line.match(/^\s*[-*+]\s/) || line.match(/^\s*\d+\.\s/)) {
        structure.lists.push({ text: line, lineNumber: i + 1 });
      }
      
      // Agrupar parágrafos
      if (line.length > 0) {
        currentParagraph += line + ' ';
      } else if (currentParagraph.trim().length > 0) {
        structure.paragraphs.push(currentParagraph.trim());
        currentParagraph = '';
      }
    }
    
    if (currentParagraph.trim().length > 0) {
      structure.paragraphs.push(currentParagraph.trim());
    }
    
    return structure;
  }

  detectLanguage(content) {
    // Detecção simples baseada em palavras comuns
    const sample = content.toLowerCase().substring(0, 1000);
    
    const patterns = {
      'portuguese': ['que', 'para', 'com', 'uma', 'por', 'não', 'são', 'dos', 'mais'],
      'english': ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can'],
      'spanish': ['que', 'para', 'con', 'una', 'por', 'son', 'los', 'más', 'como'],
      'french': ['que', 'pour', 'avec', 'une', 'par', 'sont', 'les', 'plus', 'comme']
    };
    
    let maxScore = 0;
    let detectedLanguage = 'unknown';
    
    for (const [language, words] of Object.entries(patterns)) {
      let score = 0;
      for (const word of words) {
        const regex = new RegExp(`\\b${word}\\b`, 'g');
        const matches = sample.match(regex);
        if (matches) score += matches.length;
      }
      
      if (score > maxScore) {
        maxScore = score;
        detectedLanguage = language;
      }
    }
    
    return detectedLanguage;
  }

  detectCodeLanguage(code) {
    const patterns = {
      'javascript': [/function\s+\w+/, /const\s+\w+\s*=/, /=>/],
      'python': [/def\s+\w+/, /import\s+\w+/, /if\s+__name__/],
      'java': [/public\s+class/, /public\s+static\s+void/, /import\s+java/],
      'cpp': [/#include\s*</, /std::/, /int\s+main/],
      'html': [/<html/, /<div/, /<script/],
      'css': [/\{[^}]*\}/, /\.[a-zA-Z-]+\s*\{/, /#[a-zA-Z-]+\s*\{/]
    };
    
    for (const [language, regexes] of Object.entries(patterns)) {
      if (regexes.some(regex => regex.test(code))) {
        return language;
      }
    }
    
    return 'unknown';
  }

  generateSummary(content) {
    if (this.options.strategy === PARSING_STRATEGIES.METADATA_ONLY) {
      return null;
    }
    
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const maxSentences = Math.min(3, sentences.length);
    
    return sentences.slice(0, maxSentences).join('. ').trim() + '.';
  }
}

/**
 * Parser para arquivos JSON
 */
export class JSONParser extends BaseParser {
  constructor(options = {}) {
    super('json', options);
  }

  canParse(file) {
    const extension = this.getFileExtension(file.name);
    return extension === '.json' || file.type === 'application/json';
  }

  async parse(file) {
    try {
      const content = await file.text();
      const data = JSON.parse(content);
      const metadata = this.extractBasicMetadata(file);
      
      const analysis = this.analyzeJSON(data);
      
      return {
        success: true,
        contentType: CONTENT_TYPES.STRUCTURED_DATA,
        content,
        parsedData: data,
        metadata: {
          ...metadata,
          ...analysis
        },
        structure: this.extractJSONStructure(data),
        summary: this.generateJSONSummary(data)
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro ao parsear JSON: ${error.message}`,
        contentType: CONTENT_TYPES.STRUCTURED_DATA
      };
    }
  }

  analyzeJSON(data) {
    return {
      type: Array.isArray(data) ? 'array' : typeof data,
      depth: this.calculateDepth(data),
      keyCount: this.countKeys(data),
      arrayCount: this.countArrays(data),
      objectCount: this.countObjects(data)
    };
  }

  calculateDepth(obj, currentDepth = 0) {
    if (typeof obj !== 'object' || obj === null) {
      return currentDepth;
    }
    
    let maxDepth = currentDepth;
    
    for (const value of Object.values(obj)) {
      const depth = this.calculateDepth(value, currentDepth + 1);
      maxDepth = Math.max(maxDepth, depth);
    }
    
    return maxDepth;
  }

  countKeys(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return 0;
    }
    
    let count = Object.keys(obj).length;
    
    for (const value of Object.values(obj)) {
      count += this.countKeys(value);
    }
    
    return count;
  }

  countArrays(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return 0;
    }
    
    let count = Array.isArray(obj) ? 1 : 0;
    
    for (const value of Object.values(obj)) {
      count += this.countArrays(value);
    }
    
    return count;
  }

  countObjects(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return 0;
    }
    
    let count = Array.isArray(obj) ? 0 : 1;
    
    for (const value of Object.values(obj)) {
      count += this.countObjects(value);
    }
    
    return count;
  }

  extractJSONStructure(data) {
    const structure = {
      schema: this.generateSchema(data),
      topLevelKeys: Array.isArray(data) ? [] : Object.keys(data),
      dataTypes: this.analyzeDataTypes(data)
    };
    
    return structure;
  }

  generateSchema(obj, path = '') {
    if (typeof obj !== 'object' || obj === null) {
      return typeof obj;
    }
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) return 'array';
      return `array<${this.generateSchema(obj[0], path + '[]')}>`;
    }
    
    const schema = {};
    for (const [key, value] of Object.entries(obj)) {
      schema[key] = this.generateSchema(value, path + '.' + key);
    }
    
    return schema;
  }

  analyzeDataTypes(obj) {
    const types = new Set();
    
    const traverse = (value) => {
      if (value === null) {
        types.add('null');
      } else if (Array.isArray(value)) {
        types.add('array');
        value.forEach(traverse);
      } else if (typeof value === 'object') {
        types.add('object');
        Object.values(value).forEach(traverse);
      } else {
        types.add(typeof value);
      }
    };
    
    traverse(obj);
    return Array.from(types);
  }

  generateJSONSummary(data) {
    if (this.options.strategy === PARSING_STRATEGIES.METADATA_ONLY) {
      return null;
    }
    
    const type = Array.isArray(data) ? 'array' : 'object';
    const size = Array.isArray(data) ? data.length : Object.keys(data).length;
    
    return `JSON ${type} com ${size} ${type === 'array' ? 'elementos' : 'propriedades'}`;
  }
}

/**
 * Parser para arquivos CSV
 */
export class CSVParser extends BaseParser {
  constructor(options = {}) {
    super('csv', options);
    this.delimiter = options.delimiter || ',';
    this.hasHeader = options.hasHeader !== false;
  }

  canParse(file) {
    const extension = this.getFileExtension(file.name);
    return extension === '.csv' || extension === '.tsv' || file.type === 'text/csv';
  }

  async parse(file) {
    try {
      const content = await file.text();
      const metadata = this.extractBasicMetadata(file);
      
      // Auto-detectar delimitador
      const delimiter = this.detectDelimiter(content);
      
      const parsed = this.parseCSV(content, delimiter);
      const analysis = this.analyzeCSV(parsed);
      
      return {
        success: true,
        contentType: CONTENT_TYPES.STRUCTURED_DATA,
        content,
        parsedData: parsed,
        metadata: {
          ...metadata,
          delimiter,
          ...analysis
        },
        structure: this.extractCSVStructure(parsed),
        summary: this.generateCSVSummary(parsed)
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro ao parsear CSV: ${error.message}`,
        contentType: CONTENT_TYPES.STRUCTURED_DATA
      };
    }
  }

  detectDelimiter(content) {
    const delimiters = [',', ';', '\t', '|'];
    const sample = content.split('\n').slice(0, 5).join('\n');
    
    let bestDelimiter = ',';
    let maxCount = 0;
    
    for (const delimiter of delimiters) {
      const count = (sample.match(new RegExp(`\\${delimiter}`, 'g')) || []).length;
      if (count > maxCount) {
        maxCount = count;
        bestDelimiter = delimiter;
      }
    }
    
    return bestDelimiter;
  }

  parseCSV(content, delimiter) {
    const lines = content.trim().split('\n');
    const result = {
      headers: [],
      rows: []
    };
    
    if (lines.length === 0) return result;
    
    // Processar cabeçalho
    if (this.hasHeader) {
      result.headers = this.parseLine(lines[0], delimiter);
      lines.shift();
    } else {
      // Gerar cabeçalhos automáticos
      const firstLine = this.parseLine(lines[0], delimiter);
      result.headers = firstLine.map((_, index) => `Column${index + 1}`);
    }
    
    // Processar linhas
    for (const line of lines) {
      if (line.trim()) {
        const values = this.parseLine(line, delimiter);
        const row = {};
        
        result.headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        
        result.rows.push(row);
      }
    }
    
    return result;
  }

  parseLine(line, delimiter) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current.trim());
    return values;
  }

  analyzeCSV(parsed) {
    return {
      rowCount: parsed.rows.length,
      columnCount: parsed.headers.length,
      hasHeader: this.hasHeader,
      columnTypes: this.analyzeColumnTypes(parsed)
    };
  }

  analyzeColumnTypes(parsed) {
    const types = {};
    
    for (const header of parsed.headers) {
      const values = parsed.rows.map(row => row[header]).filter(v => v !== '');
      types[header] = this.detectColumnType(values);
    }
    
    return types;
  }

  detectColumnType(values) {
    if (values.length === 0) return 'empty';
    
    const sample = values.slice(0, 100); // Amostra de 100 valores
    
    // Verificar se todos são números
    if (sample.every(v => !isNaN(parseFloat(v)) && isFinite(v))) {
      return sample.every(v => Number.isInteger(parseFloat(v))) ? 'integer' : 'float';
    }
    
    // Verificar se são datas
    if (sample.every(v => !isNaN(Date.parse(v)))) {
      return 'date';
    }
    
    // Verificar se são booleanos
    if (sample.every(v => ['true', 'false', '1', '0', 'yes', 'no'].includes(v.toLowerCase()))) {
      return 'boolean';
    }
    
    return 'string';
  }

  extractCSVStructure(parsed) {
    return {
      headers: parsed.headers,
      columnTypes: this.analyzeColumnTypes(parsed),
      sampleRows: parsed.rows.slice(0, 5)
    };
  }

  generateCSVSummary(parsed) {
    if (this.options.strategy === PARSING_STRATEGIES.METADATA_ONLY) {
      return null;
    }
    
    return `CSV com ${parsed.rows.length} linhas e ${parsed.headers.length} colunas`;
  }
}

/**
 * Parser universal que coordena todos os parsers específicos
 */
export class UniversalFileParser {
  constructor(options = {}) {
    this.options = {
      strategy: PARSING_STRATEGIES.SMART,
      quality: EXTRACTION_QUALITY.STANDARD,
      maxConcurrentFiles: 5,
      ...options
    };
    
    this.parsers = [
      new TextParser(this.options),
      new JSONParser(this.options),
      new CSVParser(this.options)
    ];
    
    this.parseQueue = [];
    this.isProcessing = false;
  }

  /**
   * Adicionar parser customizado
   * @param {BaseParser} parser - Parser customizado
   */
  addParser(parser) {
    this.parsers.push(parser);
  }

  /**
   * Encontrar parser adequado para o arquivo
   * @param {File} file - Arquivo
   * @returns {BaseParser|null}
   */
  findParser(file) {
    for (const parser of this.parsers) {
      if (parser.canParse(file)) {
        return parser;
      }
    }
    return null;
  }

  /**
   * Parsear arquivo único
   * @param {File} file - Arquivo
   * @returns {Promise<Object>}
   */
  async parseFile(file) {
    try {
      const parser = this.findParser(file);
      
      if (!parser) {
        return {
          success: false,
          error: 'Nenhum parser disponível para este tipo de arquivo',
          contentType: CONTENT_TYPES.BINARY,
          metadata: parser ? parser.extractBasicMetadata(file) : {}
        };
      }
      
      if (!parser.validateFileSize(file)) {
        return {
          success: false,
          error: 'Arquivo muito grande para processamento',
          contentType: CONTENT_TYPES.BINARY,
          metadata: parser.extractBasicMetadata(file)
        };
      }
      
      const startTime = Date.now();
      const result = await parser.parse(file);
      const processingTime = Date.now() - startTime;
      
      return {
        ...result,
        processingTime,
        parser: parser.constructor.name
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro inesperado: ${error.message}`,
        contentType: CONTENT_TYPES.BINARY
      };
    }
  }

  /**
   * Parsear múltiplos arquivos
   * @param {Array<File>} files - Lista de arquivos
   * @returns {Promise<Array<Object>>}
   */
  async parseFiles(files) {
    const results = [];
    const batches = this.createBatches(files, this.options.maxConcurrentFiles);
    
    for (const batch of batches) {
      const batchPromises = batch.map(file => this.parseFile(file));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  }

  /**
   * Criar lotes de arquivos para processamento
   * @param {Array<File>} files - Arquivos
   * @param {number} batchSize - Tamanho do lote
   * @returns {Array<Array<File>>}
   */
  createBatches(files, batchSize) {
    const batches = [];
    
    for (let i = 0; i < files.length; i += batchSize) {
      batches.push(files.slice(i, i + batchSize));
    }
    
    return batches;
  }

  /**
   * Analisar arquivo sem fazer parsing completo
   * @param {File} file - Arquivo
   * @returns {Object}
   */
  analyzeFile(file) {
    const parser = this.findParser(file);
    
    return {
      canParse: !!parser,
      parser: parser?.constructor.name,
      metadata: parser ? parser.extractBasicMetadata(file) : {},
      estimatedProcessingTime: this.estimateProcessingTime(file),
      supportedStrategies: Object.values(PARSING_STRATEGIES)
    };
  }

  /**
   * Estimar tempo de processamento
   * @param {File} file - Arquivo
   * @returns {number}
   */
  estimateProcessingTime(file) {
    const sizeInMB = file.size / (1024 * 1024);
    const baseTime = 1000; // 1 segundo base
    
    // Estimar baseado no tamanho
    return Math.max(baseTime, sizeInMB * 500);
  }

  /**
   * Obter estatísticas dos parsers
   * @returns {Object}
   */
  getParserStats() {
    return {
      totalParsers: this.parsers.length,
      parserTypes: this.parsers.map(p => p.constructor.name),
      supportedExtensions: this.getSupportedExtensions(),
      queueSize: this.parseQueue.length
    };
  }

  /**
   * Obter extensões suportadas
   * @returns {Array<string>}
   */
  getSupportedExtensions() {
    const extensions = new Set();
    
    for (const parser of this.parsers) {
      if (parser.supportedExtensions) {
        parser.supportedExtensions.forEach(ext => extensions.add(ext));
      }
    }
    
    return Array.from(extensions);
  }
}

// Instância singleton do parser universal
export const universalFileParser = new UniversalFileParser();

export default universalFileParser;
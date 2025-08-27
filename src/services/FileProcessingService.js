/**
 * Serviço de processamento de arquivos agnóstico
 * Suporta múltiplos tipos de arquivo e formatos
 */

// Tipos de arquivo suportados
export const FILE_TYPES = {
  TEXT: 'text',
  CODE: 'code',
  DOCUMENT: 'document',
  IMAGE: 'image',
  AUDIO: 'audio',
  VIDEO: 'video',
  DATA: 'data',
  ARCHIVE: 'archive'
};

// Mapeamento de extensões para tipos
export const FILE_EXTENSIONS = {
  // Texto
  '.txt': FILE_TYPES.TEXT,
  '.md': FILE_TYPES.TEXT,
  '.rtf': FILE_TYPES.TEXT,
  
  // Código
  '.js': FILE_TYPES.CODE,
  '.jsx': FILE_TYPES.CODE,
  '.ts': FILE_TYPES.CODE,
  '.tsx': FILE_TYPES.CODE,
  '.py': FILE_TYPES.CODE,
  '.java': FILE_TYPES.CODE,
  '.cpp': FILE_TYPES.CODE,
  '.c': FILE_TYPES.CODE,
  '.cs': FILE_TYPES.CODE,
  '.php': FILE_TYPES.CODE,
  '.rb': FILE_TYPES.CODE,
  '.go': FILE_TYPES.CODE,
  '.rs': FILE_TYPES.CODE,
  '.html': FILE_TYPES.CODE,
  '.css': FILE_TYPES.CODE,
  '.scss': FILE_TYPES.CODE,
  '.sass': FILE_TYPES.CODE,
  '.json': FILE_TYPES.CODE,
  '.xml': FILE_TYPES.CODE,
  '.yaml': FILE_TYPES.CODE,
  '.yml': FILE_TYPES.CODE,
  '.sql': FILE_TYPES.CODE,
  '.sh': FILE_TYPES.CODE,
  '.bat': FILE_TYPES.CODE,
  '.ps1': FILE_TYPES.CODE,
  
  // Documentos
  '.pdf': FILE_TYPES.DOCUMENT,
  '.doc': FILE_TYPES.DOCUMENT,
  '.docx': FILE_TYPES.DOCUMENT,
  '.xls': FILE_TYPES.DOCUMENT,
  '.xlsx': FILE_TYPES.DOCUMENT,
  '.ppt': FILE_TYPES.DOCUMENT,
  '.pptx': FILE_TYPES.DOCUMENT,
  '.odt': FILE_TYPES.DOCUMENT,
  '.ods': FILE_TYPES.DOCUMENT,
  '.odp': FILE_TYPES.DOCUMENT,
  
  // Imagens
  '.jpg': FILE_TYPES.IMAGE,
  '.jpeg': FILE_TYPES.IMAGE,
  '.png': FILE_TYPES.IMAGE,
  '.gif': FILE_TYPES.IMAGE,
  '.bmp': FILE_TYPES.IMAGE,
  '.svg': FILE_TYPES.IMAGE,
  '.webp': FILE_TYPES.IMAGE,
  '.ico': FILE_TYPES.IMAGE,
  '.tiff': FILE_TYPES.IMAGE,
  '.tif': FILE_TYPES.IMAGE,
  
  // Áudio
  '.mp3': FILE_TYPES.AUDIO,
  '.wav': FILE_TYPES.AUDIO,
  '.flac': FILE_TYPES.AUDIO,
  '.aac': FILE_TYPES.AUDIO,
  '.ogg': FILE_TYPES.AUDIO,
  '.m4a': FILE_TYPES.AUDIO,
  '.wma': FILE_TYPES.AUDIO,
  
  // Vídeo
  '.mp4': FILE_TYPES.VIDEO,
  '.avi': FILE_TYPES.VIDEO,
  '.mkv': FILE_TYPES.VIDEO,
  '.mov': FILE_TYPES.VIDEO,
  '.wmv': FILE_TYPES.VIDEO,
  '.flv': FILE_TYPES.VIDEO,
  '.webm': FILE_TYPES.VIDEO,
  '.m4v': FILE_TYPES.VIDEO,
  
  // Dados
  '.csv': FILE_TYPES.DATA,
  '.tsv': FILE_TYPES.DATA,
  '.jsonl': FILE_TYPES.DATA,
  '.parquet': FILE_TYPES.DATA,
  '.avro': FILE_TYPES.DATA,
  
  // Arquivos
  '.zip': FILE_TYPES.ARCHIVE,
  '.rar': FILE_TYPES.ARCHIVE,
  '.7z': FILE_TYPES.ARCHIVE,
  '.tar': FILE_TYPES.ARCHIVE,
  '.gz': FILE_TYPES.ARCHIVE,
  '.bz2': FILE_TYPES.ARCHIVE
};

/**
 * Classe base para processadores de arquivo
 */
export class BaseFileProcessor {
  constructor(fileType) {
    this.fileType = fileType;
  }

  /**
   * Processar arquivo
   * @param {File|Blob|string} file - Arquivo a ser processado
   * @returns {Promise<Object>} - Resultado do processamento
   */
  async process(file) {
    throw new Error('Método process deve ser implementado pela classe filha');
  }

  /**
   * Validar se pode processar o arquivo
   * @param {File} file - Arquivo
   * @returns {boolean}
   */
  canProcess(file) {
    return this.getSupportedExtensions().some(ext => 
      file.name?.toLowerCase().endsWith(ext)
    );
  }

  /**
   * Obter extensões suportadas
   * @returns {Array<string>}
   */
  getSupportedExtensions() {
    return Object.keys(FILE_EXTENSIONS).filter(
      ext => FILE_EXTENSIONS[ext] === this.fileType
    );
  }

  /**
   * Obter metadados do arquivo
   * @param {File} file - Arquivo
   * @returns {Object}
   */
  getFileMetadata(file) {
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
}

/**
 * Processador para arquivos de texto
 */
export class TextFileProcessor extends BaseFileProcessor {
  constructor() {
    super(FILE_TYPES.TEXT);
  }

  async process(file) {
    try {
      const content = await this.readAsText(file);
      const metadata = this.getFileMetadata(file);
      
      return {
        type: FILE_TYPES.TEXT,
        content,
        metadata,
        wordCount: this.getWordCount(content),
        lineCount: this.getLineCount(content),
        encoding: 'utf-8'
      };
    } catch (error) {
      throw new Error(`Erro ao processar arquivo de texto: ${error.message}`);
    }
  }

  async readAsText(file) {
    if (typeof file === 'string') return file;
    return await file.text();
  }

  getWordCount(text) {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  getLineCount(text) {
    return text.split('\n').length;
  }
}

/**
 * Processador para arquivos de código
 */
export class CodeFileProcessor extends BaseFileProcessor {
  constructor() {
    super(FILE_TYPES.CODE);
  }

  async process(file) {
    try {
      const content = await this.readAsText(file);
      const metadata = this.getFileMetadata(file);
      const language = this.detectLanguage(metadata.extension);
      
      return {
        type: FILE_TYPES.CODE,
        content,
        metadata,
        language,
        lineCount: this.getLineCount(content),
        functions: this.extractFunctions(content, language),
        imports: this.extractImports(content, language),
        complexity: this.calculateComplexity(content)
      };
    } catch (error) {
      throw new Error(`Erro ao processar arquivo de código: ${error.message}`);
    }
  }

  async readAsText(file) {
    if (typeof file === 'string') return file;
    return await file.text();
  }

  getLineCount(text) {
    return text.split('\n').length;
  }

  detectLanguage(extension) {
    const languageMap = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.py': 'python',
      '.java': 'java',
      '.cpp': 'cpp',
      '.c': 'c',
      '.cs': 'csharp',
      '.php': 'php',
      '.rb': 'ruby',
      '.go': 'go',
      '.rs': 'rust',
      '.html': 'html',
      '.css': 'css',
      '.scss': 'scss',
      '.json': 'json',
      '.xml': 'xml',
      '.yaml': 'yaml',
      '.yml': 'yaml',
      '.sql': 'sql'
    };
    
    return languageMap[extension] || 'text';
  }

  extractFunctions(content, language) {
    const functions = [];
    
    // Regex básico para diferentes linguagens
    const patterns = {
      javascript: /(?:function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(|([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[:=]\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>))/g,
      python: /def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g,
      java: /(?:public|private|protected)?\s*(?:static)?\s*(?:[a-zA-Z_$][a-zA-Z0-9_$<>\[]]*\s+)?([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g
    };
    
    const pattern = patterns[language];
    if (pattern) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        functions.push(match[1] || match[2]);
      }
    }
    
    return functions;
  }

  extractImports(content, language) {
    const imports = [];
    
    const patterns = {
      javascript: /(?:import\s+.*?\s+from\s+['"]([^'"]+)['"]|require\s*\(['"]([^'"]+)['"]\))/g,
      python: /(?:from\s+([a-zA-Z_][a-zA-Z0-9_.]*)\s+import|import\s+([a-zA-Z_][a-zA-Z0-9_.]*))/g,
      java: /import\s+([a-zA-Z_][a-zA-Z0-9_.]*);/g
    };
    
    const pattern = patterns[language];
    if (pattern) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        imports.push(match[1] || match[2]);
      }
    }
    
    return imports;
  }

  calculateComplexity(content) {
    // Cálculo simples de complexidade baseado em estruturas de controle
    const complexityKeywords = /\b(if|else|while|for|switch|case|catch|try)\b/g;
    const matches = content.match(complexityKeywords);
    return matches ? matches.length : 0;
  }
}

/**
 * Processador para imagens
 */
export class ImageFileProcessor extends BaseFileProcessor {
  constructor() {
    super(FILE_TYPES.IMAGE);
  }

  async process(file) {
    try {
      const metadata = this.getFileMetadata(file);
      const dataUrl = await this.readAsDataURL(file);
      const dimensions = await this.getImageDimensions(file);
      
      return {
        type: FILE_TYPES.IMAGE,
        dataUrl,
        metadata,
        dimensions,
        format: this.getImageFormat(metadata.extension)
      };
    } catch (error) {
      throw new Error(`Erro ao processar imagem: ${error.message}`);
    }
  }

  async readAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async getImageDimensions(file) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        resolve({ width: 0, height: 0 });
      };
      img.src = URL.createObjectURL(file);
    });
  }

  getImageFormat(extension) {
    const formatMap = {
      '.jpg': 'JPEG',
      '.jpeg': 'JPEG',
      '.png': 'PNG',
      '.gif': 'GIF',
      '.bmp': 'BMP',
      '.svg': 'SVG',
      '.webp': 'WebP'
    };
    
    return formatMap[extension] || 'Unknown';
  }
}

/**
 * Processador para dados estruturados
 */
export class DataFileProcessor extends BaseFileProcessor {
  constructor() {
    super(FILE_TYPES.DATA);
  }

  async process(file) {
    try {
      const content = await this.readAsText(file);
      const metadata = this.getFileMetadata(file);
      const format = this.detectDataFormat(metadata.extension);
      
      let parsedData;
      switch (format) {
        case 'csv':
          parsedData = this.parseCSV(content);
          break;
        case 'json':
          parsedData = JSON.parse(content);
          break;
        case 'jsonl':
          parsedData = this.parseJSONL(content);
          break;
        default:
          parsedData = content;
      }
      
      return {
        type: FILE_TYPES.DATA,
        content,
        parsedData,
        metadata,
        format,
        rowCount: this.getRowCount(parsedData, format),
        columnCount: this.getColumnCount(parsedData, format)
      };
    } catch (error) {
      throw new Error(`Erro ao processar arquivo de dados: ${error.message}`);
    }
  }

  async readAsText(file) {
    if (typeof file === 'string') return file;
    return await file.text();
  }

  detectDataFormat(extension) {
    const formatMap = {
      '.csv': 'csv',
      '.tsv': 'tsv',
      '.json': 'json',
      '.jsonl': 'jsonl'
    };
    
    return formatMap[extension] || 'text';
  }

  parseCSV(content) {
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });
    
    return { headers, rows };
  }

  parseJSONL(content) {
    return content.trim().split('\n').map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return line;
      }
    });
  }

  getRowCount(data, format) {
    if (format === 'csv') return data.rows?.length || 0;
    if (Array.isArray(data)) return data.length;
    return 0;
  }

  getColumnCount(data, format) {
    if (format === 'csv') return data.headers?.length || 0;
    if (Array.isArray(data) && data[0]) return Object.keys(data[0]).length;
    return 0;
  }
}

/**
 * Serviço principal de processamento de arquivos
 */
export class FileProcessingService {
  constructor() {
    this.processors = new Map();
    this.initializeProcessors();
  }

  initializeProcessors() {
    this.processors.set(FILE_TYPES.TEXT, new TextFileProcessor());
    this.processors.set(FILE_TYPES.CODE, new CodeFileProcessor());
    this.processors.set(FILE_TYPES.IMAGE, new ImageFileProcessor());
    this.processors.set(FILE_TYPES.DATA, new DataFileProcessor());
  }

  /**
   * Detectar tipo de arquivo
   * @param {File} file - Arquivo
   * @returns {string} - Tipo do arquivo
   */
  detectFileType(file) {
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    return FILE_EXTENSIONS[extension] || FILE_TYPES.TEXT;
  }

  /**
   * Processar arquivo
   * @param {File} file - Arquivo
   * @returns {Promise<Object>} - Resultado do processamento
   */
  async processFile(file) {
    try {
      const fileType = this.detectFileType(file);
      const processor = this.processors.get(fileType);
      
      if (!processor) {
        throw new Error(`Tipo de arquivo não suportado: ${fileType}`);
      }
      
      if (!processor.canProcess(file)) {
        throw new Error(`Arquivo não pode ser processado pelo processador ${fileType}`);
      }
      
      const result = await processor.process(file);
      
      return {
        success: true,
        fileType,
        result,
        processedAt: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        processedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Processar múltiplos arquivos
   * @param {Array<File>} files - Lista de arquivos
   * @returns {Promise<Array<Object>>} - Resultados do processamento
   */
  async processMultipleFiles(files) {
    const results = [];
    
    for (const file of files) {
      try {
        const result = await this.processFile(file);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          fileName: file.name,
          processedAt: new Date().toISOString()
        });
      }
    }
    
    return results;
  }

  /**
   * Obter tipos de arquivo suportados
   * @returns {Array<string>}
   */
  getSupportedFileTypes() {
    return Object.values(FILE_TYPES);
  }

  /**
   * Obter extensões suportadas
   * @returns {Array<string>}
   */
  getSupportedExtensions() {
    return Object.keys(FILE_EXTENSIONS);
  }

  /**
   * Verificar se arquivo é suportado
   * @param {File} file - Arquivo
   * @returns {boolean}
   */
  isFileSupported(file) {
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    return extension in FILE_EXTENSIONS;
  }
}

// Instância singleton
export const fileProcessingService = new FileProcessingService();

export default fileProcessingService;
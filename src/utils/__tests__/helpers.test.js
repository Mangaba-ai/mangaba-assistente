// Testes básicos para funções utilitárias

describe('Utility Functions', () => {
  test('soma dois números', () => {
    const sum = (a, b) => a + b;
    expect(sum(2, 3)).toBe(5);
  });

  test('verifica se string não está vazia', () => {
    const isNotEmpty = (str) => str && str.trim().length > 0;
    expect(isNotEmpty('teste')).toBe(true);
    expect(isNotEmpty('')).toBeFalsy();
    expect(isNotEmpty('   ')).toBeFalsy();
  });

  test('formata timestamp', () => {
    const formatTimestamp = (date) => {
      return new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    };
    
    const testDate = new Date('2024-01-15T10:30:00Z');
    const formatted = formatTimestamp(testDate);
    expect(formatted).toMatch(/\d{2}:\d{2}/);
  });

  test('gera ID único', () => {
    const generateId = () => {
      return Math.random().toString(36).substr(2, 9);
    };
    
    const id1 = generateId();
    const id2 = generateId();
    
    expect(id1).toBeDefined();
    expect(id2).toBeDefined();
    expect(id1).not.toBe(id2);
    expect(id1.length).toBeGreaterThan(0);
  });

  test('valida email', () => {
    const isValidEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };
    
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
  });

  test('trunca texto longo', () => {
    const truncateText = (text, maxLength) => {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    };
    
    expect(truncateText('Texto curto', 20)).toBe('Texto curto');
    expect(truncateText('Este é um texto muito longo que precisa ser truncado', 20))
      .toBe('Este é um texto muit...');
  });

  test('converte objeto para query string', () => {
    const objectToQueryString = (obj) => {
      return Object.keys(obj)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
        .join('&');
    };
    
    const params = { name: 'João', age: 30, city: 'São Paulo' };
    const queryString = objectToQueryString(params);
    
    expect(queryString).toContain('name=Jo%C3%A3o');
    expect(queryString).toContain('age=30');
    expect(queryString).toContain('city=S%C3%A3o%20Paulo');
  });

  test('debounce function', (done) => {
    const debounce = (func, delay) => {
      let timeoutId;
      return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
      };
    };
    
    let callCount = 0;
    const increment = () => callCount++;
    const debouncedIncrement = debounce(increment, 100);
    
    debouncedIncrement();
    debouncedIncrement();
    debouncedIncrement();
    
    // Deve ser chamado apenas uma vez após o delay
    setTimeout(() => {
      expect(callCount).toBe(1);
      done();
    }, 150);
  });

  test('deep clone object', () => {
    const deepClone = (obj) => {
      if (obj === null || typeof obj !== 'object') return obj;
      if (obj instanceof Date) return new Date(obj.getTime());
      if (obj instanceof Array) return obj.map(item => deepClone(item));
      
      const cloned = {};
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = deepClone(obj[key]);
        }
      }
      return cloned;
    };
    
    const original = {
      name: 'Test',
      nested: {
        value: 42,
        array: [1, 2, 3]
      }
    };
    
    const cloned = deepClone(original);
    
    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned.nested).not.toBe(original.nested);
    expect(cloned.nested.array).not.toBe(original.nested.array);
  });
});
// LLM Client - API calls for code generation guidance
const llmClient = {
  apiKey: null,
  endpoint: null,
  provider: 'custom', // Options: 'grok', 'tinyllama', or custom
  
  // API endpoints for different providers
  endpoints: {
    grok: 'https://api.x.ai/v1/chat/completions',
    // TinyLlama would typically run locally or via HuggingFace
    tinyllama: 'https://api-inference.huggingface.co/models/TinyLlama/TinyLlama-1.1B-Chat-v1.0',
    custom: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?' // User-defined endpoint
  },
  
  // Initialize LLM client
  init() {
    // Load API key from localStorage if available
    this.apiKey = localStorage.getItem('llm_api_key');
    this.provider = localStorage.getItem('llm_provider') || 'grok';
    this.endpoint = this.endpoints[this.provider];
    
    if (!this.apiKey) {
      jeffery.log('No API key configured. Set one in localStorage: llm_api_key', 'error');
    }
  },
  
  // Set API key
  setApiKey(key, provider = 'grok') {
    this.apiKey = key;
    this.provider = provider;
    this.endpoint = this.endpoints[provider];
    
    localStorage.setItem('llm_api_key', key);
    localStorage.setItem('llm_provider', provider);
    
    jeffery.log(`API configured for ${provider}`, 'success');
  },
  
  // Query LLM for code generation
  async query(prompt, options = {}) {
    if (!this.apiKey) {
      jeffery.log('API key required. Use llmClient.setApiKey("your-key")', 'error');
      return null;
    }
    
    try {
      jeffery.log('Querying LLM...');
      
      let response;
      
      // Different request formats for different providers
      if (this.provider === 'grok') {
        response = await this.queryGrok(prompt, options);
      } else if (this.provider === 'tinyllama') {
        response = await this.queryHuggingFace(prompt, options);
      } else {
        response = await this.queryCustom(prompt, options);
      }
      
      return this.extractCode(response);
      
    } catch (error) {
      jeffery.log(`LLM query failed: ${error.message}`, 'error');
      return null;
    }
  },
  
  // Query Grok API
  async queryGrok(prompt, options) {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: 'You are a code generation assistant. Generate only clean, executable JavaScript code without any explanations or markdown formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: options.temperature || 0.3,
        max_tokens: options.maxTokens || 500
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  },
  
  // Query HuggingFace (TinyLlama)
  async queryHuggingFace(prompt, options) {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: options.maxTokens || 500,
          temperature: options.temperature || 0.3,
          return_full_text: false
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data[0].generated_text || data.generated_text;
  },
  
  // Query custom endpoint
  async queryCustom(prompt, options) {
    // Generic implementation - adjust based on your API
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        prompt: prompt,
        ...options
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.response || data.text || data.output;
  },
  
  // Extract clean code from LLM response
  extractCode(response) {
    if (!response) return null;
    
    // Remove markdown code blocks if present
    let code = response.replace(/```javascript\n?/g, '').replace(/```\n?/g, '');
    
    // Remove common explanatory text patterns
    code = code.replace(/Here's.*?:\n/gi, '');
    code = code.replace(/This function.*?\n/gi, '');
    
    // Trim whitespace
    code = code.trim();
    
    return code;
  },
  
  // Test connection
  async test() {
    jeffery.log('Testing LLM connection...');
    const result = await this.query('Create a simple function that returns "Hello, World!"');
    
    if (result) {
      jeffery.log('LLM connection successful!', 'success');
      jeffery.log(`Generated: ${result.substring(0, 100)}...`);
      return true;
    }
    return false;
  }
};

// Initialize on load
window.addEventListener('load', () => {
  llmClient.init();
});

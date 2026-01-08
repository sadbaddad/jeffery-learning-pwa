// Function Builder - Generate and store JS functions using LLM
const functionBuilder = {
  db: null,
  
  // Initialize IndexedDB
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('JefferyDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.updateFunctionCount();
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('functions')) {
          const objectStore = db.createObjectStore('functions', { keyPath: 'name' });
          objectStore.createIndex('created', 'created', { unique: false });
        }
      };
    });
  },
  
  // Learn a new task
  async learnTask(task) {
    jeffery.log(`Learning task: ${task}`);
    
    try {
      // Ask LLM how to implement this task
      const prompt = `Generate a JavaScript function to ${task}. Return ONLY valid JavaScript code for a function named '${this.sanitizeFunctionName(task)}'. No explanations, no markdown, just the function.`;
      
      const code = await llmClient.query(prompt);
      
      if (!code) {
        jeffery.speak('I could not learn that task');
        return;
      }
      
      // Store the function
      await this.storeFunction(task, code);
      
      jeffery.speak(`I have learned how to ${task}`);
      jeffery.log(`Function stored: ${task}`, 'success');
      
      // Try to deploy to scripts folder (if running from GitHub)
      await this.deployFunction(task, code);
      
    } catch (error) {
      jeffery.log(`Learning failed: ${error.message}`, 'error');
      jeffery.speak('I encountered an error while learning');
    }
  },
  
  // Store function in IndexedDB
  async storeFunction(name, code) {
    if (!this.db) {
      await this.init();
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['functions'], 'readwrite');
      const objectStore = transaction.objectStore('functions');
      
      const functionData = {
        name: name,
        code: code,
        created: new Date().toISOString(),
        sanitizedName: this.sanitizeFunctionName(name)
      };
      
      const request = objectStore.put(functionData);
      
      request.onsuccess = () => {
        this.updateFunctionCount();
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  },
  
  // Retrieve a function
  async getFunction(name) {
    if (!this.db) {
      await this.init();
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['functions'], 'readonly');
      const objectStore = transaction.objectStore('functions');
      const request = objectStore.get(name);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },
  
  // List all functions
  async listFunctions() {
    if (!this.db) {
      await this.init();
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['functions'], 'readonly');
      const objectStore = transaction.objectStore('functions');
      const request = objectStore.getAllKeys();
      
      request.onsuccess = () => {
        const functions = request.result;
        if (functions.length === 0) {
          jeffery.speak('I have not learned any functions yet');
        } else {
          const list = functions.join(', ');
          jeffery.speak(`I can: ${list}`);
          jeffery.log(`Functions: ${list}`);
        }
        resolve(functions);
      };
      request.onerror = () => reject(request.error);
    });
  },
  
  // Execute a stored function
  async executeFunction(name, ...args) {
    const funcData = await this.getFunction(name);
    if (!funcData) {
      jeffery.log(`Function not found: ${name}`, 'error');
      return null;
    }
    
    try {
      // Create function from stored code
      const func = new Function('return ' + funcData.code)();
      const result = func(...args);
      jeffery.log(`Executed: ${name}`, 'success');
      return result;
    } catch (error) {
      jeffery.log(`Execution error: ${error.message}`, 'error');
      return null;
    }
  },
  
  // Deploy function to scripts folder (placeholder - would require GitHub API)
  async deployFunction(name, code) {
    // This would use GitHub API to commit to scripts/ folder
    // For now, just log the intent
    jeffery.log(`Function ready for deployment: ${this.sanitizeFunctionName(name)}.js`);
    
    // Future implementation:
    // 1. Authenticate with GitHub
    // 2. Create/update file in scripts/ folder
    // 3. Commit with message
    // 4. Function becomes accessible via GitHub raw URL
  },
  
  // Load function from scripts folder (GitHub raw)
  async loadFromGitHub(functionName) {
    try {
      const url = `https://raw.githubusercontent.com/YOUR_USERNAME/jeffery-learning-pwa/main/scripts/${functionName}.js`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Function not found on GitHub');
      }
      
      const code = await response.text();
      await this.storeFunction(functionName, code);
      jeffery.log(`Loaded function from GitHub: ${functionName}`, 'success');
      
    } catch (error) {
      jeffery.log(`GitHub load failed: ${error.message}`, 'error');
    }
  },
  
  // Sanitize function name for use as identifier
  sanitizeFunctionName(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/^[0-9]/, '_$&')
      .substring(0, 50);
  },
  
  // Update function count in UI
  async updateFunctionCount() {
    if (!this.db) return;
    
    const transaction = this.db.transaction(['functions'], 'readonly');
    const objectStore = transaction.objectStore('functions');
    const request = objectStore.count();
    
    request.onsuccess = () => {
      jeffery.updateFunctionCount(request.result);
    };
  }
};

// Initialize on load
window.addEventListener('load', () => {
  functionBuilder.init();
});
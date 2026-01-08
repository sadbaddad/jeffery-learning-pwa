// Jeffery Core - Voice I/O and Bluetooth Management
const jeffery = {
  recognition: null,
  synthesis: window.speechSynthesis,
  isListening: false,
  bluetoothEnabled: false,
  bluetoothDevice: null,
  
  // Initialize Jeffery
  init() {
    this.log('Jeffery initializing...', 'success');
    this.setupSpeechRecognition();
    this.updateStatus('Ready');
    this.speak('Hello! I am Jeffery, your learning assistant. Ask me to learn something new!');
  },
  
  // Setup Web Speech API for voice recognition
  setupSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      this.log('Speech recognition not supported', 'error');
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';
    
    this.recognition.onstart = () => {
      this.isListening = true;
      document.getElementById('voice-btn').classList.add('listening');
      document.getElementById('voice-btn').textContent = '🎤 Listening...';
      this.log('Listening for command...');
    };
    
    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      this.log(`Heard: "${transcript}"`, 'success');
      this.processCommand(transcript);
    };
    
    this.recognition.onerror = (event) => {
      this.log(`Speech error: ${event.error}`, 'error');
      this.stopListening();
    };
    
    this.recognition.onend = () => {
      this.stopListening();
    };
  },
  
  // Toggle voice listening
  toggleVoice() {
    if (this.isListening) {
      this.recognition.stop();
    } else {
      this.recognition.start();
    }
  },
  
  // Stop listening
  stopListening() {
    this.isListening = false;
    document.getElementById('voice-btn').classList.remove('listening');
    document.getElementById('voice-btn').textContent = '🎤 Tap to Speak';
  },
  
  // Text-to-speech output
  speak(text) {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    this.synthesis.speak(utterance);
    this.log(`Jeffery: ${text}`);
  },
  
  // Process voice commands
  async processCommand(command) {
    const lower = command.toLowerCase();
    
    // Check for learning requests
    if (lower.includes('learn') || lower.includes('how to')) {
      const task = this.extractTask(command);
      if (task) {
        this.speak(`I will learn how to ${task}`);
        await functionBuilder.learnTask(task);
      } else {
        this.speak('What would you like me to learn?');
      }
    }
    // Bluetooth commands
    else if (lower.includes('bluetooth') || lower.includes('connect')) {
      this.toggleBluetooth();
    }
    else if (lower.includes('discover') || lower.includes('find devices')) {
      this.discoverDevices();
    }
    // List functions
    else if (lower.includes('what can you do') || lower.includes('show functions')) {
      await functionBuilder.listFunctions();
    }
    else {
      this.speak('I did not understand that command. Try asking me to learn something.');
    }
  },
  
  // Extract task from command
  extractTask(command) {
    const patterns = [
      /learn (?:how )?to (.+)/i,
      /how to (.+)/i,
      /learn (.+)/i
    ];
    
    for (const pattern of patterns) {
      const match = command.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    return null;
  },
  
  // Bluetooth toggle
  async toggleBluetooth() {
    if (!('bluetooth' in navigator)) {
      this.log('Bluetooth not supported', 'error');
      this.speak('Bluetooth is not supported on this device');
      return;
    }
    
    this.bluetoothEnabled = !this.bluetoothEnabled;
    const btn = document.getElementById('bt-toggle');
    const discoverBtn = document.getElementById('bt-discover');
    
    if (this.bluetoothEnabled) {
      btn.classList.add('active');
      discoverBtn.disabled = false;
      this.updateBluetoothStatus('Enabled');
      this.speak('Bluetooth enabled');
    } else {
      btn.classList.remove('active');
      discoverBtn.disabled = true;
      this.updateBluetoothStatus('Disabled');
      if (this.bluetoothDevice) {
        this.bluetoothDevice.gatt.disconnect();
        this.bluetoothDevice = null;
      }
      this.speak('Bluetooth disabled');
    }
  },
  
  // Discover Bluetooth devices
  async discoverDevices() {
    if (!this.bluetoothEnabled) {
      this.speak('Please enable Bluetooth first');
      return;
    }
    
    try {
      this.log('Scanning for Bluetooth devices...');
      this.speak('Scanning for devices');
      
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'device_information']
      });
      
      this.log(`Found device: ${device.name || 'Unnamed'}`, 'success');
      this.speak(`Found device: ${device.name || 'unnamed device'}`);
      
      await this.connectDevice(device);
    } catch (error) {
      this.log(`Bluetooth error: ${error.message}`, 'error');
      this.speak('Could not find devices');
    }
  },
  
  // Connect to Bluetooth device
  async connectDevice(device) {
    try {
      this.log(`Connecting to ${device.name}...`);
      const server = await device.gatt.connect();
      this.bluetoothDevice = device;
      
      this.updateBluetoothStatus(`Connected: ${device.name}`);
      this.log(`Connected to ${device.name}`, 'success');
      this.speak(`Connected to ${device.name}`);
      
      device.addEventListener('gattserverdisconnected', () => {
        this.log('Device disconnected');
        this.updateBluetoothStatus('Disconnected');
        this.bluetoothDevice = null;
      });
    } catch (error) {
      this.log(`Connection failed: ${error.message}`, 'error');
      this.speak('Connection failed');
    }
  },
  
  // Update UI status
  updateStatus(status) {
    document.getElementById('status').textContent = status;
  },
  
  updateBluetoothStatus(status) {
    document.getElementById('bt-status').textContent = status;
  },
  
  updateFunctionCount(count) {
    document.getElementById('function-count').textContent = count;
  },
  
  // Logging
  log(message, type = 'info') {
    const output = document.getElementById('output');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    output.appendChild(entry);
    output.scrollTop = output.scrollHeight;
  }
};
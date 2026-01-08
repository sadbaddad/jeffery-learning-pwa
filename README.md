# Jeffery - Self-Learning PWA

Jeffery is a mobile-first Progressive Web App that learns new capabilities by asking an LLM API how to implement tasks, then generates and stores JavaScript functions dynamically.

## Features

- **Voice I/O**: Speak commands using Web Speech API (voice recognition + text-to-speech)
- **Bluetooth Support**: Discover and connect to Bluetooth devices
- **Self-Learning**: Ask Jeffery to learn new tasks - he queries an LLM and generates functions
- **Function Storage**: Generated functions stored in IndexedDB for offline access
- **Auto-Deploy**: Functions can be deployed to GitHub scripts folder for sharing
- **Mobile-First**: Optimized for touch and mobile devices
- **Offline-Capable**: Works offline with service worker caching

## Quick Start

### 1. Configure LLM API

Open your browser console and set your API key:

```javascript
// For Grok (X.AI)
llmClient.setApiKey('your-grok-api-key', 'grok');

// For TinyLlama (HuggingFace)
llmClient.setApiKey('your-hf-api-key', 'tinyllama');

// Test connection
await llmClient.test();
```

### 2. Install as PWA

- **Mobile**: Tap browser menu → "Add to Home Screen"
- **Desktop**: Click install icon in address bar

### 3. Voice Commands

Tap the microphone button and try:

- "Learn how to generate a random number"
- "Learn how to format a date"
- "What can you do?"
- "Enable Bluetooth"
- "Discover devices"

## File Structure

```
jeffery-learning-pwa/
├── index.html              # Main PWA interface
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker for offline capability
├── js/
│   ├── jeffery-core.js     # Voice I/O, Bluetooth, core logic
│   ├── function-builder.js # Function generation and IndexedDB storage
│   └── llm-client.js       # LLM API client (Grok/TinyLlama/custom)
└── scripts/                # Auto-deployed functions (GitHub raw URLs)
    └── .gitkeep
```

## How It Works

1. **User speaks command**: "Learn how to calculate fibonacci numbers"
2. **Jeffery extracts task**: "calculate fibonacci numbers"
3. **Queries LLM**: "Generate a JavaScript function to calculate fibonacci numbers"
4. **LLM returns code**: Clean JavaScript function
5. **Stores in IndexedDB**: Function saved with sanitized name
6. **Available for execution**: Can be called anytime, even offline
7. **Optional deploy**: Function can be pushed to scripts/ folder

## LLM Providers

### Grok (Recommended for quality)
- Get API key: https://x.ai/api
- Fast, high-quality code generation
- Requires internet connection

### TinyLlama (Lightweight alternative)
- Get HuggingFace API: https://huggingface.co/settings/tokens
- Smaller model, faster responses
- Lower resource usage

### Custom Endpoint
- Use your own LLM API
- Modify `llmClient.queryCustom()` for your format

## API Configuration

API keys are stored in localStorage:

```javascript
// Set provider and key
llmClient.setApiKey('your-key', 'grok');

// Check current configuration
console.log('Provider:', llmClient.provider);
console.log('Endpoint:', llmClient.endpoint);
```

## Bluetooth Capabilities

Jeffery can discover and connect to Bluetooth devices:

1. Enable Bluetooth
2. Tap "Discover" or say "Find devices"
3. Select device from browser dialog
4. Connection status displayed in UI

Future enhancements:
- Read device battery levels
- Send/receive data
- Control connected devices

## Function Deployment

Functions stored in IndexedDB can be deployed to the `scripts/` folder:

1. Function generated and stored locally
2. GitHub API integration (future feature) commits to scripts/
3. Accessible via GitHub raw URL:
   ```
   https://raw.githubusercontent.com/YOUR_USERNAME/jeffery-learning-pwa/main/scripts/function_name.js
   ```
4. Other Jeffery instances can load shared functions

## Development

### Local Testing

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/jeffery-learning-pwa.git
cd jeffery-learning-pwa

# Serve locally (requires HTTPS for Bluetooth/Speech APIs)
python -m http.server 8000
# Or use any static server with HTTPS support
```

### Browser Requirements

- **Chrome/Edge**: Full support (Speech API, Bluetooth)
- **Safari iOS**: Speech API supported, Bluetooth limited
- **Firefox**: Speech API limited, no Bluetooth

### Vanilla JavaScript Only

No frameworks, no build process. Pure JavaScript for maximum compatibility and minimal overhead.

## Security Notes

- API keys stored in localStorage (unencrypted)
- LLM-generated code executed via `new Function()`
- Review generated functions before production use
- Use HTTPS for Bluetooth and Speech APIs

## Future Enhancements

- [ ] GitHub API integration for auto-deployment
- [ ] Function sharing between Jeffery instances
- [ ] Bluetooth device control functions
- [ ] Voice-triggered function execution
- [ ] Function versioning and rollback
- [ ] Collaborative learning (share functions across users)
- [ ] Visual function editor
- [ ] Function testing framework

## License

MIT License - Feel free to use and modify!

## Contributing

Pull requests welcome! Jeffery is designed to learn and evolve.

---

**Built with vanilla JavaScript | Mobile-first | Voice-enabled | Self-learning**

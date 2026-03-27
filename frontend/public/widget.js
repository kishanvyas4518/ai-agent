(function() {
  function initWidget() {
  // Read config
  const config = window.AIAssistantConfig || {};
  const apiUrl = config.apiUrl || "https://ai-agent-mu-seven.vercel.app/api/public/chat";
  const agentKey = config.agentKey;
  const clientSecret = config.clientSecret;
  const primaryColor = config.color || "#4F46E5";
  const title = config.title || "AI Assistant";

  if (!agentKey || !clientSecret) {
    console.warn("AI Assistant Widget: Missing agentKey or clientSecret in window.AIAssistantConfig");
    return;
  }

  // Inject CSS
  const style = document.createElement('style');
  style.innerHTML = `
    #ai-widget-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    #ai-widget-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: ${primaryColor};
      color: white;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease;
    }
    #ai-widget-button:hover {
      transform: scale(1.05);
    }
    #ai-widget-button svg {
      width: 30px;
      height: 30px;
      fill: currentColor;
    }
    #ai-widget-chat {
      display: none;
      flex-direction: column;
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      overflow: hidden;
      border: 1px solid #e5e7eb;
      animation: ai-widget-slide-up 0.3s ease;
    }
    @keyframes ai-widget-slide-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    #ai-widget-header {
      background-color: ${primaryColor};
      color: white;
      padding: 16px;
      font-weight: 600;
      font-size: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top-left-radius: 12px;
      border-top-right-radius: 12px;
    }
    #ai-widget-close {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 20px;
      line-height: 1;
    }
    #ai-widget-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      background: #f9fafb;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .ai-widget-msg {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.4;
      word-wrap: break-word;
    }
    .ai-widget-msg.user {
      align-self: flex-end;
      background-color: ${primaryColor};
      color: white;
      border-bottom-right-radius: 2px;
    }
    .ai-widget-msg.bot {
      align-self: flex-start;
      background-color: white;
      color: #1f2937;
      border: 1px solid #e5e7eb;
      border-bottom-left-radius: 2px;
    }
    /* Simple markdown formatting overrides */
    .ai-widget-msg.bot p { margin: 0 0 8px 0; }
    .ai-widget-msg.bot p:last-child { margin: 0; }
    .ai-widget-msg.bot strong { font-weight: 600; }
    .ai-widget-msg.bot ul { margin: 4px 0 8px 20px; padding: 0; }

    #ai-widget-input-area {
      padding: 16px;
      background: white;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 8px;
    }
    #ai-widget-input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid #d1d5db;
      border-radius: 20px;
      outline: none;
      font-size: 14px;
      transition: border-color 0.2s;
    }
    #ai-widget-input:focus {
      border-color: ${primaryColor};
    }
    #ai-widget-send {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: ${primaryColor};
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #ai-widget-send:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .ai-widget-typing {
      display: flex;
      gap: 4px;
      padding: 10px 14px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      align-self: flex-start;
      border-bottom-left-radius: 2px;
    }
    .ai-widget-dot {
      width: 6px;
      height: 6px;
      background-color: #9ca3af;
      border-radius: 50%;
      animation: ai-widget-bounce 1.4s infinite ease-in-out both;
    }
    .ai-widget-dot:nth-child(1) { animation-delay: -0.32s; }
    .ai-widget-dot:nth-child(2) { animation-delay: -0.16s; }
    @keyframes ai-widget-bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }
    /* Mobile responsiveness */
    @media (max-width: 480px) {
      #ai-widget-chat {
        position: fixed;
        bottom: 0;
        right: 0;
        width: 100%;
        height: 100%;
        border-radius: 0;
        z-index: 1000000;
        border: none;
      }
      #ai-widget-header {
        border-radius: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // Build DOM
  const container = document.createElement('div');
  container.id = 'ai-widget-container';
  
  container.innerHTML = `
    <div id="ai-widget-chat">
      <div id="ai-widget-header">
        <span id="ai-widget-title">${title}</span>
        <button id="ai-widget-close">&times;</button>
      </div>
      <div id="ai-widget-messages">
        <div class="ai-widget-msg bot">Hi there! How can I assist you today?</div>
      </div>
      <div id="ai-widget-input-area">
        <input type="text" id="ai-widget-input" placeholder="Type your message..." autocomplete="off">
        <button id="ai-widget-send">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
    <button id="ai-widget-button">
      <svg viewBox="0 0 24 24">
        <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
      </svg>
    </button>
  `;
  document.body.appendChild(container);

  // Logic
  const btnOpen = document.getElementById('ai-widget-button');
  const btnClose = document.getElementById('ai-widget-close');
  const chatWindow = document.getElementById('ai-widget-chat');
  const messagesDiv = document.getElementById('ai-widget-messages');
  const inputField = document.getElementById('ai-widget-input');
  const btnSend = document.getElementById('ai-widget-send');

  let isOpen = false;

  btnOpen.addEventListener('click', () => {
    isOpen = !isOpen;
    chatWindow.style.display = isOpen ? 'flex' : 'none';
    if(isOpen) inputField.focus();
  });

  btnClose.addEventListener('click', () => {
    isOpen = false;
    chatWindow.style.display = 'none';
  });

  // Very basic markdown parser to handle bold and newlines
  function parseMarkdown(text) {
    let html = text.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
    html = html.replace(/\\*(.*?)\\*/g, '<em>$1</em>');
    html = html.replace(/\\n/g, '<br/>');
    return html;
  }

  function addMessage(text, sender) {
    const el = document.createElement('div');
    el.className = 'ai-widget-msg ' + sender;
    if (sender === 'bot') {
       el.innerHTML = parseMarkdown(text);
    } else {
       el.textContent = text;
    }
    messagesDiv.appendChild(el);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'ai-widget-typing';
    el.id = 'ai-widget-typing-indicator';
    el.innerHTML = '<div class="ai-widget-dot"></div><div class="ai-widget-dot"></div><div class="ai-widget-dot"></div>';
    messagesDiv.appendChild(el);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  function hideTyping() {
    const el = document.getElementById('ai-widget-typing-indicator');
    if(el) el.remove();
  }

  async function sendMessage() {
    const text = inputField.value.trim();
    if (!text) return;

    inputField.value = '';
    btnSend.disabled = true;
    addMessage(text, 'user');
    showTyping();

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-secret': clientSecret,
          'x-agent-key': agentKey
        },
        body: JSON.stringify({ message: text })
      });

      const data = await response.json();
      hideTyping();
      btnSend.disabled = false;

      if (response.ok && data.reply) {
        // Change title if agent name is provided
        if (data.agentName && config.updateTitle) {
          document.getElementById('ai-widget-title').textContent = data.agentName;
        }
        addMessage(data.reply, 'bot');
      } else {
        addMessage("Sorry, I encountered an error: " + (data.error || "Unknown error"), 'bot');
      }
    } catch (err) {
      hideTyping();
      btnSend.disabled = false;
      addMessage("Network error. Please try again.", 'bot');
    }
  }

  btnSend.addEventListener('click', sendMessage);
  inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  } // End of initWidget

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
})();

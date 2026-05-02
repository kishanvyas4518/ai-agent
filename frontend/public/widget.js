(function () {
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
    }
    #ai-widget-chat {
      display: none;
      flex-direction: column;
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 380px;
      height: 600px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.2);
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
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-top-left-radius: 12px;
      border-top-right-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 2;
    }
    .ai-widget-header-back {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      border-radius: 50%;
      transition: background 0.2s;
    }
    .ai-widget-header-back:hover {
      background: rgba(255,255,255,0.2);
    }
    .ai-widget-avatar {
      width: 40px;
      height: 40px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
    }
    .ai-widget-avatar svg {
      width: 24px;
      height: 24px;
      fill: ${primaryColor};
    }
    .ai-widget-header-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .ai-widget-title-text {
      font-weight: 700;
      font-size: 16px;
      line-height: 1.2;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .ai-widget-subtitle {
      font-size: 12px;
      opacity: 0.9;
      line-height: 1.2;
      margin-top: 2px;
    }
    .ai-widget-header-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .ai-widget-icon-btn {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px;
      border-radius: 50%;
      transition: background 0.2s;
    }
    .ai-widget-icon-btn:hover {
      background: rgba(255,255,255,0.2);
    }

    #ai-widget-messages {
      flex: 1;
      padding: 20px 16px;
      overflow-y: auto;
      background: #f4f5f8;
      display: flex;
      flex-direction: column;
      gap: 16px;
      scroll-behavior: smooth;
    }
    
    .ai-widget-msg-wrapper {
      display: flex;
      flex-direction: column;
      max-width: 85%;
    }
    .ai-widget-msg-wrapper.user {
      align-self: flex-end;
      align-items: flex-end;
    }
    .ai-widget-msg-wrapper.bot {
      align-self: flex-start;
      align-items: flex-start;
    }
    .ai-widget-sender-name {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 4px;
      padding: 0 4px;
    }
    .ai-widget-msg {
      padding: 12px 16px;
      font-size: 14px;
      line-height: 1.5;
      word-wrap: break-word;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    .ai-widget-msg-wrapper.user .ai-widget-msg {
      background-color: ${primaryColor}20; 
      color: #111827;
      border-radius: 16px 16px 4px 16px;
    }
    .ai-widget-msg-wrapper.bot .ai-widget-msg {
      background-color: white;
      color: #1f2937;
      border: 1px solid #e5e7eb;
      border-radius: 16px 16px 16px 4px;
    }
    .ai-widget-timestamp {
      font-size: 11px;
      color: #9ca3af;
      margin-top: 4px;
      padding: 0 4px;
      display: flex;
      justify-content: flex-end;
    }

    /* Simple markdown formatting overrides */
    .ai-widget-msg p { margin: 0 0 8px 0; }
    .ai-widget-msg p:last-child { margin: 0; }
    .ai-widget-msg strong { font-weight: 600; }
    .ai-widget-msg ul { margin: 4px 0 8px 20px; padding: 0; }

    #ai-widget-input-container {
      background: white;
      border-top: 1px solid #e5e7eb;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    #ai-widget-input-wrapper {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 20px;
      padding: 4px 12px;
      transition: border-color 0.2s;
    }
    #ai-widget-input-wrapper:focus-within {
      border-color: ${primaryColor};
      box-shadow: 0 0 0 2px ${primaryColor}20;
    }
    
    #ai-widget-input {
      flex: 1;
      padding: 8px 0;
      border: none;
      outline: none;
      font-size: 14px;
      font-family: inherit;
      resize: none;
      max-height: 120px;
      min-height: 24px;
      overflow-y: auto;
      line-height: 1.4;
      background: transparent;
    }
    #ai-widget-input::-webkit-scrollbar { width: 4px; }
    #ai-widget-input::-webkit-scrollbar-track { background: transparent; }
    #ai-widget-input::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }

    .ai-widget-input-actions {
      display: flex;
      align-items: center;
      gap: 4px;
      padding-bottom: 4px;
    }
    .ai-widget-action-btn {
      background: none;
      border: none;
      color: #6b7280;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      border-radius: 50%;
      transition: all 0.2s;
    }
    .ai-widget-action-btn:hover {
      background: #f3f4f6;
      color: #374151;
    }
    
    #ai-widget-send {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: #dc2626; /* Red styling as requested */
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-bottom: 2px;
      transition: background-color 0.2s, transform 0.1s;
    }
    #ai-widget-send:active {
      transform: scale(0.95);
    }
    #ai-widget-send:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .ai-widget-footer {
      text-align: center;
      font-size: 11px;
      color: #9ca3af;
      padding-bottom: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }
    
    #ai-emoji-picker {
      display: none;
      position: absolute;
      bottom: 70px;
      left: 10px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      padding: 8px;
      grid-template-columns: repeat(6, 1fr);
      gap: 4px;
      z-index: 10;
    }
    .ai-emoji-item {
      cursor: pointer;
      font-size: 20px;
      padding: 4px;
      text-align: center;
      border-radius: 4px;
      transition: background 0.2s;
    }
    .ai-emoji-item:hover {
      background: #f3f4f6;
    }

    .ai-widget-typing {
      display: flex;
      gap: 4px;
      padding: 12px 16px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 16px 16px 16px 4px;
      align-self: flex-start;
      margin-top: 8px;
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
    
    #ai-widget-file-input {
      display: none;
    }

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
        <button class="ai-widget-header-back" id="ai-widget-close" title="Close">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div class="ai-widget-avatar">
          <svg viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v4h-2zm0 6h2v2h-2z"/>
          </svg>
        </div>
        <div class="ai-widget-header-info">
          <span class="ai-widget-title-text" id="ai-widget-title">${title}</span>
          <span class="ai-widget-subtitle">Your virtual assistant</span>
        </div>
        <div class="ai-widget-header-actions">
          <button class="ai-widget-icon-btn" title="Options">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div id="ai-widget-messages">
        <!-- Messages go here -->
      </div>
      
      <div id="ai-widget-input-container">
        <div id="ai-emoji-picker">
          ${['😀','😂','🥰','😎','🤔','👍','🙏','🔥','✨','🎉','👏','💔'].map(e => `<div class="ai-emoji-item">${e}</div>`).join('')}
        </div>
        <div id="ai-widget-input-wrapper">
          <textarea id="ai-widget-input" placeholder="Type your message..." rows="1"></textarea>
          <div class="ai-widget-input-actions">
            <button class="ai-widget-action-btn" id="ai-widget-emoji-btn" title="Add Emoji">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                <line x1="15" y1="9" x2="15.01" y2="9"></line>
              </svg>
            </button>
            <button class="ai-widget-action-btn" id="ai-widget-attach-btn" title="Attach Image">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
              </svg>
            </button>
            <input type="file" id="ai-widget-file-input" accept="image/*">
          </div>
          <button id="ai-widget-send">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
        <div class="ai-widget-footer">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
          Powered by AI Agent
        </div>
      </div>
    </div>
    <button id="ai-widget-button">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2v3" />
        <path d="M4 7h16v11h-6l-4 4v-4H4z" />
        <path d="M2 11v5" />
        <path d="M22 11v5" />
        <circle cx="9" cy="12" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="15" cy="12" r="1.5" fill="currentColor" stroke="none" />
        <path d="M9 16.5c1.5 1.5 4.5 1.5 6 0" />
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
    const btnEmoji = document.getElementById('ai-widget-emoji-btn');
    const emojiPicker = document.getElementById('ai-emoji-picker');
    const btnAttach = document.getElementById('ai-widget-attach-btn');
    const fileInput = document.getElementById('ai-widget-file-input');
    const titleEl = document.getElementById('ai-widget-title');

    let isOpen = false;
    let agentName = title; 

    // Auto-resize textarea
    inputField.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
      if(this.value === '') this.style.height = 'auto';
    });

    // Emoji picker toggle
    btnEmoji.addEventListener('click', (e) => {
      e.stopPropagation();
      emojiPicker.style.display = emojiPicker.style.display === 'grid' ? 'none' : 'grid';
    });
    
    // Close emoji picker on outside click
    document.addEventListener('click', (e) => {
      if (!emojiPicker.contains(e.target) && e.target !== btnEmoji) {
        emojiPicker.style.display = 'none';
      }
    });

    // Insert emoji
    document.querySelectorAll('.ai-emoji-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const emoji = e.target.textContent;
        const start = inputField.selectionStart;
        const end = inputField.selectionEnd;
        inputField.value = inputField.value.substring(0, start) + emoji + inputField.value.substring(end);
        inputField.selectionStart = inputField.selectionEnd = start + emoji.length;
        inputField.focus();
        emojiPicker.style.display = 'none';
        // trigger resize
        inputField.dispatchEvent(new Event('input'));
      });
    });

    // Attach button simulation
    btnAttach.addEventListener('click', () => {
      fileInput.click();
    });
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        addMessage(`[Image Attached: ${e.target.files[0].name}] Note: Image processing is pending backend support.`, 'user');
        e.target.value = '';
      }
    });

    const storageKey = `ai_chat_history_${agentKey}`;

    let chatHistory = [];
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) chatHistory = JSON.parse(saved);
    } catch (e) { }

    function syncHistoryToStorage() {
      localStorage.setItem(storageKey, JSON.stringify(chatHistory));
    }

    btnOpen.addEventListener('click', () => {
      isOpen = !isOpen;
      chatWindow.style.display = isOpen ? 'flex' : 'none';
      if (isOpen) inputField.focus();
    });

    btnClose.addEventListener('click', () => {
      isOpen = false;
      chatWindow.style.display = 'none';
    });

    function parseMarkdown(text) {
      let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
      html = html.replace(/\n/g, '<br/>');
      return html;
    }

    function getCurrentTime() {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function addMessage(text, sender, time = getCurrentTime()) {
      const wrapper = document.createElement('div');
      wrapper.className = 'ai-widget-msg-wrapper ' + sender;
      
      const senderName = document.createElement('div');
      senderName.className = 'ai-widget-sender-name';
      senderName.textContent = sender === 'user' ? 'You' : agentName;
      wrapper.appendChild(senderName);

      const msgEl = document.createElement('div');
      msgEl.className = 'ai-widget-msg';
      if (sender === 'bot') {
        msgEl.innerHTML = parseMarkdown(text);
      } else {
        msgEl.textContent = text;
      }
      wrapper.appendChild(msgEl);

      const timeEl = document.createElement('div');
      timeEl.className = 'ai-widget-timestamp';
      timeEl.textContent = time;
      wrapper.appendChild(timeEl);

      messagesDiv.appendChild(wrapper);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function renderInitialMessages() {
      if (chatHistory.length === 0) {
        addMessage("Hi there! How can I assist you today?", 'bot');
      } else {
        chatHistory.forEach(msg => {
          // Default to current time for history since we didn't save time in DB/storage before
          addMessage(msg.text, msg.role, msg.time || getCurrentTime());
        });
      }
    }

    renderInitialMessages();

    function showTyping() {
      const wrapper = document.createElement('div');
      wrapper.className = 'ai-widget-msg-wrapper bot';
      wrapper.id = 'ai-widget-typing-indicator-wrapper';
      
      const senderName = document.createElement('div');
      senderName.className = 'ai-widget-sender-name';
      senderName.textContent = agentName;
      wrapper.appendChild(senderName);

      const el = document.createElement('div');
      el.className = 'ai-widget-typing';
      el.innerHTML = '<div class="ai-widget-dot"></div><div class="ai-widget-dot"></div><div class="ai-widget-dot"></div>';
      wrapper.appendChild(el);
      
      messagesDiv.appendChild(wrapper);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function hideTyping() {
      const el = document.getElementById('ai-widget-typing-indicator-wrapper');
      if (el) el.remove();
    }

    async function sendMessage() {
      const text = inputField.value.trim();
      if (!text) return;

      inputField.value = '';
      inputField.style.height = 'auto'; // Reset height
      btnSend.disabled = true;
      
      const sendTime = getCurrentTime();
      addMessage(text, 'user', sendTime);
      showTyping();

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-client-secret': clientSecret,
            'x-agent-key': agentKey
          },
          body: JSON.stringify({ message: text, history: chatHistory.map(h => ({ role: h.role, text: h.text })) }) // Only send role/text
        });

        const data = await response.json();
        hideTyping();
        btnSend.disabled = false;
        inputField.focus();

        if (response.ok && data.reply) {
          if (data.agentName && config.updateTitle) {
            agentName = data.agentName;
            titleEl.textContent = agentName;
          }
          const replyTime = getCurrentTime();
          addMessage(data.reply, 'bot', replyTime);
          chatHistory.push({ role: 'user', text: text, time: sendTime });
          chatHistory.push({ role: 'bot', text: data.reply, time: replyTime });
          syncHistoryToStorage();
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
    inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
})();

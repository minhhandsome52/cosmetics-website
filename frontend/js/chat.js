/**
 * Chat Widget for Mihn Cosmetics
 * AI-powered cosmetics consultation chatbot
 */

const ChatWidget = {
    API_URL: 'http://localhost:3000/api/chat',
    chatHistory: [],
    isOpen: false,

    /**
     * Initialize chat widget
     */
    init() {
        this.createWidget();
        this.bindEvents();
        this.loadHistory();
    },

    /**
     * Create widget HTML
     */
    createWidget() {
        const widget = document.createElement('div');
        widget.id = 'chat-widget';
        widget.innerHTML = `
            <!-- Chat Toggle Button -->
            <button class="chat-toggle-btn" id="chatToggle" aria-label="Mở chat tư vấn">
                <i class="fas fa-comments"></i>
                <i class="fas fa-times"></i>
            </button>

            <!-- Chat Window -->
            <div class="chat-window" id="chatWindow">
                <div class="chat-header">
                    <div class="chat-header-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="chat-header-info">
                        <h4>Trợ lý Mihn Cosmetics</h4>
                        <p><i class="fas fa-circle" style="color: #4ade80; font-size: 8px;"></i> Online - Sẵn sàng tư vấn</p>
                    </div>
                </div>

                <div class="chat-messages" id="chatMessages">
                    <div class="chat-welcome">
                        <i class="fas fa-spa"></i>
                        <h5>Xin chào! 👋</h5>
                        <p>Tôi là trợ lý AI của Mihn Cosmetics. Tôi có thể giúp bạn tìm kiếm và tư vấn sản phẩm mỹ phẩm phù hợp.</p>
                    </div>
                </div>

                <div class="chat-suggestions" id="chatSuggestions">
                    <button class="chat-suggestion" data-message="Tôi muốn tìm kem dưỡng da">💧 Kem dưỡng da</button>
                    <button class="chat-suggestion" data-message="Gợi ý sản phẩm cho da dầu">🧴 Da dầu</button>
                    <button class="chat-suggestion" data-message="Son môi bán chạy nhất">💄 Son môi</button>
                </div>

                <div class="chat-input-container">
                    <div class="chat-input-wrapper">
                        <input type="text" class="chat-input" id="chatInput" 
                               placeholder="Nhập câu hỏi của bạn..." 
                               autocomplete="off">
                        <button class="chat-send-btn" id="chatSend" aria-label="Gửi">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(widget);
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Toggle chat
        document.getElementById('chatToggle').addEventListener('click', () => this.toggle());

        // Send message
        document.getElementById('chatSend').addEventListener('click', () => this.sendMessage());
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Quick suggestions
        document.querySelectorAll('.chat-suggestion').forEach(btn => {
            btn.addEventListener('click', () => {
                const message = btn.dataset.message;
                document.getElementById('chatInput').value = message;
                this.sendMessage();
            });
        });
    },

    /**
     * Toggle chat window
     */
    toggle() {
        this.isOpen = !this.isOpen;
        document.getElementById('chatToggle').classList.toggle('active', this.isOpen);
        document.getElementById('chatWindow').classList.toggle('active', this.isOpen);

        if (this.isOpen) {
            document.getElementById('chatInput').focus();
        }
    },

    /**
     * Send message to AI
     */
    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();

        if (!message) return;

        // Clear input
        input.value = '';

        // Hide suggestions after first message
        document.getElementById('chatSuggestions').style.display = 'none';

        // Add user message to UI
        this.addMessage(message, 'user');

        // Show typing indicator
        this.showTyping();

        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    history: this.chatHistory
                })
            });

            const data = await response.json();

            // Remove typing indicator
            this.hideTyping();

            if (data.success) {
                this.addMessage(data.message, 'bot');

                // Update history
                this.chatHistory.push(
                    { role: 'user', content: message },
                    { role: 'assistant', content: data.message }
                );
                this.saveHistory();
            } else {
                this.addMessage(data.message || 'Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại.', 'bot');
            }

        } catch (error) {
            console.error('Chat error:', error);
            this.hideTyping();
            this.addMessage('Không thể kết nối đến server. Vui lòng thử lại sau.', 'bot');
        }
    },

    /**
     * Add message to chat UI
     */
    addMessage(text, sender) {
        const messages = document.getElementById('chatMessages');

        // Remove welcome message on first real message
        const welcome = messages.querySelector('.chat-welcome');
        if (welcome) welcome.remove();

        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${sender}`;
        msgDiv.textContent = text;
        messages.appendChild(msgDiv);

        // Scroll to bottom
        messages.scrollTop = messages.scrollHeight;
    },

    /**
     * Show typing indicator
     */
    showTyping() {
        const messages = document.getElementById('chatMessages');
        const typing = document.createElement('div');
        typing.className = 'typing-indicator';
        typing.id = 'typingIndicator';
        typing.innerHTML = '<span></span><span></span><span></span>';
        messages.appendChild(typing);
        messages.scrollTop = messages.scrollHeight;
    },

    /**
     * Hide typing indicator
     */
    hideTyping() {
        const typing = document.getElementById('typingIndicator');
        if (typing) typing.remove();
    },

    /**
     * Save chat history to localStorage
     */
    saveHistory() {
        // Keep only last 10 messages
        if (this.chatHistory.length > 20) {
            this.chatHistory = this.chatHistory.slice(-20);
        }
        localStorage.setItem('mihn_chat_history', JSON.stringify(this.chatHistory));
    },

    /**
     * Load chat history from localStorage
     */
    loadHistory() {
        const saved = localStorage.getItem('mihn_chat_history');
        if (saved) {
            try {
                this.chatHistory = JSON.parse(saved);
                // Restore messages in UI
                if (this.chatHistory.length > 0) {
                    this.chatHistory.forEach(msg => {
                        this.addMessage(msg.content, msg.role === 'user' ? 'user' : 'bot');
                    });
                    document.getElementById('chatSuggestions').style.display = 'none';
                }
            } catch (e) {
                this.chatHistory = [];
            }
        }
    },

    /**
     * Clear chat history
     */
    clearHistory() {
        this.chatHistory = [];
        localStorage.removeItem('mihn_chat_history');
        document.getElementById('chatMessages').innerHTML = `
            <div class="chat-welcome">
                <i class="fas fa-spa"></i>
                <h5>Xin chào! 👋</h5>
                <p>Tôi là trợ lý AI của Mihn Cosmetics. Tôi có thể giúp bạn tìm kiếm và tư vấn sản phẩm mỹ phẩm phù hợp.</p>
            </div>
        `;
        document.getElementById('chatSuggestions').style.display = 'flex';
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ChatWidget.init();
});

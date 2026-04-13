import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '../utils/api';
import FinoraLogo from '../components/FinoraLogo';

const SUGGESTIONS = [
  "Where should we invest more?",
  "Which region has highest demand?",
  "What is the peak sales period?",
  "Show me financial summary",
  "What are the risk indicators?",
  "Show top performing cities",
];

function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Send initial greeting
    const greeting = {
      role: 'assistant',
      content: "👋 **Welcome to Finora-Co AI Assistant!**\n\nI'm your intelligent financial analyst. I can help you with:\n\n" +
        "- 📊 **Annual report analysis** and key insights\n" +
        "- 📍 **Regional performance** intelligence\n" +
        "- 💰 **Investment recommendations**\n" +
        "- 📈 **Demand trends** and peak periods\n" +
        "- ⚠️ **Risk assessment** and growth indicators\n\n" +
        "Upload reports or load demo data to unlock full capabilities. Ask me anything!",
      timestamp: new Date().toISOString(),
    };
    setMessages([greeting]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (text) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const userMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.sendMessage(messageText, sessionId);
      setSessionId(response.session_id);

      const assistantMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: response.timestamp,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = {
        role: 'assistant',
        content: `⚠️ **Connection Error**\n\nI couldn't process your request. Please ensure the backend is running.\n\n_Error: ${err.message}_`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: "🔄 Chat cleared. How can I help you?",
      timestamp: new Date().toISOString(),
    }]);
    setSessionId(null);
  };

  return (
    <div className="slide-up">
      <div className="chat-container">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-avatar">
            <FinoraLogo size={28} variant="light" />
          </div>
          <div className="chat-header-info">
            <h3>Finora Assistant</h3>
            <span>
              {loading ? '⏳ Thinking...' : '🟢 Online'} • RAG-Powered AI
            </span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={clearChat}
              style={{ color: 'var(--gray-300)', fontSize: '0.78rem' }}
            >
              🗑️ Clear
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div className={`chat-message ${msg.role}`} key={i}>
              <div className="chat-message-avatar">
                {msg.role === 'assistant' ? '🐂' : '👤'}
              </div>
              <div className="chat-message-bubble">
                {msg.role === 'assistant' ? (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p>{children}</p>,
                      strong: ({ children }) => <strong>{children}</strong>,
                      em: ({ children }) => <em>{children}</em>,
                      ul: ({ children }) => <ul>{children}</ul>,
                      ol: ({ children }) => <ol>{children}</ol>,
                      li: ({ children }) => <li>{children}</li>,
                      h1: ({ children }) => <h3>{children}</h3>,
                      h2: ({ children }) => <h3>{children}</h3>,
                      h3: ({ children }) => <h3>{children}</h3>,
                      code: ({ children }) => <code>{children}</code>,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="chat-message assistant">
              <div className="chat-message-avatar">🐂</div>
              <div className="chat-message-bubble">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 2 && (
          <div className="chat-suggestions">
            {SUGGESTIONS.map((suggestion, i) => (
              <button
                key={i}
                className="chat-suggestion"
                onClick={() => sendMessage(suggestion)}
                disabled={loading}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="chat-input-area">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="Ask about investments, demand trends, regional performance..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={loading}
          />
          <button
            className="chat-send-btn"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            {loading ? '⏳' : '➤'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatBot;

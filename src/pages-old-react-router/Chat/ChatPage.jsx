import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, AlertTriangle, ShieldCheck, Trash2, Sparkles, Mic, Image } from 'lucide-react';
import ChatMessage from '../../components/chat/ChatMessage';
import './ChatPage.css';

const ChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [historyLoaded, setHistoryLoaded] = useState(false);
    const messagesEndRef = useRef(null);

    const defaultMessage = {
        id: 1,
        sender: 'ai',
        text: "👋 Hello! I'm **Aarogya AI**, your health assistant.\n\nI can help you:\n• Understand symptoms\n• Explain medical reports\n• Provide diet & wellness tips\n\n⚠️ *I'm an AI assistant, not a doctor. Always consult a healthcare professional for serious concerns.*",
        timestamp: new Date().toISOString()
    };

    // Quick suggestion prompts
    const quickSuggestions = [
        { icon: '💊', text: 'What does this medicine do?', color: '#8B5CF6' },
        { icon: '🩺', text: 'Explain my blood report', color: '#0EA5E9' },
        { icon: '😷', text: 'I have headache and fever', color: '#F59E0B' },
        { icon: '🍎', text: 'Diet tips for better health', color: '#10B981' },
    ];

    // Load chat history on mount
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const res = await fetch('/api/chat-history');
                if (res.ok) {
                    const data = await res.json();
                    if (data.messages && data.messages.length > 0) {
                        const loadedMessages = data.messages.map((msg, idx) => ({
                            id: idx,
                            sender: msg.sender === 'user' ? 'user' : 'ai',
                            text: msg.content,
                            timestamp: msg.createdAt
                        }));
                        setMessages(loadedMessages);
                    } else {
                        setMessages([defaultMessage]);
                    }
                } else {
                    setMessages([defaultMessage]);
                }
            } catch (error) {
                console.error("Failed to load chat history:", error);
                setMessages([defaultMessage]);
            } finally {
                setHistoryLoaded(true);
            }
        };
        loadHistory();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isTyping]);

    // Save messages to server
    useEffect(() => {
        if (!historyLoaded || messages.length === 0) return;

        const saveHistory = async () => {
            try {
                await fetch('/api/chat-history', { method: 'DELETE' });
                const messagesToSave = messages.map(m => ({
                    sender: m.sender,
                    content: m.text
                }));
                await fetch('/api/chat-history', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: messagesToSave })
                });
            } catch (error) {
                console.error("Failed to save chat history:", error);
            }
        };

        const timeout = setTimeout(saveHistory, 2000);
        return () => clearTimeout(timeout);
    }, [messages, historyLoaded]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = {
            id: Date.now(),
            sender: 'user',
            text: input,
            timestamp: new Date().toISOString()
        };

        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInput('');
        setIsTyping(true);

        try {
            const apiMessages = updatedMessages.map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text
            }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: apiMessages })
            });

            if (response.ok) {
                const data = await response.json();
                const aiMsg = {
                    id: Date.now() + 1,
                    sender: 'ai',
                    text: data.reply,
                    timestamp: new Date().toISOString()
                };
                setMessages(prev => [...prev, aiMsg]);
            } else {
                throw new Error("Chat failed");
            }
        } catch (error) {
            console.error("Chat Error", error);
            const errorMsg = {
                id: Date.now() + 1,
                sender: 'ai',
                text: "⚠️ Sorry, I'm having trouble connecting right now. Please try again in a moment.",
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleQuickSuggestion = (text) => {
        setInput(text);
    };

    const handleClearHistory = async () => {
        if (!confirm("Clear all chat history?")) return;
        try {
            await fetch('/api/chat-history', { method: 'DELETE' });
            setMessages([defaultMessage]);
        } catch (error) {
            console.error("Failed to clear history:", error);
        }
    };

    if (!historyLoaded) {
        return (
            <div className="chat-page chat-loading">
                <div className="chat-loading-animation">
                    <div className="chat-loader-ring"></div>
                    <div className="chat-loader-ring"></div>
                    <div className="chat-loader-ring"></div>
                    <div className="chat-loader-core">
                        <span>🤖</span>
                    </div>
                </div>
                <p className="chat-loading-text">Starting Aarogya AI...</p>
            </div>
        );
    }

    return (
        <div className="chat-page">
            {/* Enhanced Header */}
            <div className="chat-header">
                <div className="header-info">
                    <div className="ai-avatar">
                        <span className="avatar-emoji">🤖</span>
                        <span className="pulse-dot"></span>
                    </div>
                    <div className="header-text">
                        <h2>Aarogya AI</h2>
                        <span className="online-badge">
                            <span className="status-dot"></span>
                            Online • Ready to help
                        </span>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn-clear" onClick={handleClearHistory} title="Clear History">
                        <Trash2 size={16} />
                        <span className="btn-text">Clear</span>
                    </button>
                    <div className="security-badge">
                        <ShieldCheck size={14} />
                        <span>Encrypted</span>
                    </div>
                </div>
            </div>

            {/* Disclaimer Banner */}
            <div className="disclaimer-banner">
                <AlertTriangle size={14} />
                <span>AI assistant • Not a substitute for medical advice</span>
            </div>

            {/* Messages Area */}
            <div className="messages-container">
                {messages.map(msg => (
                    <ChatMessage key={msg.id} message={msg} />
                ))}
                {isTyping && (
                    <div className="typing-indicator">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {messages.length <= 1 && (
                <div className="quick-suggestions">
                    <p className="suggestions-label">
                        <Sparkles size={14} /> Try asking:
                    </p>
                    <div className="suggestions-grid">
                        {quickSuggestions.map((suggestion, idx) => (
                            <button
                                key={idx}
                                className="suggestion-chip"
                                onClick={() => handleQuickSuggestion(suggestion.text)}
                                style={{ '--chip-color': suggestion.color }}
                            >
                                <span className="chip-icon">{suggestion.icon}</span>
                                <span className="chip-text">{suggestion.text}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="chat-input-area">
                <div className="input-wrapper">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Describe your symptoms or ask a question..."
                        rows={1}
                    />
                </div>
                <button
                    className="btn-send"
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
};

export default ChatPage;

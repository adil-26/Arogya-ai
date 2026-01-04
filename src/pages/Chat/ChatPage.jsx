import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, AlertTriangle, ShieldCheck, Trash2 } from 'lucide-react';
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
        text: "Hello! I'm Aarogya AI. I can help you understand your symptoms or reports.\n\nPlease note: I am an AI assistant, not a doctor. My advice is for informational purposes only.",
        timestamp: new Date().toISOString()
    };

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

    // Save messages to server when they change (debounced)
    useEffect(() => {
        if (!historyLoaded || messages.length === 0) return;

        const saveHistory = async () => {
            try {
                // First clear old history, then save new
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

        // Debounce save
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
                text: "Sorry, I'm having trouble connecting right now.",
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

    const handleClearHistory = async () => {
        if (!confirm("Clear all chat history?")) return;
        try {
            await fetch('/api/chat-history', { method: 'DELETE' });
            setMessages([defaultMessage]);
        } catch (error) {
            console.error("Failed to clear history:", error);
        }
    };

    const handleFileUpload = () => {
        const userMsg = {
            id: Date.now(),
            sender: 'user',
            text: "Uploaded report for analysis",
            attachment: { name: "blood_test_report.pdf" },
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        setTimeout(() => {
            const aiMsg = {
                id: Date.now() + 1,
                sender: 'ai',
                text: "I've analyzed your blood report. \n\nObservations:\n- **Hemoglobin**: 13.5 g/dL (Normal)\n- **WBC Count**: Slightly elevated (11,000). This might indicate a minor infection.\n\nRecommendation: Please consult a General Physician for a follow-up.",
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 2500);
    }

    if (!historyLoaded) {
        return (
            <div className="chat-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p>Loading chat history...</p>
            </div>
        );
    }

    return (
        <div className="chat-page">
            <div className="chat-header">
                <div className="header-info">
                    <h2>Aarogya AI Assistant</h2>
                    <span className="online-badge">Online</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={handleClearHistory}
                        style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            color: '#EF4444',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.8rem'
                        }}
                    >
                        <Trash2 size={14} /> Clear
                    </button>
                    <div className="security-badge">
                        <ShieldCheck size={16} />
                        <span>Private & Secure</span>
                    </div>
                </div>
            </div>

            <div className="disclaimer-banner">
                <AlertTriangle size={16} />
                <span>Disclaimer: This AI provides health information, not medical diagnosis. Always consult a doctor for serious concerns.</span>
            </div>

            <div className="messages-container">
                {messages.map(msg => (
                    <ChatMessage key={msg.id} message={msg} />
                ))}
                {isTyping && (
                    <div className="typing-indicator">
                        <span>•</span><span>•</span><span>•</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
                <button className="btn-icon attachment-btn" onClick={handleFileUpload} title="Upload Report">
                    <Paperclip size={20} />
                </button>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your symptoms or ask a question..."
                    rows={1}
                />
                <button className="btn-send" onClick={handleSend} disabled={!input.trim() && !isTyping}>
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
};

export default ChatPage;

import React, { useState, useRef, useEffect } from 'react';
import api from '../api/axios';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>(crypto.randomUUID());

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');

    const newMessages: Message[] = [
      ...messages,
      { role: 'user', parts: [{ text: userText }] }
    ];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await api.post('/chat', {
        message: userText,
        sessionId: sessionIdRef.current
      });

      setMessages([
        ...newMessages,
        { role: 'model', parts: [{ text: res.data.reply }] }
      ]);
    } catch (err) 
    {
        console.error('Chat error:', err);
      setMessages([
        ...newMessages,
        { role: 'model', parts: [{ text: 'Sorry, I ran into an error connecting to SafeBank AI.' }] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}>
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="submit-btn"
          style={{ width: '56px', height: '56px', borderRadius: '50%', padding: 0, boxShadow: '0 8px 20px rgba(37, 99, 235, 0.4)' }}
        >
          💬
        </button>
      )}

      {isOpen && (
        <div className="bank-card" style={{ width: '350px', height: '480px', display: 'flex', flexDirection: 'column', padding: '16px' }}>
          {/* Header */}
          <div className="bank-card-header" style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #232d42' }}>
            <div className="bank-card-title-group">
              <div className="bank-card-icon" style={{ width: '32px', height: '32px' }}>🤖</div>
              <div>
                <h4 className="bank-card-title" style={{ fontSize: '15px' }}>SafeBank AI</h4>
                <p className="bank-card-subtitle" style={{ fontSize: '11px' }}>Personal Assistant</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '18px' }}
            >
              ✕
            </button>
          </div>

          {/* Chat Messages Body */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
            <div className="pill" style={{ alignSelf: 'center', margin: '4px 0', fontSize: '11px' }}>
              🔒 End-to-end encrypted session
            </div>

            {messages.length === 0 && (
              <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>
                How can I help you with your account today?
              </p>
            )}

            {messages.map((m, idx) => (
              <div 
                key={idx} 
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  background: m.role === 'user' ? '#2563eb' : '#0f172a',
                  color: '#ffffff',
                  border: m.role === 'model' ? '1px solid #1e293b' : 'none',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  maxWidth: '80%',
                  fontSize: '13px',
                  lineHeight: '1.4'
                }}
              >
                {m.parts[0].text}
              </div>
            ))}

            {loading && (
              <div style={{ alignSelf: 'flex-start', background: '#0f172a', border: '1px solid #1e293b', padding: '8px 12px', borderRadius: '12px', color: '#94a3b8', fontSize: '13px' }}>
                Thinking...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <input
              type="text"
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                padding: '10px',
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#fff',
                outline: 'none',
                fontSize: '13px'
              }}
            />
            <button type="submit" disabled={loading} className="send-btn" style={{ padding: '0 14px' }}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
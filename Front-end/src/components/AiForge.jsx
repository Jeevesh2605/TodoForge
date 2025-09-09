import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Minimize2, Sparkles, Bot, User } from 'lucide-react';

const AiForgeChatbox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: 'Welcome to AI-Forge! How can I help you with your tasks and productivity today?', sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const API_URL = 'http://todoforge-env.eba-y7mayiri.ap-south-1.elasticbeanstalk.com/api/ai/chat';
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isLoading) return;
    
    const newUserMessage = { id: messages.length + 1, text: inputValue, sender: 'user' };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: inputValue,
          conversationHistory: messages.slice(-10)
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const botResponse = data.message;

      const newBotMessage = { 
        id: updatedMessages.length + 1, 
        text: botResponse, 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, newBotMessage]);
    } catch (error) {
      console.error('Error calling AI API:', error);
      const errorMessage = { 
        id: messages.length + 2, 
        text: 'Sorry, I encountered an error. Please try again.', 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
      fontFamily: 'Arial, sans-serif'
    }}>
      {isOpen ? (
        <div style={{
          width: '350px',
          height: '500px',
          backgroundColor: '#1f2937', // Dark theme background
          borderRadius: '10px',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #374151'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #d946ef, #8b5cf6)',
            color: 'white',
            padding: '15px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0 }}>AI-Forge Chat</h3>
            <button 
              onClick={toggleChat}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer'
              }}
            >
              _
            </button>
          </div>
          
          <div style={{
            flex: 1,
            padding: '15px',
            overflowY: 'auto',
            backgroundColor: '#111827'
          }}>
            {messages.map((message) => (
              <div 
                key={message.id}
                style={{
                  marginBottom: '10px',
                  textAlign: message.sender === 'user' ? 'right' : 'left'
                }}
              >
                <div style={{
                  display: 'inline-block',
                  padding: '8px 12px',
                  borderRadius: message.sender === 'user' 
                    ? '15px 15px 0 15px' 
                    : '15px 15px 15px 0',
                  background: message.sender === 'user' 
                    ? 'linear-gradient(135deg, #d946ef, #8b5cf6)'
                    : '#374151',
                  color: 'white',
                  maxWidth: '80%'
                }}>
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ textAlign: 'left', marginBottom: '10px' }}>
                <div style={{
                  display: 'inline-block',
                  padding: '8px 12px',
                  borderRadius: '15px 15px 15px 0',
                  backgroundColor: '#374151',
                  color: 'white',
                  maxWidth: '80%'
                }}>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#9ca3af',
                      animation: 'bounce 1.4s infinite ease-in-out'
                    }}></div>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#9ca3af',
                      animation: 'bounce 1.4s infinite ease-in-out',
                      animationDelay: '0.2s'
                    }}></div>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#9ca3af',
                      animation: 'bounce 1.4s infinite ease-in-out',
                      animationDelay: '0.4s'
                    }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div style={{
            padding: '10px',
            borderTop: '1px solid #374151',
            display: 'flex',
            backgroundColor: '#1f2937'
          }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '10px',
                border: '1px solid #374151',
                borderRadius: '20px',
                outline: 'none',
                marginRight: '10px',
                opacity: isLoading ? 0.7 : 1,
                backgroundColor: '#374151',
                color: 'white'
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              style={{
                background: isLoading 
                  ? 'linear-gradient(135deg, #d946ef80, #8b5cf680)' 
                  : 'linear-gradient(135deg, #d946ef, #8b5cf6)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isLoading ? (
                <div style={{ 
                  width: '16px', 
                  height: '16px', 
                  border: '2px solid rgba(255,255,255,0.3)', 
                  borderTop: '2px solid white', 
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={toggleChat}
          style={{
            background: 'linear-gradient(135deg, #d946ef, #8b5cf6)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            cursor: 'pointer',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        div::-webkit-scrollbar {
          width: 6px;
        }
        div::-webkit-scrollbar-track {
          background: #1f2937;
        }
        div::-webkit-scrollbar-thumb {
          background: #6b7280;
          border-radius: 3px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default AiForgeChatbox;
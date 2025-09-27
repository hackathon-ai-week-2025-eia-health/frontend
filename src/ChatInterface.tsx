import React, { useState, useRef, useEffect } from 'react';
import { useAnamnesisChat } from './useAnamnesisChat';

interface ChatInterfaceProps {
  onBack?: () => void;
  onSignOut?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onBack, onSignOut }) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    streamingMessage,
    isConnected,
    isLoading,
    sendMessage,
    clearChat
  } = useAnamnesisChat();

  // Auto-scroll al final cuando lleguen nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading) {
      sendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#f7fbfd',
      fontFamily: 'Inter, Arial, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        background: '#fff',
        padding: '16px 24px',
        borderBottom: '1px solid #e3f0f7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 4px rgba(24, 59, 86, 0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                marginRight: '12px',
                color: '#183b56',
              }}
            >
              ←
            </button>
          )}
          <div>
            <h2 style={{
              color: '#183b56',
              fontSize: '20px',
              margin: 0,
              fontWeight: 600,
            }}>
              Asistente de Anamnesis
            </h2>
            <p style={{
              color: isConnected ? '#10b981' : '#ef4444',
              fontSize: '14px',
              margin: 0,
              marginTop: '4px',
            }}>
              {isConnected ? '● Conectado' : '● Desconectado'}
            </p>
          </div>
        </div>
        
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <button
            onClick={clearChat}
            style={{
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer',
              color: '#6b7280',
              fontSize: '14px',
            }}
          >
            Limpiar chat
          </button>
          {onSignOut && (
            <button
              onClick={onSignOut}
              style={{
                background: '#fee2e2',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                cursor: 'pointer',
                color: '#dc2626',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Cerrar sesion
            </button>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        {messages.length === 0 && !streamingMessage && (
          <div style={{
            textAlign: 'center',
            color: '#6b7280',
            marginTop: '40px',
          }}>
            <div style={{
              background: '#e3f0f7',
              borderRadius: '50%',
              width: 80,
              height: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              💬
            </div>
            <h3 style={{ color: '#183b56', marginBottom: '8px' }}>
              ¡Hola! Soy tu asistente médico
            </h3>
            <p style={{ margin: 0 }}>
              Puedes hacerme preguntas sobre síntomas, condiciones médicas o buscar orientación general de salud.
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '70%',
                background: message.role === 'user' 
                  ? 'linear-gradient(90deg, #6ec1e4 0%, #4a90e2 100%)' 
                  : message.isError 
                    ? '#fee2e2'
                    : '#fff',
                color: message.role === 'user' 
                  ? '#fff' 
                  : message.isError 
                    ? '#dc2626'
                    : '#183b56',
                padding: '12px 16px',
                borderRadius: message.role === 'user' 
                  ? '18px 18px 4px 18px' 
                  : '18px 18px 18px 4px',
                boxShadow: '0 2px 8px rgba(24, 59, 86, 0.08)',
                wordWrap: 'break-word',
              }}
            >
              <div style={{ 
                whiteSpace: 'pre-wrap',
                lineHeight: '1.5',
              }}>
                {message.content}
              </div>
              <div style={{
                fontSize: '12px',
                opacity: 0.7,
                marginTop: '4px',
                textAlign: 'right',
              }}>
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {/* Streaming Message */}
        {streamingMessage && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              maxWidth: '70%',
              background: '#fff',
              color: '#183b56',
              padding: '12px 16px',
              borderRadius: '18px 18px 18px 4px',
              boxShadow: '0 2px 8px rgba(24, 59, 86, 0.08)',
              wordWrap: 'break-word',
            }}>
              <div style={{ 
                whiteSpace: 'pre-wrap',
                lineHeight: '1.5',
              }}>
                {streamingMessage}
                <span style={{ 
                  animation: 'blink 1s infinite',
                  marginLeft: '2px',
                }}>|</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} style={{
        background: '#fff',
        padding: '20px',
        borderTop: '1px solid #e3f0f7',
        display: 'flex',
        gap: '12px',
      }}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={isLoading ? 'Esperando respuesta...' : 'Escribe tu pregunta aquí...'}
          disabled={isLoading || !isConnected}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '2px solid #e3f0f7',
            borderRadius: '24px',
            fontSize: '16px',
            outline: 'none',
            background: isLoading || !isConnected ? '#f9fafb' : '#fff',
            color: '#183b56',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#6ec1e4';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e3f0f7';
          }}
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading || !isConnected}
          style={{
            background: (!inputMessage.trim() || isLoading || !isConnected)
              ? '#d1d5db'
              : 'linear-gradient(90deg, #6ec1e4 0%, #4a90e2 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '24px',
            padding: '12px 20px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: (!inputMessage.trim() || isLoading || !isConnected) 
              ? 'not-allowed' 
              : 'pointer',
            minWidth: '80px',
          }}
        >
          {isLoading ? '...' : 'Enviar'}
        </button>
      </form>

      {/* CSS for blinking cursor */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
        `
      }} />
    </div>
  );
};

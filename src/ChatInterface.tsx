import React, { useState, useRef, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { useAnamnesisChat } from './useAnamnesisChat';

interface ChatInterfaceProps {
  onBack?: () => void;
  onSignOut?: () => void;
  userEmail?: string;
}

// Estilos minimalistas médicos consistentes con App.tsx
const containerStyle: CSSProperties = {
  minHeight: '100vh',
  background: '#f7fbfd',
  display: 'flex',
  flexDirection: 'column',
  fontFamily: 'Inter, Arial, sans-serif',
};

const cardStyle: CSSProperties = {
  background: '#fff',
  borderRadius: 20,
  boxShadow: '0 2px 12px rgba(24, 59, 86, 0.07)',
  padding: '32px 28px',
  margin: '0 16px',
};

const titleStyle: CSSProperties = {
  color: '#183b56',
  fontWeight: 700,
  fontSize: 36,
  marginBottom: 24,
  textAlign: 'center',
};

const sectionTitleStyle: CSSProperties = {
  fontWeight: 700,
  fontSize: 22,
  color: '#183b56',
};

const paragraphStyle: CSSProperties = {
  color: '#183b56',
  fontSize: 17,
  marginTop: 8,
  marginBottom: 0,
  lineHeight: 1.5,
};

const buttonStyle: CSSProperties = {
  background: 'linear-gradient(90deg, #6ec1e4 0%, #4a90e2 100%)',
  color: '#fff',
  fontWeight: 600,
  fontSize: 16,
  border: 'none',
  borderRadius: 30,
  padding: '12px 24px',
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(24, 59, 86, 0.08)',
  transition: 'background 0.2s',
};

const iconWrapperStyle: CSSProperties = {
  background: '#e3f0f7',
  borderRadius: '50%',
  width: 64,
  height: 64,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 16,
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onBack, onSignOut, userEmail }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [hasConsent, setHasConsent] = useState(false);
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
    <div style={containerStyle}>
      {/* Header */}
      <div style={{
        background: '#fff',
        padding: '20px 24px',
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
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={iconWrapperStyle}>
              <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="32" fill="#b3d4e6" />
                <rect x="28" y="16" width="8" height="32" rx="4" fill="#fff" />
                <rect x="16" y="28" width="32" height="8" rx="4" fill="#fff" />
              </svg>
            </div>
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
            <>
              {userEmail && (
                <span style={{
                  color: '#6b7280',
                  fontSize: '14px',
                  marginRight: '8px',
                }}>
                  {userEmail}
                </span>
              )}
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
            </>
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
        {messages.length === 0 && !streamingMessage && !hasConsent && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 16px',
            flex: 1,
          }}>
            <div style={{
              background: '#e3f0f7',
              borderRadius: '50%',
              width: 120,
              height: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 32,
            }}>
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="32" fill="#b3d4e6" />
                <rect x="28" y="16" width="8" height="32" rx="4" fill="#fff" />
                <rect x="16" y="28" width="32" height="8" rx="4" fill="#fff" />
              </svg>
            </div>
            <h1 style={titleStyle}>Consentimiento Informado</h1>

            <div style={{...cardStyle, maxWidth: 600, textAlign: 'left'}}>
              <div style={{ marginBottom: 18 }}>
                <span style={sectionTitleStyle}>Aclaración del Agente y Propósito</span>
                <p style={paragraphStyle}>
                  Soy un asistente de inteligencia artificial diseñado para realizar anamnesis básicas y recopilar información médica de manera estructurada. Mi propósito es ayudarte a organizar tu información de salud y ofrecer orientación general.
                </p>
              </div>

              <div style={{ marginBottom: 18 }}>
                <span style={{...sectionTitleStyle, color: '#dc2626'}}>⚠️ Limitaciones Importantes</span>
                <p style={{...paragraphStyle, color: '#dc2626'}}>
                  <strong>Esta interacción NO sustituye la atención médica profesional.</strong> No realizo diagnósticos definitivos ni prescribo tratamientos. Siempre consulta con un profesional de la salud para evaluación y tratamiento adecuados.
                </p>
              </div>

              <div style={{ marginBottom: 18 }}>
                <span style={sectionTitleStyle}>Alcance de la Interacción</span>
                <p style={paragraphStyle}>
                  Realizaré una <strong>anamnesis básica</strong> para recopilar tu información médica y proporcionaré una <strong>estimación probabilística</strong> basada en los datos que compartas. Los resultados son orientativos y requieren validación médica profesional.
                </p>
              </div>

              <div>
                <span style={sectionTitleStyle}>🔒 Manejo de Datos</span>
                <p style={paragraphStyle}>
                  Tu información se maneja únicamente durante esta sesión. <strong>Todos los datos se eliminan automáticamente al finalizar la conversación.</strong> No se almacenan registros permanentes de tu información médica personal.
                </p>
              </div>
            </div>

            <div style={{
              textAlign: 'center',
              marginTop: 24,
            }}>
              <p style={{...paragraphStyle, textAlign: 'center', marginBottom: 20}}>
                <strong>¿Deseas continuar con la anamnesis?</strong>
              </p>
              <p style={{...paragraphStyle, fontSize: 15, textAlign: 'center', marginBottom: 24}}>
                Al aceptar, confirmas que has leído y entendido las condiciones anteriores.
              </p>
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}>
                <button
                  onClick={() => setHasConsent(true)}
                  style={{
                    ...buttonStyle,
                    background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                  }}
                  onMouseOver={(event) => {
                    event.currentTarget.style.background = 'linear-gradient(90deg, #059669 0%, #10b981 100%)';
                  }}
                  onMouseOut={(event) => {
                    event.currentTarget.style.background = 'linear-gradient(90deg, #10b981 0%, #059669 100%)';
                  }}
                >
                  Acepto y Continúo
                </button>
                <button
                  onClick={() => {
                    if (onSignOut) {
                      onSignOut();
                    }
                  }}
                  style={{
                    ...buttonStyle,
                    background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
                  }}
                  onMouseOver={(event) => {
                    event.currentTarget.style.background = 'linear-gradient(90deg, #dc2626 0%, #ef4444 100%)';
                  }}
                  onMouseOut={(event) => {
                    event.currentTarget.style.background = 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)';
                  }}
                >
                  No Acepto
                </button>
              </div>
            </div>
          </div>
        )}

        {messages.length === 0 && !streamingMessage && hasConsent && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 16px',
            flex: 1,
          }}>
            <div style={{
              background: '#e3f0f7',
              borderRadius: '50%',
              width: 120,
              height: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 32,
            }}>
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="32" fill="#b3d4e6" />
                <rect x="28" y="16" width="8" height="32" rx="4" fill="#fff" />
                <rect x="16" y="28" width="32" height="8" rx="4" fill="#fff" />
              </svg>
            </div>
            <h1 style={titleStyle}>Bienvenido a tu Anamnesis Digital</h1>
            <p style={{...paragraphStyle, textAlign: 'center', marginBottom: 32, maxWidth: 600}}>
              Una anamnesis es la recopilación sistemática de información médica que me ayudará a entender mejor tu situación de salud actual.
            </p>

            <div style={{...cardStyle, maxWidth: 700, textAlign: 'left'}}>
              <div style={{ marginBottom: 18 }}>
                <span style={sectionTitleStyle}>📋 Información que necesito recopilar</span>
                <div style={{ marginTop: 16 }}>
                  <p style={{...paragraphStyle, fontSize: 15}}>
                    <strong>• Motivo de Consulta:</strong> ¿Qué te trae hoy aquí?
                  </p>
                  <p style={{...paragraphStyle, fontSize: 15}}>
                    <strong>• Enfermedad Actual:</strong> Síntoma principal, inicio, características
                  </p>
                  <p style={{...paragraphStyle, fontSize: 15}}>
                    <strong>• Antecedentes Personales:</strong> Enfermedades previas, cirugías, alergias
                  </p>
                  <p style={{...paragraphStyle, fontSize: 15}}>
                    <strong>• Antecedentes Familiares:</strong> Enfermedades en familiares directos
                  </p>
                  <p style={{...paragraphStyle, fontSize: 15}}>
                    <strong>• Hábitos de Vida:</strong> Tabaquismo, alcohol, ejercicio, dieta
                  </p>
                  <p style={{...paragraphStyle, fontSize: 15, marginBottom: 0}}>
                    <strong>• Síntomas Asociados:</strong> Otros síntomas relacionados
                  </p>
                </div>
              </div>
            </div>

            <div style={{
              textAlign: 'center',
              marginTop: 24,
            }}>
              <p style={{...paragraphStyle, textAlign: 'center', marginBottom: 8}}>
                <strong>¡Comencemos!</strong> Puedes contarme sobre tu consulta de forma natural.
              </p>
              <p style={{...paragraphStyle, fontSize: 15, textAlign: 'center', color: '#6b7280', fontStyle: 'italic'}}>
                Ejemplo: "Tengo dolor en el pecho desde ayer, es constante y me da mareo..."
              </p>
            </div>
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

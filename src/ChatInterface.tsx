import React, { useState, useRef, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { useAnamnesisChat } from './useAnamnesisChat';

interface ChatInterfaceProps {
  onBack?: () => void;
  onSignOut?: () => void;
  userEmail?: string;
}

// Estilos minimalistas médicos consistentes con App.tsx

const cardStyle: CSSProperties = {
  background: '#fff',
  borderRadius: 20,
  boxShadow: '0 2px 12px rgba(24, 59, 86, 0.07)',
  padding: '32px 28px',
  margin: '0 auto',
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
  transition: 'all 0.3s ease',
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
    isThinking,
    sendMessage,
    clearChat,
    connect
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
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={{
        height: '100vh',
        background: '#f7fbfd',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, Arial, sans-serif',
        margin: 0,
        padding: 0,
        overflow: 'hidden', // Evita el scroll en el contenedor principal
      }}>
      {/* Header Fijo */}
      <div style={{
        background: '#fff',
        padding: '20px 24px',
        borderBottom: '1px solid #e3f0f7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 4px rgba(24, 59, 86, 0.05)',
        flexShrink: 0, // No se comprime
        zIndex: 10,
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
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                <p style={{
                  color: isConnected ? '#10b981' : '#ef4444',
                  fontSize: '14px',
                  margin: 0,
                }}>
                  {isConnected ? '● Conectado' : '● Desconectado'}
                </p>
                {!isConnected && (
                  <button
                    onClick={() => {
                      console.log('🔄 Reconectando manualmente...');
                      connect();
                    }}
                    style={{
                      background: '#183b56',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      fontSize: '10px',
                      marginLeft: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    Reconectar
                  </button>
                )}
              </div>
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

      {/* Messages Container - Área con scroll independiente */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        minHeight: 0, // Importante para que funcione el flex correctamente
      }}>
        {messages.length === 0 && !streamingMessage && !hasConsent && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '40px 20px',
            overflowY: 'auto',
            height: '100%',
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
                <path d="M32 16L28 20H24V44H40V20H36L32 16ZM32 19L34 21H38V42H26V21H30L32 19Z" fill="#183b56"/>
                <circle cx="32" cy="28" r="2" fill="#183b56"/>
                <rect x="29" y="32" width="6" height="2" fill="#183b56"/>
                <rect x="29" y="36" width="6" height="2" fill="#183b56"/>
              </svg>
            </div>
            <h1 style={titleStyle}>Consentimiento Informado</h1>

            <div style={{...cardStyle, maxWidth: 700, textAlign: 'left'}}>
              <div style={{ marginBottom: 24 }}>
                <span style={{...sectionTitleStyle, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px'}}>
                  🩺 Aclaración del Agente y Propósito
                </span>
                <p style={{...paragraphStyle, background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0'}}>
                  Soy un asistente de inteligencia artificial diseñado para realizar anamnesis básicas y recopilar información médica de manera estructurada. Mi propósito es ayudarte a organizar tu información de salud y ofrecer orientación general.
                </p>
              </div>

              <div style={{ marginBottom: 24 }}>
                <span style={{...sectionTitleStyle, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#dc2626'}}>
                  ⚠️ Limitaciones Importantes
                </span>
                <p style={{...paragraphStyle, background: '#fef2f2', padding: '16px', borderRadius: '12px', border: '1px solid #fecaca', color: '#dc2626'}}>
                  <strong>Esta interacción NO sustituye la atención médica profesional.</strong> No realizo diagnósticos definitivos ni prescribo tratamientos. Siempre consulta con un profesional de la salud para evaluación y tratamiento adecuados.
                </p>
              </div>

              <div style={{ marginBottom: 24 }}>
                <span style={{...sectionTitleStyle, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px'}}>
                  📊 Alcance de la Interacción
                </span>
                <p style={{...paragraphStyle, background: '#f0f9ff', padding: '16px', borderRadius: '12px', border: '1px solid #bae6fd'}}>
                  Realizaré una <strong>anamnesis básica</strong> para recopilar tu información médica y proporcionaré una <strong>estimación probabilística</strong> basada en los datos que compartas. Los resultados son orientativos y requieren validación médica profesional.
                </p>
              </div>

              <div style={{ marginBottom: 0 }}>
                <span style={{...sectionTitleStyle, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px'}}>
                  🔒 Privacidad y Manejo de Datos
                </span>
                <p style={{...paragraphStyle, background: '#f0fdf4', padding: '16px', borderRadius: '12px', border: '1px solid #bbf7d0'}}>
                  Tu información se maneja únicamente durante esta sesión. <strong>Todos los datos se eliminan automáticamente al finalizar la conversación.</strong> No se almacenan registros permanentes de tu información médica personal.
                </p>
              </div>
            </div>

            <div style={{
              ...cardStyle,
              maxWidth: 700,
              marginTop: 24,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              border: '2px solid #cbd5e1',
            }}>
              <p style={{...paragraphStyle, textAlign: 'center', marginBottom: 16, fontSize: 18, fontWeight: 600}}>
                ¿Deseas continuar con la anamnesis?
              </p>
              <p style={{...paragraphStyle, fontSize: 15, textAlign: 'center', marginBottom: 24, color: '#64748b'}}>
                Al aceptar, confirmas que has leído y entendido las condiciones anteriores.
              </p>
              <div style={{
                display: 'flex',
                gap: '16px',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}>
                <button
                  onClick={() => setHasConsent(true)}
                  style={{
                    ...buttonStyle,
                    background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                    fontSize: 16,
                    fontWeight: 700,
                    padding: '14px 32px',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                  }}
                  onMouseOver={(event) => {
                    event.currentTarget.style.background = 'linear-gradient(90deg, #059669 0%, #10b981 100%)';
                    event.currentTarget.style.transform = 'translateY(-2px)';
                    event.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.3)';
                  }}
                  onMouseOut={(event) => {
                    event.currentTarget.style.background = 'linear-gradient(90deg, #10b981 0%, #059669 100%)';
                    event.currentTarget.style.transform = 'translateY(0px)';
                    event.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.2)';
                  }}
                >
                  ✓ Acepto y Continúo
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
                    fontSize: 16,
                    fontWeight: 700,
                    padding: '14px 32px',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                  }}
                  onMouseOver={(event) => {
                    event.currentTarget.style.background = 'linear-gradient(90deg, #dc2626 0%, #ef4444 100%)';
                    event.currentTarget.style.transform = 'translateY(-2px)';
                    event.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.3)';
                  }}
                  onMouseOut={(event) => {
                    event.currentTarget.style.background = 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)';
                    event.currentTarget.style.transform = 'translateY(0px)';
                    event.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)';
                  }}
                >
                  ✗ No Acepto
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
            justifyContent: 'flex-start',
            padding: '40px 20px',
            overflowY: 'auto',
            height: '100%',
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

        {/* Streaming Message o Pensando */}
        {(streamingMessage || isThinking) && (
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
                {isThinking ? (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    fontStyle: 'italic',
                    color: '#6b7280'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      border: '2px solid #b3d4e6',
                      borderTop: '2px solid #183b56',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Pensando...
                  </div>
                ) : (
                  streamingMessage
                )}
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

      {/* Input Form Fijo */}
      <form onSubmit={handleSendMessage} style={{
        background: '#fff',
        padding: '20px 24px',
        borderTop: '1px solid #e3f0f7',
        display: 'flex',
        gap: '12px',
        flexShrink: 0, // No se comprime
        zIndex: 10,
        boxShadow: '0 -2px 4px rgba(24, 59, 86, 0.05)',
      }}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={
            !hasConsent 
              ? 'Primero debes aceptar el consentimiento informado'
              : isLoading 
                ? 'Esperando respuesta...' 
                : 'Escribe tu pregunta aquí...'
          }
          disabled={isLoading || !isConnected || !hasConsent}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '2px solid #e3f0f7',
            borderRadius: '24px',
            fontSize: '16px',
            outline: 'none',
            background: isLoading || !isConnected || !hasConsent ? '#f9fafb' : '#fff',
            color: !hasConsent ? '#9ca3af' : '#183b56',
          }}
          onFocus={(e) => {
            if (hasConsent) {
              e.target.style.borderColor = '#6ec1e4';
            }
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e3f0f7';
          }}
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading || !isConnected || !hasConsent}
          style={{
            background: (!inputMessage.trim() || isLoading || !isConnected || !hasConsent)
              ? '#d1d5db'
              : 'linear-gradient(90deg, #6ec1e4 0%, #4a90e2 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '24px',
            padding: '12px 20px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: (!inputMessage.trim() || isLoading || !isConnected || !hasConsent) 
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
    </>
  );
};

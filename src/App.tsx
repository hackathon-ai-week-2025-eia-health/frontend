
import { useState } from 'react';
import './App.css';
import { ChatInterface } from './ChatInterface';

function App() {
  const [currentView, setCurrentView] = useState<'intro' | 'chat'>('intro');

  if (currentView === 'chat') {
    return <ChatInterface onBack={() => setCurrentView('intro')} />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f7fbfd',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, Arial, sans-serif',
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
      <h1 style={{
        color: '#183b56',
        fontWeight: 700,
        fontSize: 36,
        marginBottom: 24,
        textAlign: 'center',
      }}>
        Introducción al Chatbot
      </h1>
      <div style={{
        background: '#fff',
        borderRadius: 20,
        boxShadow: '0 2px 12px rgba(24, 59, 86, 0.07)',
        padding: '32px 28px',
        maxWidth: 400,
        marginBottom: 32,
        textAlign: 'left',
      }}>
        <div style={{ marginBottom: 18 }}>
          <span style={{ fontWeight: 700, fontSize: 22, color: '#183b56' }}>Aclaración del agente</span>
          <p style={{ color: '#183b56', fontSize: 17, marginTop: 8, marginBottom: 0 }}>
            Hacer preguntas y recopilar datos personales me permite personalizar su experiencia y guiarlo en la dirección correcta durante la sesión.
          </p>
        </div>
        <div>
          <span style={{ fontWeight: 700, fontSize: 22, color: '#183b56' }}>Propósito</span>
          <p style={{ color: '#183b56', fontSize: 17, marginTop: 8, marginBottom: 0 }}>
            Proporcionarle información de salud creíble y ayudarle a navegar consultas médicas.<br />Esto no sustituye el consejo de un profesional.
          </p>
        </div>
      </div>
      <button 
        onClick={() => setCurrentView('chat')}
        style={{
          background: 'linear-gradient(90deg, #6ec1e4 0%, #4a90e2 100%)',
          color: '#fff',
          fontWeight: 700,
          fontSize: 22,
          border: 'none',
          borderRadius: 30,
          padding: '16px 60px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(24, 59, 86, 0.08)',
          transition: 'background 0.2s',
        }}
        onMouseOver={e => (e.currentTarget.style.background = 'linear-gradient(90deg, #4a90e2 0%, #6ec1e4 100%)')}
        onMouseOut={e => (e.currentTarget.style.background = 'linear-gradient(90deg, #6ec1e4 0%, #4a90e2 100%)')}
      >
        Continuar
      </button>
    </div>
  );
}

export default App;

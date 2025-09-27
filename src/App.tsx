import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import './App.css';
import { ChatInterface } from './ChatInterface';
import { useAuth } from 'react-oidc-context';

const containerStyle: CSSProperties = {
  minHeight: '100vh',
  background: '#f7fbfd',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'Inter, Arial, sans-serif',
  padding: '0 16px',
};

const iconWrapperStyle: CSSProperties = {
  background: '#e3f0f7',
  borderRadius: '50%',
  width: 120,
  height: 120,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 32,
};

const titleStyle: CSSProperties = {
  color: '#183b56',
  fontWeight: 700,
  fontSize: 36,
  marginBottom: 24,
  textAlign: 'center',
};

const cardStyle: CSSProperties = {
  background: '#fff',
  borderRadius: 20,
  boxShadow: '0 2px 12px rgba(24, 59, 86, 0.07)',
  padding: '32px 28px',
  maxWidth: 400,
  marginBottom: 32,
  textAlign: 'left',
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

const actionsRowStyle: CSSProperties = {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap',
  justifyContent: 'center',
};

const primaryButtonStyle: CSSProperties = {
  background: 'linear-gradient(90deg, #6ec1e4 0%, #4a90e2 100%)',
  color: '#fff',
  fontWeight: 700,
  fontSize: 20,
  border: 'none',
  borderRadius: 30,
  padding: '16px 60px',
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(24, 59, 86, 0.08)',
  transition: 'background 0.2s',
};

const secondaryButtonStyle: CSSProperties = {
  background: '#f3f4f6',
  color: '#183b56',
  fontWeight: 600,
  fontSize: 16,
  border: '1px solid #d1d5db',
  borderRadius: 30,
  padding: '14px 32px',
  cursor: 'pointer',
};

const fullscreenMessageStyle: CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'Inter, Arial, sans-serif',
  background: '#f7fbfd',
  color: '#183b56',
  padding: '0 16px',
  textAlign: 'center',
};

const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;
const cognitoClientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
const logoutRedirectUri =
  import.meta.env.VITE_COGNITO_LOGOUT_URI || import.meta.env.VITE_COGNITO_REDIRECT_URI;

const buildLogoutUrl = () => {
  if (!cognitoDomain || !cognitoClientId || !logoutRedirectUri) {
    return null;
  }

  const normalizedDomain = cognitoDomain.endsWith('/')
    ? cognitoDomain.slice(0, -1)
    : cognitoDomain;

  return (
    `${normalizedDomain}/logout?client_id=${encodeURIComponent(cognitoClientId)}` +
    `&logout_uri=${encodeURIComponent(logoutRedirectUri)}`
  );
};

function App() {
  const auth = useAuth();
  const [currentView, setCurrentView] = useState<'intro' | 'chat'>('intro');

  // Cuando el usuario se autentica, ir directamente al chat
  useEffect(() => {
    if (auth.isAuthenticated && currentView === 'intro') {
      setCurrentView('chat');
    }
  }, [auth.isAuthenticated, currentView]);

  const handleSignIn = () => {
    auth.signinRedirect().catch((error) => {
      console.error('Failed to start Cognito sign-in flow', error);
    });
  };

  const handleSignOut = () => {
    setCurrentView('intro');
    const logoutUrl = buildLogoutUrl();

    if (logoutUrl) {
      auth.removeUser().catch((error) => {
        console.error('Failed to clear Cognito session from storage', error);
      });
      window.location.href = logoutUrl;
      return;
    }

    auth.signoutRedirect().catch((error) => {
      console.error('Failed to redirect to Cognito logout endpoint', error);
    });
  };

  if (auth.isLoading) {
    return <div style={fullscreenMessageStyle}>Cargando autenticacion...</div>;
  }

  if (auth.error) {
    return (
      <div style={fullscreenMessageStyle}>
        Error de autenticacion: {auth.error.message}
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <div style={containerStyle}>
        <div style={iconWrapperStyle}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="32" fill="#b3d4e6" />
            <rect x="28" y="16" width="8" height="32" rx="4" fill="#fff" />
            <rect x="16" y="28" width="32" height="8" rx="4" fill="#fff" />
          </svg>
        </div>
        <h1 style={titleStyle}>Introduccion al Chatbot</h1>
        <div style={cardStyle}>
          <div style={{ marginBottom: 18 }}>
            <span style={sectionTitleStyle}>Aclaracion del agente</span>
            <p style={paragraphStyle}>
              Hacer preguntas y recopilar datos personales permite personalizar tu experiencia y
              guiarte en la direccion correcta durante la sesion.
            </p>
          </div>
          <div>
            <span style={sectionTitleStyle}>Proposito</span>
            <p style={paragraphStyle}>
              Ofrecer informacion de salud confiable y ayudarte a navegar consultas medicas.
              Esto no sustituye el consejo de un profesional.
            </p>
          </div>
        </div>
        <div style={actionsRowStyle}>
          <button
            type="button"
            style={primaryButtonStyle}
            onClick={handleSignIn}
            onMouseOver={(event) => {
              event.currentTarget.style.background = 'linear-gradient(90deg, #4a90e2 0%, #6ec1e4 100%)';
            }}
            onMouseOut={(event) => {
              event.currentTarget.style.background = 'linear-gradient(90deg, #6ec1e4 0%, #4a90e2 100%)';
            }}
          >
            Comenzar
          </button>
        </div>
      </div>
    );
  }

  const userEmail =
    auth.user?.profile?.email ??
    auth.user?.profile?.preferred_username ??
    auth.user?.profile?.sub ??
    '';

  if (currentView === 'chat') {
    return (
      <ChatInterface
        onBack={() => setCurrentView('intro')}
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <div style={containerStyle}>
      <div style={iconWrapperStyle}>
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="32" fill="#b3d4e6" />
          <rect x="28" y="16" width="8" height="32" rx="4" fill="#fff" />
          <rect x="16" y="28" width="32" height="8" rx="4" fill="#fff" />
        </svg>
      </div>
      <h1 style={titleStyle}>Introduccion al Chatbot</h1>
      <div style={cardStyle}>
        <div style={{ marginBottom: 18 }}>
          <span style={sectionTitleStyle}>Aclaracion del agente</span>
          <p style={paragraphStyle}>
            Hacer preguntas y recopilar datos personales permite personalizar tu experiencia y
            guiarte en la direccion correcta durante la sesion.
          </p>
        </div>
        <div>
          <span style={sectionTitleStyle}>Proposito</span>
          <p style={paragraphStyle}>
            Ofrecer informacion de salud confiable y ayudarte a navegar consultas medicas.
            Esto no sustituye el consejo de un profesional.
          </p>
        </div>
      </div>
      {userEmail && (
        <p style={{ ...paragraphStyle, textAlign: 'center', marginBottom: 24 }}>
          Sesion iniciada como {userEmail}
        </p>
      )}
      <div style={actionsRowStyle}>
        <button
          type="button"
          style={primaryButtonStyle}
          onClick={() => setCurrentView('chat')}
          onMouseOver={(event) => {
            event.currentTarget.style.background = 'linear-gradient(90deg, #4a90e2 0%, #6ec1e4 100%)';
          }}
          onMouseOut={(event) => {
            event.currentTarget.style.background = 'linear-gradient(90deg, #6ec1e4 0%, #4a90e2 100%)';
          }}
        >
          Continuar
        </button>
        <button
          type="button"
          style={secondaryButtonStyle}
          onClick={handleSignOut}
        >
          Cerrar sesion
        </button>
      </div>
    </div>
  );
}

export default App;

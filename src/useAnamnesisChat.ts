// useAnamnesisChat.ts
import { useState, useRef, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const WEBSOCKET_URL = 'wss://cerbrymer1.execute-api.us-west-2.amazonaws.com/dev/';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isError?: boolean;
}

interface ServerResponse {
  type: 'start' | 'chunk' | 'end' | 'error';
  uuid: string;
  data?: string;
  answer?: string;
  message?: string;
}

export const useAnamnesisChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  const currentUuidRef = useRef<string | null>(null);

  // Manejar respuestas del servidor
  const handleServerResponse = useCallback((response: ServerResponse) => {
    const { type, uuid, data, answer, message } = response;

    // Solo procesar si es el UUID actual
    if (uuid !== currentUuidRef.current) {
      return;
    }

    switch (type) {
      case 'start':
        console.log('🚀 Iniciando respuesta...');
        setIsLoading(true);
        setStreamingMessage('');
        break;

      case 'chunk':
        // Streaming: agregar chunk al mensaje actual
        setStreamingMessage(prev => prev + data);
        break;

      case 'end':
        console.log('✅ Respuesta completa recibida');
        setIsLoading(false);
        setStreamingMessage('');
        
        // Agregar respuesta completa al historial
        if (answer) {
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: answer, timestamp: new Date() }
          ]);
        }
        
        currentUuidRef.current = null;
        break;

      case 'error':
        console.error('❌ Error del servidor:', message);
        setIsLoading(false);
        setStreamingMessage('');
        
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: `Error: ${message}`, timestamp: new Date(), isError: true }
        ]);
        
        currentUuidRef.current = null;
        break;

      default:
        console.warn('Tipo de mensaje desconocido:', type);
    }
  }, []);

  // Conectar al WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    wsRef.current = new WebSocket(WEBSOCKET_URL);

    wsRef.current.onopen = () => {
      console.log('✅ WebSocket conectado');
      setIsConnected(true);
    };

    wsRef.current.onclose = (event) => {
      console.log('❌ WebSocket desconectado:', event.code, event.reason);
      setIsConnected(false);
      setIsLoading(false);
      
      // Reconexión automática después de 3 segundos
      setTimeout(() => {
        if (wsRef.current?.readyState !== WebSocket.OPEN) {
          connect();
        }
      }, 3000);
    };

    wsRef.current.onerror = (error) => {
      console.error('❌ Error WebSocket:', error);
      setIsConnected(false);
      setIsLoading(false);
    };

    wsRef.current.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        handleServerResponse(response);
      } catch (error) {
        console.error('Error parseando respuesta:', error);
      }
    };
  }, [handleServerResponse]);

  // Enviar mensaje
  const sendMessage = useCallback((userMessage: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('❌ WebSocket no está conectado');
      return;
    }

    if (isLoading) {
      console.warn('⚠ Ya hay una consulta en progreso');
      return;
    }

    // Agregar mensaje del usuario al historial
    const newUserMessage: Message = { 
      role: 'user', 
      content: userMessage, 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, newUserMessage]);

    // Preparar historial completo para enviar
    const fullHistory = [...messages, newUserMessage].map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Generar UUID para esta conversación
    const uuid = uuidv4();
    currentUuidRef.current = uuid;

    // Enviar al WebSocket
    const payload = {
      uuid: uuid,
      messages: fullHistory
    };

    console.log('📤 Enviando mensaje:', payload);
    wsRef.current.send(JSON.stringify(payload));
    setIsLoading(true);
  }, [messages, isLoading]);

  // Limpiar chat
  const clearChat = useCallback(() => {
    setMessages([]);
    setStreamingMessage('');
    setIsLoading(false);
    currentUuidRef.current = null;
  }, []);

  // Desconectar WebSocket
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Conectar automáticamente al montar el componente
  useEffect(() => {
    connect();
    
    // Cleanup al desmontar
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    messages,
    streamingMessage,
    isConnected,
    isLoading,
    sendMessage,
    clearChat,
    connect,
    disconnect
  };
};
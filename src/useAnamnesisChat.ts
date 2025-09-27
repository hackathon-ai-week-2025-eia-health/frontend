// useAnamnesisChat.ts
import { useState, useRef, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const WEBSOCKET_URL = 'wss://cerbrymer1.execute-api.us-west-2.amazonaws.com/dev';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isError?: boolean;
  thinking?: string; // Contenido de pensamiento opcional
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
  const [isThinking, setIsThinking] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const currentUuidRef = useRef<string | null>(null);
  const thinkingContentRef = useRef<string>('');
  const thinkingTimeoutRef = useRef<number | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const isConnectingRef = useRef<boolean>(false);

  // Refs para evitar dependencias en useCallback
  const isThinkingRef = useRef<boolean>(false);
  
  // Sincronizar ref con state
  useEffect(() => {
    isThinkingRef.current = isThinking;
  }, [isThinking]);

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
        setIsThinking(true);
        thinkingContentRef.current = '';
        
        // Timeout de seguridad: si después de 10 segundos sigue "pensando", pasar a respuesta
        if (thinkingTimeoutRef.current) {
          clearTimeout(thinkingTimeoutRef.current);
        }
        thinkingTimeoutRef.current = window.setTimeout(() => {
          console.log('⏰ Timeout de pensamiento, pasando a respuesta...');
          setIsThinking(false);
          setStreamingMessage(thinkingContentRef.current || 'Procesando respuesta...');
          thinkingContentRef.current = '';
        }, 120000);
        break;

      case 'chunk':
        if (data) {
          console.log('📝 Chunk recibido:', data.substring(0, 100) + (data.length > 100 ? '...' : ''));
          
          // Detectar si estamos en fase de pensamiento o respuesta final
          const currentContent = thinkingContentRef.current + data;
          
          // Patrones más amplios para detectar el final del pensamiento
          const thinkingEndPatterns = [
            '</thinking>',
            '<answer>',
            '\n\n# ',
            '\n\nRespuesta',
            '\n\n**Respuesta',
            '\n\nAnálisis',
            'Respuesta final:',
            'Mi respuesta:',
            'Conclusión:',
            // Patrones adicionales más flexibles
            /\n\n[A-Z][a-z]+:/,  // Cualquier título que empiece con mayúscula seguido de ":"
            /\n\n\*\*[A-Z]/,      // Texto en bold que empiece con mayúscula
          ];
          
          const isEndOfThinking = thinkingEndPatterns.some(pattern => {
            if (typeof pattern === 'string') {
              return currentContent.includes(pattern);
            } else {
              return pattern.test(currentContent);
            }
          });
          
          // También considerar que después de 3 segundos en pensamiento, cambiar a respuesta
          if (isThinkingRef.current && (isEndOfThinking || currentContent.length > 1000)) {
            console.log('🧠 Finalizando pensamiento, iniciando respuesta...', { 
              isEndOfThinking, 
              contentLength: currentContent.length 
            });
            setIsThinking(false);
            
            // Limpiar timeout
            if (thinkingTimeoutRef.current) {
              clearTimeout(thinkingTimeoutRef.current);
              thinkingTimeoutRef.current = null;
            }
            
            // Si encontramos un patrón, extraer la respuesta después del patrón
            let finalResponse = data;
            if (isEndOfThinking) {
              for (const pattern of thinkingEndPatterns) {
                if (typeof pattern === 'string' && currentContent.includes(pattern)) {
                  const parts = currentContent.split(pattern);
                  finalResponse = parts[parts.length - 1] || data;
                  break;
                } else if (pattern instanceof RegExp && pattern.test(currentContent)) {
                  const match = currentContent.match(pattern);
                  if (match) {
                    finalResponse = currentContent.substring(match.index! + match[0].length);
                  }
                  break;
                }
              }
            }
            
            setStreamingMessage(finalResponse.trim());
            thinkingContentRef.current = '';
          } else if (isThinkingRef.current) {
            // Seguimos en fase de pensamiento - solo almacenar, no mostrar
            thinkingContentRef.current = currentContent;
            console.log('🤔 Pensando... (caracteres:', currentContent.length, ')');
          } else {
            // Fase de respuesta final - mostrar streaming normal
            setStreamingMessage(prev => prev + data);
          }
        }
        break;

      case 'end':
        console.log('✅ Respuesta completa recibida');
        setIsLoading(false);
        setIsThinking(false);
        setStreamingMessage('');
        
        // Limpiar timeout
        if (thinkingTimeoutRef.current) {
          clearTimeout(thinkingTimeoutRef.current);
          thinkingTimeoutRef.current = null;
        }
        
        // Agregar respuesta completa al historial
        if (answer) {
          // Limpiar la respuesta final de marcadores de pensamiento
          let cleanAnswer = answer;
          
          console.log('🧹 Limpiando respuesta final. Respuesta original:', answer.substring(0, 200) + '...');
          
          // Patrones más efectivos para limpiar el pensamiento
          const thinkingPatterns = [
            // Patrones específicos de DeepSeek R1
            /<thinking>[\s\S]*?<\/thinking>/gi,
            /<answer>([\s\S]*?)$/i, // Capturar solo lo que viene después de <answer>
            
            // Patrones generales de estructura
            /^[\s\S]*?(?:\n\n# |# )(.*?)$/i,
            /^[\s\S]*?(?:\n\nRespuesta:?\s*)([\s\S]*)$/i,
            /^[\s\S]*?(?:\n\n\*\*Respuesta:?\*\*\s*)([\s\S]*)$/i,
            /^[\s\S]*?(?:\n\nAnálisis completo:?\s*)([\s\S]*)$/i,
            /^[\s\S]*?(?:\n\nConclusión:?\s*)([\s\S]*)$/i,
            /^[\s\S]*?(?:\n\nMi respuesta:?\s*)([\s\S]*)$/i,
            /^[\s\S]*?(?:\n\nRespuesta final:?\s*)([\s\S]*)$/i,
            
            // Patrón para capturar después de títulos en mayúscula seguidos de :
            /^[\s\S]*?(?:\n\n[A-Z][a-zA-Z\s]+:\s*)([\s\S]*)$/i,
          ];
          
          // Intentar cada patrón para extraer la respuesta limpia
          for (const pattern of thinkingPatterns) {
            if (pattern.toString().includes('$')) {
              // Es un patrón de captura - usar el grupo capturado
              const match = cleanAnswer.match(pattern);
              if (match && match[1]) {
                cleanAnswer = match[1].trim();
                console.log('✅ Patrón de captura aplicado:', pattern.toString());
                break;
              }
            } else {
              // Es un patrón de reemplazo - eliminar la parte matched
              const originalLength = cleanAnswer.length;
              cleanAnswer = cleanAnswer.replace(pattern, '').trim();
              if (cleanAnswer.length !== originalLength) {
                console.log('✅ Patrón de reemplazo aplicado:', pattern.toString());
                break;
              }
            }
          }
          
          // Fallback: si la respuesta sigue siendo muy larga o contiene pensamiento, 
          // buscar la última parte que parece ser la respuesta real
          if (cleanAnswer.length > answer.length * 0.8 || 
              cleanAnswer.includes('thinking') || 
              cleanAnswer.includes('análisis') ||
              cleanAnswer.includes('considerando')) {
            
            console.log('🔍 Aplicando limpieza fallback...');
            
            // Buscar párrafos que parezcan respuesta final
            const lines = cleanAnswer.split('\n');
            const responseLines = [];
            let foundStart = false;
            
            for (let i = lines.length - 1; i >= 0; i--) {
              const line = lines[i].trim();
              
              // Líneas que indican inicio de respuesta final
              if (!foundStart && line.length > 20 && 
                  !line.toLowerCase().includes('análisis') &&
                  !line.toLowerCase().includes('considerando') &&
                  !line.toLowerCase().includes('thinking') &&
                  !line.startsWith('**') &&
                  !line.endsWith(':')) {
                foundStart = true;
              }
              
              if (foundStart) {
                responseLines.unshift(line);
              }
              
              // Si encontramos una línea de separación clara, parar
              if (foundStart && (line.includes('---') || line.match(/^\s*[#*]+\s*/))) {
                break;
              }
            }
            
            if (responseLines.length > 0) {
              cleanAnswer = responseLines.join('\n').trim();
              console.log('✅ Limpieza fallback aplicada');
            }
          }
          
          console.log('✨ Respuesta final limpia:', cleanAnswer.substring(0, 200) + '...');
          
          // Extraer el contenido de pensamiento si existe
          let thinkingContent = '';
          
          // Buscar contenido entre <thinking> y </thinking>
          const thinkingMatch = answer.match(/<thinking>([\s\S]*?)<\/thinking>/i);
          if (thinkingMatch && thinkingMatch[1]) {
            thinkingContent = thinkingMatch[1].trim();
          } else {
            // Si no hay tags específicos, pero la respuesta original es mucho más larga,
            // probablemente el contenido extra sea el pensamiento
            if (answer.length > cleanAnswer.length * 1.5) {
              // Intentar extraer la parte que parece ser pensamiento
              const beforeAnswer = answer.substring(0, answer.indexOf(cleanAnswer.substring(0, 50)));
              if (beforeAnswer.length > 100) {
                thinkingContent = beforeAnswer.trim();
              }
            }
          }
          
          setMessages(prev => [
            ...prev,
            { 
              role: 'assistant', 
              content: cleanAnswer, 
              timestamp: new Date(),
              thinking: thinkingContent || undefined // Solo incluir si hay contenido
            }
          ]);
        }
        
        currentUuidRef.current = null;
        thinkingContentRef.current = '';
        break;

      case 'error':
        console.error('❌ Error del servidor:', message);
        setIsLoading(false);
        setIsThinking(false);
        setStreamingMessage('');
        
        // Limpiar timeout
        if (thinkingTimeoutRef.current) {
          clearTimeout(thinkingTimeoutRef.current);
          thinkingTimeoutRef.current = null;
        }
        
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: `Error: ${message}`, timestamp: new Date(), isError: true }
        ]);
        
        currentUuidRef.current = null;
        thinkingContentRef.current = '';
        break;

      default:
        console.warn('Tipo de mensaje desconocido:', type);
    }
  }, []); // Sin dependencias - usamos refs para evitar re-creaciones

  // Conectar al WebSocket
  const connect = useCallback(() => {
    console.log('🔄 Intentando conectar WebSocket a:', WEBSOCKET_URL);
    
    // Evitar conexiones múltiples simultáneas
    if (isConnectingRef.current) {
      console.log('⚠ Ya hay una conexión en progreso');
      return;
    }
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('✅ WebSocket ya está conectado');
      setIsConnected(true);
      return;
    }

    // Limpiar timeout de reconexión anterior
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Cerrar conexión existente si hay una
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      console.log('🔄 Cerrando conexión WebSocket existente');
      wsRef.current.close();
    }

    isConnectingRef.current = true;

    try {
      wsRef.current = new WebSocket(WEBSOCKET_URL);
      console.log('🔄 WebSocket creado, esperando conexión...');

      wsRef.current.onopen = () => {
        console.log('✅ WebSocket conectado exitosamente');
        setIsConnected(true);
        isConnectingRef.current = false;
        
        // Limpiar cualquier timeout de reconexión pendiente
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('❌ WebSocket desconectado:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        setIsConnected(false);
        setIsLoading(false);
        isConnectingRef.current = false;
        
        // Solo reconectar si no fue un cierre limpio y no hay reconexión en progreso
        if (!event.wasClean && event.code !== 1000 && !reconnectTimeoutRef.current) {
          console.log('🔄 Programando reconexión WebSocket...');
          reconnectTimeoutRef.current = window.setTimeout(() => {
            reconnectTimeoutRef.current = null;
            if (wsRef.current?.readyState !== WebSocket.OPEN && !isConnectingRef.current) {
              connect();
            }
          }, 3000);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('❌ Error WebSocket:', error);
        console.error('URL:', WEBSOCKET_URL);
        setIsConnected(false);
        setIsLoading(false);
        isConnectingRef.current = false;
      };

      wsRef.current.onmessage = (event) => {
        try {
          console.log('📥 Mensaje recibido del WebSocket:', event.data);
          const response = JSON.parse(event.data);
          handleServerResponse(response);
        } catch (error) {
          console.error('Error parseando respuesta:', error);
        }
      };
    } catch (error) {
      console.error('❌ Error creando WebSocket:', error);
      setIsConnected(false);
      setIsLoading(false);
      isConnectingRef.current = false;
    }
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
    setIsThinking(false);
    currentUuidRef.current = null;
    thinkingContentRef.current = '';
    
    // Limpiar timeouts
    if (thinkingTimeoutRef.current) {
      clearTimeout(thinkingTimeoutRef.current);
      thinkingTimeoutRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Desconectar WebSocket
  const disconnect = useCallback(() => {
    console.log('🔌 Desconectando WebSocket manualmente');
    // Limpiar todos los timeouts
    if (thinkingTimeoutRef.current) {
      clearTimeout(thinkingTimeoutRef.current);
      thinkingTimeoutRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Cerrar WebSocket
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect'); // Cierre limpio
      wsRef.current = null;
    }
    
    setIsConnected(false);
    isConnectingRef.current = false;
  }, []);

  // Conectar automáticamente al montar el componente
  useEffect(() => {
    console.log('🚀 Componente montado, iniciando conexión WebSocket');
    
    // Función interna para conectar (evita problemas de dependencias)
    const initialConnect = () => {
      console.log('🔄 Intentando conexión inicial WebSocket a:', WEBSOCKET_URL);
      
      if (isConnectingRef.current) {
        console.log('⚠ Ya hay una conexión en progreso');
        return;
      }
      
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        console.log('✅ WebSocket ya está conectado');
        setIsConnected(true);
        return;
      }

      isConnectingRef.current = true;

      try {
        wsRef.current = new WebSocket(WEBSOCKET_URL);
        
        wsRef.current.onopen = () => {
          console.log('✅ WebSocket conectado exitosamente (inicial)');
          setIsConnected(true);
          isConnectingRef.current = false;
        };

        wsRef.current.onclose = (event) => {
          console.log('❌ WebSocket desconectado (inicial):', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean
          });
          setIsConnected(false);
          setIsLoading(false);
          isConnectingRef.current = false;
          
          // Solo reconectar si no fue un cierre limpio
          if (!event.wasClean && event.code !== 1000) {
            console.log('🔄 Programando reconexión...');
            setTimeout(() => {
              if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
                initialConnect(); // Usar la función interna para reconexiones
              }
            }, 3000);
          }
        };

        wsRef.current.onerror = (error) => {
          console.error('❌ Error WebSocket (inicial):', error);
          setIsConnected(false);
          setIsLoading(false);
          isConnectingRef.current = false;
        };

        wsRef.current.onmessage = (event) => {
          try {
            const response = JSON.parse(event.data);
            handleServerResponse(response);
          } catch (error) {
            console.error('Error parseando respuesta:', error);
          }
        };
      } catch (error) {
        console.error('❌ Error creando WebSocket (inicial):', error);
        setIsConnected(false);
        setIsLoading(false);
        isConnectingRef.current = false;
      }
    };

    // Conectar solo una vez al montar
    initialConnect();
    
    // Cleanup al desmontar
    return () => {
      console.log('🧹 Limpiando WebSocket al desmontar componente');
      
      // Limpiar timeouts
      if (thinkingTimeoutRef.current) {
        clearTimeout(thinkingTimeoutRef.current);
        thinkingTimeoutRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      // Cerrar WebSocket
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmount');
        wsRef.current = null;
      }
      
      setIsConnected(false);
      isConnectingRef.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Sin dependencias - handleServerResponse es ahora estable

  return {
    messages,
    streamingMessage,
    isConnected,
    isLoading,
    isThinking,
    sendMessage,
    clearChat,
    connect,
    disconnect
  };
};
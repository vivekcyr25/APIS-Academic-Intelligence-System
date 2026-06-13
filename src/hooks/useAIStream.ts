import { useState, useCallback, useRef } from 'react';
import { getApiBaseUrl } from '../lib/apiConfig';

interface UseAIStreamOptions {
  onChunk?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

export const useAIStream = (options?: UseAIStreamOptions) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState('');
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const startStream = useCallback(async (prompt: string, context: string) => {
    setIsStreaming(true);
    setError(null);
    setText('');

    abortControllerRef.current = new AbortController();

    try {
      // Point to our backend express route. Uses env var for production Render URL
      const baseUrl = getApiBaseUrl();
      const endpoint = `${baseUrl}/api/chat-stream`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, context }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Connection failed: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('ReadableStream not supported by browser.');

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.error) {
                throw new Error(data.error);
              }
              if (data.text) {
                fullText += data.text;
                setText(fullText);
                options?.onChunk?.(data.text);
              }
            } catch (e) {
              console.warn('Failed to parse SSE data chunk:', line);
            }
          }
        }
      }

      options?.onComplete?.(fullText);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream aborted by user');
      } else {
        const errMsg = err.message || 'Stream connection lost';
        setError(errMsg);
        options?.onError?.(new Error(errMsg));
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [options]);

  const abortStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    startStream,
    abortStream,
    isStreaming,
    error,
    text,
  };
};

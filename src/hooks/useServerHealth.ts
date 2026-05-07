import { useState, useEffect } from 'react';
import { checkHealth } from '@/lib/api';

export function useServerHealth() {
  const [isUp, setIsUp] = useState<boolean | null>(null); // null = cargando inicialmente
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const verify = async () => {
      const up = await checkHealth();
      setIsUp(up);
      
      if (!up) {
        setIsRetrying(true);
        // Si está caído, reintentar cada 5 segundos
        interval = setInterval(async () => {
          const retryUp = await checkHealth();
          if (retryUp) {
            setIsUp(true);
            setIsRetrying(false);
            clearInterval(interval);
          }
        }, 5000);
      } else {
        setIsRetrying(false);
      }
    };

    verify();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  return { isUp, isRetrying };
}

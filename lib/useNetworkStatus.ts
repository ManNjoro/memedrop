import { useEffect, useState } from 'react';
import * as Network from 'expo-network';

export function useNetworkStatus(pollMs = 5000) {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      try {
        const state = await Network.getNetworkStateAsync();
        if (mounted) setIsConnected(!!state.isConnected && state.isInternetReachable !== false);
      } catch {
        if (mounted) setIsConnected(true); // fail open — don't block the UI on a check error
      }
    };

    check();
    const interval = setInterval(check, pollMs);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [pollMs]);

  return { isConnected };
}
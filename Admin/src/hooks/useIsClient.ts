import { useEffect, useState } from 'react';

export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect only runs on the client side
    setIsClient(true);
  }, []);

  return isClient;
}

export default useIsClient;

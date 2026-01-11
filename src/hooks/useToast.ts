import { useState, useCallback } from 'react';

/**
 * Hook do wyświetlania powiadomień (toast)
 * @returns Obiekt z funkcjami do zarządzania powiadomieniami
 */
export function useToast() {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return { toast, showToast, hideToast };
}

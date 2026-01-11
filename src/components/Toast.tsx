import { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Props dla komponentu Toast
 */
interface ToastProps {
  message: string;
  onClose: () => void;
}

/**
 * Komponent powiadomienia toast wyświetlanego w górnym prawym rogu
 * @param message - Tekst powiadomienia
 * @param onClose - Callback wywoływany po zamknięciu powiadomienia
 * @returns Element React
 */
export function Toast({ message, onClose }: ToastProps) {
  const { theme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`rounded-lg shadow-lg border p-4 flex items-center gap-3 max-w-md ${
        theme === 'dark'
          ? 'bg-gray-800 border-green-500/30'
          : 'bg-white border-green-200'
      }`}>
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
        <p className={`text-sm flex-1 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>{message}</p>
        <button
          onClick={onClose}
          className={`transition-colors ${
            theme === 'dark'
              ? 'text-gray-500 hover:text-gray-400'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

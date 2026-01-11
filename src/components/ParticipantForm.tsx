import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Participant } from '../utils/calcSettlements';

/**
 * Props dla komponentu ParticipantForm
 */
interface ParticipantFormProps {
  onAddParticipant: (name: string) => Promise<Participant | null>;
  onClose: () => void;
}

/**
 * Komponent formularza do dodawania nowych uczestników
 * @param onAddParticipant - Callback wywoływany po dodaniu uczestnika
 * @param onClose - Callback wywoływany po zamknięciu formularza
 * @returns Element React
 */
export function ParticipantForm({ onAddParticipant, onClose }: ParticipantFormProps) {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddParticipant(name.trim());
      setName('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`rounded-2xl shadow-xl w-full max-w-md ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-white'
    }`}>
      <div className={`flex items-center justify-between px-6 py-5 border-b ${
        theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
      }`}>
        <h2 className={`text-xl font-semibold ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Dodaj uczestnika
        </h2>
        <button
          onClick={onClose}
          className={`p-2 rounded-lg transition-colors ${
            theme === 'dark'
              ? 'hover:bg-gray-800 text-gray-400'
              : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Imię i nazwisko
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-gray-50 border-gray-300 text-gray-900'
            }`}
            placeholder="Jan Kowalski"
            required
            autoFocus
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
              theme === 'dark'
                ? 'bg-gray-800 text-white hover:bg-gray-700'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            Anuluj
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            {isSubmitting ? 'Dodawanie...' : 'Dodaj uczestnika'}
          </button>
        </div>
      </form>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Participant, Expense } from '../utils/calcSettlements';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Props dla komponentu ExpenseForm
 */
interface ExpenseFormProps {
  participants: Participant[];
  groupId: string;
  onAddExpense: (expense: {
    name: string;
    amount: number;
    currency: string;
    paid_by: string;
    participants: string[];
  }) => Promise<void>;
  onAddParticipant: (name: string) => Promise<Participant | null>;
  onClose?: () => void;
  editingExpense?: Expense | null;
}

/**
 * Komponent formularza do dodawania i edytowania wydatków
 * @param participants - Lista dostępnych uczestników
 * @param groupId - ID grupy
 * @param onAddExpense - Callback wywoływany po dodaniu wydatku
 * @param onAddParticipant - Callback do dodania nowego uczestnika
 * @param onClose - Callback do zamknięcia formularza
 * @param editingExpense - Wydatek do edycji (opcjonalnie)
 * @returns Element React
 */
export function ExpenseForm({ participants, groupId, onAddExpense, onAddParticipant, onClose, editingExpense }: ExpenseFormProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('PLN');
  const [paidBy, setPaidBy] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [isAddingParticipant, setIsAddingParticipant] = useState(false);
  const [localParticipants, setLocalParticipants] = useState<Participant[]>(participants);

  useEffect(() => {
    if (editingExpense) {
      setName(editingExpense.name);
      setAmount(editingExpense.amount.toString());
      setCurrency(editingExpense.currency || 'PLN');
      setPaidBy(editingExpense.paid_by);
      setSelectedParticipants(editingExpense.participants);
    }
  }, [editingExpense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !amount || !paidBy || selectedParticipants.length === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddExpense({
        name,
        amount: parseFloat(amount),
        currency,
        paid_by: paidBy,
        participants: selectedParticipants,
      });

      setName('');
      setAmount('');
      setCurrency('PLN');
      setPaidBy('');
      setSelectedParticipants([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleParticipant = (id: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(id)
        ? prev.filter((p) => p !== id)
        : [...prev, id]
    );
  };

  const toggleAllParticipants = () => {
    if (selectedParticipants.length === localParticipants.length) {
      setSelectedParticipants([]);
    } else {
      setSelectedParticipants(localParticipants.map(p => p.id));
    }
  };

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParticipantName.trim()) return;

    setIsAddingParticipant(true);
    try {
      const newParticipant = await onAddParticipant(newParticipantName.trim());
      if (newParticipant) {
        setLocalParticipants([...localParticipants, newParticipant]);
        setNewParticipantName('');
      }
    } finally {
      setIsAddingParticipant(false);
    }
  };

  return (
    <div className={`rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-white'
    }`}>
      <div className={`sticky top-0 px-6 py-5 border-b z-10 ${
        theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <h2 className={`text-xl font-semibold ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          {editingExpense ? 'Edytuj wydatek' : 'Dodaj wydatek'}
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Nazwa wydatku
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
            placeholder="Kolacja w restauracji"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Kwota
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              }`}
              placeholder="200"
              required
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Waluta
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              }`}
            >
              <option value="PLN">PLN (zł)</option>
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CHF">CHF (Fr.)</option>
            </select>
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Uczestnicy
          </label>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newParticipantName}
              onChange={(e) => setNewParticipantName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddParticipant(e as any);
                }
              }}
              className={`flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
              placeholder="Dodaj nowego uczestnika..."
            />
            <button
              type="button"
              onClick={handleAddParticipant}
              disabled={isAddingParticipant || !newParticipantName.trim()}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-3">
            <label className={`block text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Kto zapłacił?
            </label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              }`}
              required
              disabled={localParticipants.length === 0}
            >
              <option value="">Wybierz osobę</option>
              {localParticipants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <label className={`text-sm font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Kto uczestniczył?
              </label>
              {localParticipants.length > 0 && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={toggleAllParticipants}
                    className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Zaznacz wszystkich
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedParticipants([])}
                    className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Odznacz
                  </button>
                </div>
              )}
            </div>
            {localParticipants.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {localParticipants.map((p) => (
                  <label
                    key={p.id}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                      selectedParticipants.includes(p.id)
                        ? theme === 'dark'
                          ? 'bg-blue-900/20 border-2 border-blue-500'
                          : 'bg-blue-50 border-2 border-blue-500'
                        : theme === 'dark'
                          ? 'bg-gray-800 border-2 border-transparent hover:bg-gray-700'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedParticipants.includes(p.id)}
                      onChange={() => toggleParticipant(p.id)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className={`font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {p.name}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <div className={`text-center py-6 rounded-xl ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
              }`}>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Dodaj uczestników powyżej
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          {onClose && (
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
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (editingExpense ? 'Aktualizowanie...' : 'Dodawanie...') : (editingExpense ? 'Zaktualizuj wydatek' : 'Zapisz wydatek')}
          </button>
        </div>
      </form>
    </div>
  );
}

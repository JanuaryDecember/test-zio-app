import { ArrowRight } from 'lucide-react';
import { Settlement } from '../utils/calcSettlements';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Props dla komponentu SettlementTable
 */
interface SettlementTableProps {
  settlements: Settlement[];
  inline?: boolean;
}

/**
 * Komponent wyświetlający tabelę rozliczeń między uczestnikami
 * @param settlements - Lista rozliczeń do wyświetlenia
 * @param inline - Jeśli true, wyświetla wersję kompaktową
 * @returns Element React
 */
export function SettlementTable({ settlements, inline = false }: SettlementTableProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  if (settlements.length === 0) {
    if (inline) {
      return (
        <div className={`text-sm text-center py-4 ${
          theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
        }`}>
          Brak rozliczeń
        </div>
      );
    }
    return (
      <div className={`rounded-lg shadow-md p-6 text-center ${
        theme === 'dark'
          ? 'bg-gray-900 border border-gray-800 text-gray-500'
          : 'bg-white text-gray-500'
      }`}>
        {t('group.noSettlements')}
      </div>
    );
  }

  if (inline) {
    return (
      <div>
        <h4 className={`text-sm font-semibold mb-3 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Do rozliczenia
        </h4>
        <div className="space-y-2">
          {settlements.map((settlement, index) => (
            <div
              key={index}
              className={`flex items-center justify-between text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2 flex-1">
                <span className="font-medium">{settlement.fromName}</span>
                <ArrowRight className="w-3 h-3" />
                <span className="font-medium">{settlement.toName}</span>
                <span className={`text-xs ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  do zwrócenia
                </span>
              </div>
              <span className={`font-bold ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {settlement.amount.toFixed(2)} PLN
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg shadow-md overflow-hidden ${
      theme === 'dark'
        ? 'bg-gray-900 border border-gray-800'
        : 'bg-white'
    }`}>
      <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white">{t('group.settlements')}</h2>
      </div>
      <div className="p-6 space-y-3">
        {settlements.map((settlement, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 hover:border-green-500'
                : 'bg-gray-50 border-gray-200 hover:border-green-300'
            }`}
          >
            <div className="flex items-center gap-3 flex-1">
              <span className={`font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                {settlement.fromName}
              </span>
              <ArrowRight className="w-5 h-5 text-green-600" />
              <span className={`font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                {settlement.toName}
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-green-600">
                {settlement.amount.toFixed(2)} zł
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

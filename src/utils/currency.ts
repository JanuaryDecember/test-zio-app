/**
 * Mapa symboli walut
 */
export const currencySymbols: Record<string, string> = {
  'PLN': 'zł',
  'EUR': '€',
  'USD': '$',
  'GBP': '£',
  'CHF': 'Fr.'
};

/**
 * Zwraca symbol waluty na podstawie kodu ISO
 * @param currency - Kod waluty (np. 'PLN', 'EUR')
 * @returns Symbol waluty lub kod, jeśli symbol nie istnieje
 */
export function getCurrencySymbol(currency: string): string {
  return currencySymbols[currency] || currency;
}

/**
 * Formatuje kwotę z symbolem waluty
 * @param amount - Kwota do sformatowania
 * @param currency - Kod waluty
 * @returns Sformatowana kwota z symbolem waluty
 */
export function formatAmount(amount: number, currency: string): string {
  return `${amount.toFixed(2)} ${getCurrencySymbol(currency)}`;
}

/**
 * Reprezentuje uczestnika grupy rozliczeniowej
 */
export interface Participant {
  id: string;
  name: string;
}

/**
 * Reprezentuje wydatek w grupie
 */
export interface Expense {
  id: string;
  name: string;
  amount: number;
  currency: string;
  paid_by: string;
  participants: string[];
  archived: boolean;
  created_at?: string;
  group_id?: string;
}

/**
 * Reprezentuje transakcję rozliczeniową między dwoma uczestnikami
 */
export interface Settlement {
  from: string;
  to: string;
  amount: number;
  fromName: string;
  toName: string;
}

/**
 * Oblicza rozliczenia między uczestnikami na podstawie wydatków
 * @param participants - Lista uczestników grupy
 * @param expenses - Lista wydatków
 * @returns Tablica transakcji rozliczeniowych
 */
export function calculateSettlements(
  participants: Participant[],
  expenses: Expense[]
): Settlement[] {
  const balances: Record<string, number> = {};

  participants.forEach((p) => {
    balances[p.id] = 0;
  });

  expenses.forEach((expense) => {
    const splitCount = expense.participants.length;
    if (splitCount === 0) return;

    const perPersonAmount = expense.amount / splitCount;

    expense.participants.forEach((participantId) => {
      if (participantId === expense.paid_by) {
        balances[participantId] += expense.amount - perPersonAmount;
      } else {
        balances[participantId] -= perPersonAmount;
      }
    });
  });

  const debtors = Object.entries(balances)
    .filter(([, balance]) => balance < -0.01)
    .map(([id, balance]) => ({ id, balance: -balance }))
    .sort((a, b) => b.balance - a.balance);

  const creditors = Object.entries(balances)
    .filter(([, balance]) => balance > 0.01)
    .map(([id, balance]) => ({ id, balance }))
    .sort((a, b) => b.balance - a.balance);

  const settlements: Settlement[] = [];
  const participantMap = new Map(participants.map((p) => [p.id, p.name]));

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(debtor.balance, creditor.balance);

    if (amount > 0.01) {
      settlements.push({
        from: debtor.id,
        to: creditor.id,
        amount: Math.round(amount * 100) / 100,
        fromName: participantMap.get(debtor.id) || 'Unknown',
        toName: participantMap.get(creditor.id) || 'Unknown',
      });
    }

    debtor.balance -= amount;
    creditor.balance -= amount;

    if (debtor.balance < 0.01) i++;
    if (creditor.balance < 0.01) j++;
  }

  return settlements;
}

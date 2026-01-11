import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Users, Receipt, Trash2, Plus, Archive, Pencil, Share2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ExpenseForm } from '../components/ExpenseForm';
import { ParticipantForm } from '../components/ParticipantForm';
import { SettlementTable } from '../components/SettlementTable';
import { Toast } from '../components/Toast';
import { Navigation } from '../components/Navigation';
import { useToast } from '../hooks/useToast';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  calculateSettlements,
  Participant,
  Expense,
} from '../utils/calcSettlements';
import { formatAmount, getCurrencySymbol } from '../utils/currency';

/**
 * Interface reprezentujący grupę
 */
interface Group {
  id: string;
  name: string;
  created_at: string;
}

/**
 * Strona grupy rozliczeniowej
 * Umożliwia zarządzanie uczestnikami, wydatkami i rozliczeniami
 * @returns Element React
 */
export function GroupPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [group, setGroup] = useState<Group | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showParticipantForm, setShowParticipantForm] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const { toast, showToast, hideToast } = useToast();

  const loadGroupData = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-group-data`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ group_id: id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { group, participants, expenses } = await response.json();

      if (!group) {
        console.error('Group not found:', id);
        return;
      }

      setGroup(group);
      setParticipants(participants || []);
      setExpenses(expenses || []);
    } catch (error) {
      console.error('Error loading group data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadGroupData();
    }
  }, [id]);

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newParticipantName.trim() || !id) return;

    try {
      const { data, error } = await supabase
        .from('participants')
        .insert({ group_id: id, name: newParticipantName })
        .select()
        .single();

      if (error) throw error;

      setParticipants([...participants, data]);
      setNewParticipantName('');
      showToast(`${t('group.addedToast')}${data.name}`);
    } catch (error) {
      console.error('Error adding participant:', error);
    }
  };

  const handleAddParticipantInForm = async (name: string): Promise<Participant | null> => {
    if (!name.trim() || !id) return null;

    try {
      const { data, error } = await supabase
        .from('participants')
        .insert({ group_id: id, name: name.trim() })
        .select()
        .single();

      if (error) throw error;

      setParticipants([...participants, data]);
      showToast(`${t('group.addedToast')}${data.name}`);
      return data;
    } catch (error) {
      console.error('Error adding participant:', error);
      return null;
    }
  };

  const handleAddExpense = async (expense: {
    name: string;
    amount: number;
    currency: string;
    paid_by: string;
    participants: string[];
  }) => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          group_id: id,
          name: expense.name,
          amount: expense.amount,
          currency: expense.currency,
          paid_by: expense.paid_by,
          participants: expense.participants,
        })
        .select()
        .single();

      if (error) throw error;

      setExpenses([data, ...expenses]);
      showToast(`${t('group.expenseAddedToast')}${data.name}`);
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;

      setExpenses(expenses.filter((e) => e.id !== expenseId));
      showToast(t('group.expenseDeletedToast'));
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleToggleArchive = async (expenseId: string, archived: boolean) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .update({ archived: !archived })
        .eq('id', expenseId);

      if (error) throw error;

      setExpenses(expenses.map(e =>
        e.id === expenseId ? { ...e, archived: !archived } : e
      ));
      showToast(archived ? 'Wydatek przywrócony' : 'Wydatek zarchiwizowany');
    } catch (error) {
      console.error('Error toggling archive:', error);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  const handleUpdateExpense = async (expense: {
    name: string;
    amount: number;
    currency: string;
    paid_by: string;
    participants: string[];
  }) => {
    if (!editingExpense) return;

    try {
      const { data, error } = await supabase
        .from('expenses')
        .update({
          name: expense.name,
          amount: expense.amount,
          currency: expense.currency,
          paid_by: expense.paid_by,
          participants: expense.participants,
        })
        .eq('id', editingExpense.id)
        .select()
        .single();

      if (error) throw error;

      setExpenses(expenses.map(e => e.id === data.id ? data : e));
      showToast('Wydatek zaktualizowany');
      setEditingExpense(null);
      setShowExpenseForm(false);
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const handleShareExpense = async (expense: Expense) => {
    const shareText = `Wydatek: ${expense.name}\nKwota: ${formatAmount(expense.amount, expense.currency)}\nGrupa: ${group?.name || 'Rozliczenie'}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: expense.name,
          text: shareText,
          url: window.location.href,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          await navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
          showToast('Skopiowano do schowka');
        }
      }
    } else {
      await navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
      showToast('Skopiowano do schowka');
    }
  };

  const handleShareGroup = async () => {
    const url = window.location.href;
    const title = group?.name || t('common.appName');
    const text = `Dołącz do rozliczenia: ${title}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          await navigator.clipboard.writeText(url);
          showToast(t('group.linkCopiedToast'));
        }
      }
    } else {
      await navigator.clipboard.writeText(url);
      showToast(t('group.linkCopiedToast'));
    }
  };

  const handleAddParticipantDirect = async (name: string): Promise<Participant | null> => {
    if (!name.trim() || !id) return null;

    try {
      const { data, error } = await supabase
        .from('participants')
        .insert({ group_id: id, name: name.trim() })
        .select()
        .single();

      if (error) throw error;

      setParticipants([...participants, data]);
      showToast(`${t('group.addedToast')}${data.name}`);
      return data;
    } catch (error) {
      console.error('Error adding participant:', error);
      return null;
    }
  };

  if (isLoading) {
    return (
      <div>
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            {t('common.loading')}
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div>
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            {t('common.groupNotFound')}
          </div>
        </div>
      </div>
    );
  }

  const activeExpenses = expenses.filter(e => !e.archived);
  const archivedExpenses = expenses.filter(e => e.archived);
  const settlements = calculateSettlements(participants, activeExpenses);

  const handleAddExpenseClick = () => {
    setEditingExpense(null);
    setShowExpenseForm(true);
  };

  const handleExpenseAdded = async (expense: {
    name: string;
    amount: number;
    currency: string;
    paid_by: string;
    participants: string[];
  }) => {
    if (editingExpense) {
      await handleUpdateExpense(expense);
    } else {
      await handleAddExpense(expense);
      setShowExpenseForm(false);
    }
  };

  const totalExpenses = activeExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className={theme === 'dark' ? 'bg-gray-950 min-h-screen' : 'bg-gray-50 min-h-screen'}>
      <Navigation showGroupSwitcher groupId={id} />
      {toast && <Toast message={toast} onClose={hideToast} />}

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div className={`flex items-center gap-6 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <button
                onClick={() => setShowArchive(false)}
                className={`text-base font-medium pb-2 border-b-2 transition-colors ${
                  !showArchive
                    ? theme === 'dark'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-blue-500 text-blue-600'
                    : 'border-transparent'
                }`}
              >
                Lista wydatków {activeExpenses.length > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                    theme === 'dark' ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'
                  }`}>
                    {activeExpenses.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowArchive(true)}
                className={`flex items-center gap-2 text-base font-medium pb-2 border-b-2 transition-colors ${
                  showArchive
                    ? theme === 'dark'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-blue-500 text-blue-600'
                    : 'border-transparent'
                }`}
              >
                <Archive className="w-4 h-4" />
                Archiwum
                {archivedExpenses.length > 0 && (
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {archivedExpenses.length}
                  </span>
                )}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowParticipantForm(true)}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                <Users className="w-5 h-5" />
                Dodaj uczestników
              </button>
              <button
                onClick={handleAddExpenseClick}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                <Plus className="w-5 h-5" />
                Dodaj wydatek
              </button>
            </div>
          </div>

          {!showArchive && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {activeExpenses.length === 0 ? (
                  <div className={`rounded-2xl p-12 text-center ${
                    theme === 'dark' ? 'bg-gray-900' : 'bg-white'
                  }`}>
                    <p className={`${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      {t('group.noExpenses')}
                    </p>
                  </div>
                ) : (
                  activeExpenses.map((expense) => {
                    const payer = participants.find((p) => p.id === expense.paid_by);
                    const participantNames = expense.participants
                      .map(pid => participants.find(p => p.id === pid)?.name)
                      .filter(Boolean);

                    return (
                      <div
                        key={expense.id}
                        className={`p-5 rounded-2xl transition-all ${
                          theme === 'dark'
                            ? 'bg-gray-900 hover:bg-gray-800'
                            : 'bg-white hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <input
                              type="checkbox"
                              checked={expense.archived}
                              onChange={() => handleToggleArchive(expense.id, expense.archived)}
                              className="mt-1 w-5 h-5 rounded border-gray-300 cursor-pointer"
                            />
                            <div className="flex-1">
                              <h3 className={`text-lg font-semibold mb-1 ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                              }`}>
                                {expense.name}
                              </h3>
                              <div className={`flex items-center gap-4 text-sm ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                <span className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  Zapłacił: {payer?.name}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  Uczestnicy: {expense.participants.length}
                                </span>
                                <span className="text-xs text-gray-500">21 lis 2025</span>
                              </div>
                              <div className="flex gap-2 mt-2">
                                {participantNames.slice(0, 4).map((name, idx) => (
                                  <span
                                    key={idx}
                                    className={`px-3 py-1 rounded-full text-xs ${
                                      theme === 'dark'
                                        ? 'bg-gray-800 text-gray-300'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}
                                  >
                                    {name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 ml-4">
                            <span className={`text-xl font-bold ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {formatAmount(expense.amount, expense.currency)}
                            </span>
                            <button
                              onClick={() => handleEditExpense(expense)}
                              className={`p-2 rounded-lg transition-colors ${
                                theme === 'dark'
                                  ? 'hover:bg-gray-700 text-gray-400'
                                  : 'hover:bg-gray-100 text-gray-600'
                              }`}
                              title="Edytuj wydatek"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleShareExpense(expense)}
                              className={`p-2 rounded-lg transition-colors ${
                                theme === 'dark'
                                  ? 'hover:bg-gray-700 text-gray-400'
                                  : 'hover:bg-gray-100 text-gray-600'
                              }`}
                              title="Udostępnij wydatek"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(expense.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                theme === 'dark'
                                  ? 'hover:bg-gray-700 text-gray-400'
                                  : 'hover:bg-gray-100 text-gray-600'
                              }`}
                              title="Usuń wydatek"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="space-y-6">
                <div className={`p-6 rounded-2xl ${
                  theme === 'dark' ? 'bg-gray-900' : 'bg-white'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Podsumowanie
                    </h3>
                    <button
                      onClick={handleShareGroup}
                      className={`text-sm flex items-center gap-1 font-medium transition-colors ${
                        theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                      }`}
                    >
                      <Share2 className="w-4 h-4" />
                      Udostępnij
                    </button>
                  </div>
                  <div className={`mb-4 pb-4 border-b ${
                    theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
                  }`}>
                    <div className={`text-sm mb-1 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Łączna kwota wydatków
                    </div>
                    <div className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {activeExpenses.length > 0 && activeExpenses.every(e => e.currency === activeExpenses[0].currency)
                        ? formatAmount(totalExpenses, activeExpenses[0].currency)
                        : `${totalExpenses.toFixed(2)} (mieszane waluty)`}
                    </div>
                  </div>
                  <SettlementTable settlements={settlements} inline />
                  <div className={`mt-4 pt-4 border-t flex items-center justify-between text-sm ${
                    theme === 'dark' ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-600'
                  }`}>
                    <span>Liczba wydatków</span>
                    <span className="font-semibold">{activeExpenses.length}</span>
                  </div>
                  <div className={`flex items-center justify-between text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <span>Waluty</span>
                    <span className="font-semibold">
                      {activeExpenses.length > 0
                        ? [...new Set(activeExpenses.map(e => e.currency))].join(', ')
                        : 'Brak'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showArchive && (
            <div className="space-y-4">
              {archivedExpenses.length === 0 ? (
                <div className={`rounded-2xl p-12 text-center ${
                  theme === 'dark' ? 'bg-gray-900' : 'bg-white'
                }`}>
                  <Archive className={`w-12 h-12 mx-auto mb-4 ${
                    theme === 'dark' ? 'text-gray-700' : 'text-gray-300'
                  }`} />
                  <h3 className={`text-lg font-semibold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Archiwum rozliczonych wydatków
                  </h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    Tutaj znajdziesz wszystkie wydatki, które zostały oznaczone jako rozliczone
                  </p>
                </div>
              ) : (
                archivedExpenses.map((expense) => {
                  const payer = participants.find((p) => p.id === expense.paid_by);
                  const participantNames = expense.participants
                    .map(pid => participants.find(p => p.id === pid)?.name)
                    .filter(Boolean);

                  return (
                    <div
                      key={expense.id}
                      className={`p-5 rounded-2xl transition-all opacity-60 ${
                        theme === 'dark'
                          ? 'bg-gray-900 hover:bg-gray-800'
                          : 'bg-white hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <input
                            type="checkbox"
                            checked={expense.archived}
                            onChange={() => handleToggleArchive(expense.id, expense.archived)}
                            className="mt-1 w-5 h-5 rounded border-gray-300 cursor-pointer"
                          />
                          <div className="flex-1">
                            <h3 className={`text-lg font-semibold mb-1 ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {expense.name}
                            </h3>
                            <div className={`flex items-center gap-4 text-sm ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                Zapłacił: {payer?.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                Uczestnicy: {expense.participants.length}
                              </span>
                            </div>
                            <div className="flex gap-2 mt-2">
                              {participantNames.slice(0, 4).map((name, idx) => (
                                <span
                                  key={idx}
                                  className={`px-3 py-1 rounded-full text-xs ${
                                    theme === 'dark'
                                      ? 'bg-gray-800 text-gray-300'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {name}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <span className={`text-xl font-bold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {formatAmount(expense.amount, expense.currency)}
                          </span>
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              theme === 'dark'
                                ? 'hover:bg-gray-700 text-gray-400'
                                : 'hover:bg-gray-100 text-gray-600'
                            }`}
                            title="Usuń wydatek"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {showExpenseForm && id && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg">
            <ExpenseForm
              participants={participants}
              groupId={id}
              onAddExpense={handleExpenseAdded}
              onAddParticipant={handleAddParticipantInForm}
              onClose={() => {
                setShowExpenseForm(false);
                setEditingExpense(null);
              }}
              editingExpense={editingExpense}
            />
          </div>
        </div>
      )}

      {showParticipantForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <ParticipantForm
            onAddParticipant={handleAddParticipantDirect}
            onClose={() => setShowParticipantForm(false)}
          />
        </div>
      )}
    </div>
  );
}

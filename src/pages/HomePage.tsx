import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Users, Calculator, Share2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { Navigation } from '../components/Navigation';

/**
 * Strona główna aplikacji
 * Umożliwia tworzenie nowych grup rozliczeniowych
 * @returns Element React
 */
export function HomePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [isCreating, setIsCreating] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!groupName.trim()) return;

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('groups')
        .insert({ name: groupName.trim() })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        navigate(`/group/${data.id}`);
      }
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setIsCreating(false);
      setShowGroupModal(false);
      setGroupName('');
    }
  };

  const handleOpenModal = () => {
    setGroupName('');
    setShowGroupModal(true);
  };

  return (
    <div className={theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}>
      <Navigation />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-blue-500 rounded-3xl mb-8 shadow-xl">
              <Wallet className="w-16 h-16 text-white" />
            </div>
            <h1 className={`text-3xl md:text-4xl font-semibold mb-3 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {t('home.title')}
            </h1>
            <p className={`text-base max-w-xl mx-auto ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {t('home.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className={`p-6 rounded-2xl shadow-sm ${
              theme === 'dark' ? 'bg-gray-900' : 'bg-white'
            }`}>
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Dodaj uczestników
              </h3>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Zdefiniuj grupę osób biorących udział w rozliczeniu
              </p>
            </div>

            <div className={`p-6 rounded-2xl shadow-sm ${
              theme === 'dark' ? 'bg-gray-900' : 'bg-white'
            }`}>
              <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mb-4">
                <Calculator className="w-8 h-8 text-cyan-600" />
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Rejestruj wydatki
              </h3>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Zapisuj kto za co zapłacił i kto uczestniczył
              </p>
            </div>

            <div className={`p-6 rounded-2xl shadow-sm ${
              theme === 'dark' ? 'bg-gray-900' : 'bg-white'
            }`}>
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
                <Share2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Rozlicz się
              </h3>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Zobacz automatyczne wyliczenia kto komu ile jest winien
              </p>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleOpenModal}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-base transition-colors shadow-lg"
            >
              Rozpocznij rozliczenie
            </button>
          </div>
        </div>
      </div>

      {showGroupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-2xl p-6 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}>
            <h2 className={`text-xl font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Stwórz nową grupę wydatków
            </h2>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Nazwa grupy
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="np. Wyjazd do Zakopanego"
                  autoFocus
                  className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  } focus:outline-none`}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowGroupModal(false);
                    setGroupName('');
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-800 hover:bg-gray-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !groupName.trim()}
                  className="flex-1 px-4 py-2 rounded-lg font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? t('home.creatingButton') : 'Stwórz grupę'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

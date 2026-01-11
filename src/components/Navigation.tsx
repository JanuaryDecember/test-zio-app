import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Wallet,
  Home,
  Globe,
  Moon,
  Sun,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { Language } from '../i18n/translations';
import { supabase } from '../lib/supabase';

/**
 * Props dla komponentu Navigation
 */
interface NavigationProps {
  showGroupSwitcher?: boolean;
  groupId?: string;
}

/**
 * Interface reprezentujący grupę
 */
interface Group {
  id: string;
  name: string;
}

/**
 * Komponent paska nawigacyjnego z przełącznikiem motywu i języka
 * @param showGroupSwitcher - Jeśli true, wyświetla przełącznik grup
 * @param groupId - ID aktualnej grupy
 * @returns Element React
 */
export function Navigation({
  showGroupSwitcher = false,
  groupId,
}: NavigationProps) {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);


  const handleLogoClick = () => {
    navigate('/');
    setShowGroupMenu(false);
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setShowLanguageMenu(false);
  };

  const loadGroups = async () => {
    if (isLoadingGroups) return;

    setIsLoadingGroups(true);
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('id, name')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setGroups(data || []);

      if (groupId && data) {
        const found = data.find((g) => g.id === groupId);
        if (found) {
          setCurrentGroup(found);
        }
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const handleOpenGroupMenu = () => {
    if (!showGroupMenu) {
      loadGroups();
    }
    setShowGroupMenu(!showGroupMenu);
  };

  const handleSelectGroup = (group: Group) => {
    navigate(`/group/${group.id}`);
    setCurrentGroup(group);
    setShowGroupMenu(false);
  };

  const handleCreateNewGroup = () => {
    navigate('/');
    setShowGroupMenu(false);
  };

  return (
    <nav
      className={`sticky top-0 z-40 transition-colors ${
        theme === 'dark'
          ? 'bg-gray-900 border-b border-gray-800'
          : 'bg-white border-b border-gray-200'
      } shadow-md`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-md">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block text-left">
              <h1
                className={`text-base font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                {t('common.appName')}
              </h1>
              <p
                className={`text-xs ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                }`}
              >
                {t('common.appSubtitle')}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-3">
          
            {showGroupSwitcher && groupId && (
              <div className="relative">
                <button
                  onClick={handleOpenGroupMenu}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-800 hover:bg-gray-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  <span className="hidden sm:inline text-sm font-medium">
                    {currentGroup?.name || t('group.selectGroup')}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showGroupMenu && (
                  <div
                    className={`absolute right-0 mt-2 w-56 rounded-lg shadow-xl border ${
                      theme === 'dark'
                        ? 'bg-gray-900 border-gray-700'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="p-2 border-b border-gray-700">
                      <button
                        onClick={handleCreateNewGroup}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                          theme === 'dark'
                            ? 'hover:bg-gray-800 text-white'
                            : 'hover:bg-gray-100 text-gray-800'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {t('common.addGroup')}
                        </span>
                      </button>
                    </div>
                    <div className="p-2 max-h-64 overflow-y-auto">
                      {groups.length === 0 ? (
                        <p
                          className={`px-3 py-2 text-sm ${
                            theme === 'dark'
                              ? 'text-gray-500'
                              : 'text-gray-500'
                          }`}
                        >
                          {t('group.noGroups')}
                        </p>
                      ) : (
                        groups.map((group) => (
                          <button
                            key={group.id}
                            onClick={() => handleSelectGroup(group)}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                              group.id === groupId
                                ? theme === 'dark'
                                  ? 'bg-blue-900 text-white'
                                  : 'bg-blue-100 text-blue-900'
                                : theme === 'dark'
                                  ? 'hover:bg-gray-800 text-white'
                                  : 'hover:bg-gray-100 text-gray-800'
                            } text-sm`}
                          >
                            {group.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}


            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-gray-800 text-gray-400'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                  title={t('common.language')}
                >
                  <Globe className="w-5 h-5" />
                </button>

                {showLanguageMenu && (
                  <div
                    className={`absolute right-0 mt-2 w-32 rounded-lg shadow-xl border overflow-hidden ${
                      theme === 'dark'
                        ? 'bg-gray-900 border-gray-700'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    {(['pl', 'en'] as Language[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => handleLanguageChange(lang)}
                        className={`w-full text-left px-4 py-2 transition-colors text-sm font-medium ${
                          language === lang
                            ? theme === 'dark'
                              ? 'bg-blue-900 text-white'
                              : 'bg-blue-100 text-blue-900'
                            : theme === 'dark'
                              ? 'hover:bg-gray-800 text-white'
                              : 'hover:bg-gray-100 text-gray-800'
                        }`}
                      >
                        {lang === 'pl' ? 'Polski' : 'English'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={toggleTheme}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-gray-800 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
                title={t('common.theme')}
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { useTheme } from './contexts/ThemeContext';
import { HomePage } from './pages/HomePage';
import { GroupPage } from './pages/GroupPage';

/**
 * Komponent zawartości aplikacji z routingiem
 * @returns Element React
 */
function AppContent() {
  const { theme } = useTheme();

  return (
    <div
      className={`min-h-screen transition-colors ${
        theme === 'dark'
          ? 'bg-gray-950 text-white'
          : 'bg-gradient-to-br from-green-50 via-blue-50 to-green-50 text-gray-900'
      }`}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/group/:id" element={<GroupPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

/**
 * Główny komponent aplikacji
 * @returns Element React
 */
function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;

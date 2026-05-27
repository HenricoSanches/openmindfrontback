import { Moon, Sun, Brain, LayoutDashboard } from "lucide-react";
import { useTheme } from "./ThemeContext";
import type { Page, UserType } from "./types";

interface HeaderProps {
  onNavigate: (page: Page) => void;
  showAuthButtons?: boolean;
  onLogout?: () => void;
  userType?: UserType;
}

export function Header({ onNavigate, showAuthButtons = true, onLogout, userType }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Brain className="w-8 h-8 text-pink-600 dark:text-pink-500" />
            <span className="text-gray-900 dark:text-white font-semibold text-lg">OpenMind</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Alternar tema"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            {showAuthButtons && !onLogout && (
              <>
                <button
                  onClick={() => onNavigate("login")}
                  className="px-4 py-2 rounded-full border border-pink-600 dark:border-pink-500 text-pink-600 dark:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors"
                >
                  Entrar
                </button>
                <button
                  onClick={() => onNavigate("login")}
                  className="px-4 py-2 rounded-full bg-pink-600 dark:bg-pink-700 text-white hover:bg-pink-700 dark:hover:bg-pink-800 transition-colors"
                >
                  Cadastrar
                </button>
              </>
            )}

            {userType === "admin" && (
              <button
                onClick={() => onNavigate("admin-dashboard")}
                className="px-3 py-2 rounded-full bg-pink-600 dark:bg-pink-700 text-white hover:bg-pink-700 dark:hover:bg-pink-800 transition-colors"
                aria-label="Painel admin"
              >
                <LayoutDashboard className="w-5 h-5" />
              </button>
            )}

            {onLogout && (
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-full border border-pink-600 dark:border-pink-500 text-pink-600 dark:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors"
              >
                Sair
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

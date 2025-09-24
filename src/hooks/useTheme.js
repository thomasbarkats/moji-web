import { useState, useEffect } from 'react';


export const useTheme = () => {
  const [darkMode, setDarkMode] = useState(false);


  useEffect(() => {
    const savedTheme = localStorage.getItem('kana-app-theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('kana-app-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);


  const toggleDarkMode = () => setDarkMode(!darkMode);

  const getThemeClasses = () => {
    if (darkMode) {
      return {
        bg: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
        cardBg: 'bg-gray-800/90',
        inputBg: 'bg-gray-700',
        progressBg: 'bg-gray-600',
        sectionBg: 'bg-gray-700',
        text: 'text-gray-100',
        textSecondary: 'text-gray-300',
        textMuted: 'text-gray-400',
        border: 'border-gray-600',
        inputBorder: 'border-gray-600 focus:border-blue-400',
        buttonSecondary: 'text-gray-300 hover:text-gray-100 hover:bg-gray-700',
        statsBg: {
          blue: 'bg-blue-900/50',
          red: 'bg-red-900/50',
          green: 'bg-green-900/50',
          purple: 'bg-purple-900/50'
        },
        statsText: {
          blue: 'text-blue-300',
          red: 'text-red-300',
          green: 'text-green-300',
          purple: 'text-purple-300'
        },
        feedbackSuccess: {
          bg: 'bg-green-900/50 border-green-400',
          title: 'text-green-300',
          text: 'text-green-400'
        },
        feedbackError: {
          bg: 'bg-red-900/50 border-red-400',
          title: 'text-red-300',
          text: 'text-red-400'
        }
      };
    } else {
      return {
        bg: 'bg-gradient-to-br from-purple-100 via-blue-50 to-cyan-100',
        cardBg: 'bg-white/90',
        inputBg: 'bg-white',
        progressBg: 'bg-gray-200',
        sectionBg: 'bg-gray-100',
        text: 'text-gray-800',
        textSecondary: 'text-gray-600',
        textMuted: 'text-gray-500',
        border: 'border-gray-300',
        inputBorder: 'border-gray-300 focus:border-blue-500',
        buttonSecondary: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
        statsBg: {
          blue: 'bg-blue-50',
          red: 'bg-red-50',
          green: 'bg-green-50',
          purple: 'bg-purple-50'
        },
        statsText: {
          blue: 'text-blue-800',
          red: 'text-red-800',
          green: 'text-green-800',
          purple: 'text-purple-800'
        },
        feedbackSuccess: {
          bg: 'bg-green-100 border-green-300',
          title: 'text-green-800',
          text: 'text-green-700'
        },
        feedbackError: {
          bg: 'bg-red-100 border-red-300',
          title: 'text-red-800',
          text: 'text-red-700'
        }
      };
    }
  };

  return {
    darkMode,
    toggleDarkMode,
    theme: getThemeClasses()
  };
};

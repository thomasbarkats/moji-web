import { useState } from 'react';


const STORAGE_KEY = 'theme';

export const useTheme = () => {
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    return savedTheme === 'dark';
  };

  const [darkMode, setDarkMode] = useState(getInitialTheme);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem(STORAGE_KEY, newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  const getThemeClasses = () => {
    if (darkMode) {
      return {
        bg: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
        cardBg: 'bg-gray-800/90',
        modalBg: 'bg-gray-800',
        selectorBg: 'bg-gray-800',
        selectorHover: 'hover:bg-gray-700',
        inputBg: 'bg-gray-700',
        progressBg: 'bg-gray-600',
        sectionBg: 'bg-gray-700',
        emptyBg: 'bg-gray-700/30',
        text: 'text-gray-100',
        textSecondary: 'text-gray-300',
        textMuted: 'text-gray-400',
        border: 'border-gray-600',
        divider: 'divide-gray-600',
        inputBorder: 'border-gray-600 focus:border-blue-400',
        buttonSecondary: 'text-gray-300 hover:text-gray-100 hover:bg-gray-700',
        buttonSkip: 'text-white bg-gray-500 hover:bg-gray-600',
        bookmarkColor: 'text-yellow-500',
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
        },
      };
    } else {
      return {
        bg: 'bg-gradient-to-br from-purple-100 via-blue-50 to-cyan-100',
        cardBg: 'bg-white/90',
        modalBg: 'bg-white',
        selectorBg: 'bg-white',
        selectorHover: 'hover:bg-gray-100',
        inputBg: 'bg-white',
        progressBg: 'bg-gray-200',
        sectionBg: 'bg-gray-100',
        emptyBg: 'bg-gray-100/80',
        text: 'text-gray-800',
        textSecondary: 'text-gray-600',
        textMuted: 'text-gray-500',
        border: 'border-gray-300',
        divider: 'divide-gray-300',
        inputBorder: 'border-gray-300 focus:border-blue-500',
        buttonSecondary: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
        buttonSkip: 'text-white bg-gray-400 hover:bg-gray-500',
        bookmarkColor: 'text-yellow-600',
        statsBg: {
          blue: 'bg-blue-100',
          red: 'bg-red-100',
          green: 'bg-green-100',
          purple: 'bg-purple-100'
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
        },
      };
    }
  };

  return {
    darkMode,
    toggleDarkMode,
    theme: getThemeClasses()
  };
};

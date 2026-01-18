import { Coffee } from 'lucide-react';
import { usePreferences } from '../../contexts/PreferencesContext';

export const BuyMeACoffeeButton = () => {
  const { theme } = usePreferences();
  const url = import.meta.env.VITE_BUYMEACOFFEE_URL;
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`w-12 h-12 p-3 rounded-full ${theme.buyMeACoffeeBtn} shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center`}
      title="Buy me a coffee"
    >
      <Coffee className="w-5 h-5" />
    </a>
  );
};

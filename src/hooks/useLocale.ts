import { useUserPreferenceContext } from 'src/components/User/Preferences/UserPreferenceProvider';

export const useLocale = () => useUserPreferenceContext().locale;

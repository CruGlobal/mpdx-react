import { useContext } from 'react';
import {
  AppSettingsContext,
  AppSettingsType,
} from '../components/common/AppSettings/AppSettingsProvider';

const useGetAppSettings = (): AppSettingsType => useContext(AppSettingsContext);

export default useGetAppSettings;

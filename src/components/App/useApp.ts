import { useContext } from 'react';
import AppContext from './Context';
import { AppProviderContext } from './Provider';

const useApp = (): AppProviderContext => useContext(AppContext);

export default useApp;

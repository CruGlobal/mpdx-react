import { useContext } from 'react';
import AppContext from './Context';
import { AppProviderContext } from './Provider';

const useLocalState = (): AppProviderContext => useContext(AppContext);

export default useLocalState;

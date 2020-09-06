import { createContext } from 'react';
import { AppProviderContext } from './Provider';

const AppContext = createContext<AppProviderContext>(undefined);

export default AppContext;

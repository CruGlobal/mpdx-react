import { createContext } from 'react';
import { AppProviderContext } from './Provider';

const AppContext = createContext<AppProviderContext>({
  state: {},
  dispatch: () => undefined,
});

export default AppContext;

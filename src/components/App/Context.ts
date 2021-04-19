import { createContext } from 'react';
import { AppProviderContext } from './Provider';

const AppContext = createContext<AppProviderContext>({
  openTaskDrawer: () => undefined,
  state: {},
  dispatch: () => undefined,
});

export default AppContext;

import React, { ReactNode, ReactElement, useReducer, Dispatch } from 'react';
import rootReducer, { Action, AppState } from './rootReducer';
import { AppContext } from '.';

export interface AppProviderContext {
  state: AppState;
  dispatch: Dispatch<Action>;
}

interface Props {
  children: ReactNode;
  initialState?: Partial<AppState>;
}

const AppProvider = ({ initialState, children }: Props): ReactElement => {
  const [state, dispatch] = useReducer<typeof rootReducer>(rootReducer, {
    accountListId: undefined,
    ...initialState,
  });

  const value: AppProviderContext = {
    state,
    dispatch,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppProvider;

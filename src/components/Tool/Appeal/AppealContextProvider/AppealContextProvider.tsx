import React, {
  ReactElement,
  ReactNode,
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';

const initialState: StateType = {
  display: 'default',
  subDisplay: 'received',
  selected: [],
};

export const AppealContext = createContext<AppealProviderContext>({
  appealState: { display: '', subDisplay: '', selected: [] },
  setAppealState: () => undefined,
});

export interface StateType {
  display: string;
  subDisplay: string;
  selected: string[];
}

export interface AppealProviderContext {
  appealState: StateType;
  setAppealState: (props: StateType) => void;
}

export const useAppealContext = (): AppealProviderContext =>
  useContext(AppealContext);

const AppealProvider = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  const [appealState, setAppealState] = useState<StateType>(initialState);

  const value = useMemo(
    () => ({ appealState, setAppealState }),
    [appealState, setAppealState],
  );

  return (
    <AppealContext.Provider value={value}>{children}</AppealContext.Provider>
  );
};
export { AppealProvider };

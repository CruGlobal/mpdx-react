import React, { ReactNode, ReactElement, useState, useReducer, Dispatch } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { omit } from 'lodash/fp';
import TaskDrawer, { TaskDrawerProps } from '../Task/Drawer/Drawer';
import rootReducer, { Action, AppState } from './rootReducer';
import { AppContext } from '.';

export interface AppProviderContext {
    openTaskDrawer: (props: TaskDrawerProps) => void;
    openTaskCompletedDrawer: (taskId: string) => void;
    state: AppState;
    dispatch: Dispatch<Action>;
}

interface Props {
    children: ReactNode;
    initialState?: Partial<AppState>;
}

interface TaskDrawerPropsWithId extends TaskDrawerProps {
    id: string;
}

const AppProvider = ({ initialState, children }: Props): ReactElement => {
    const [taskDrawers, setTaskDrawers] = useState<TaskDrawerPropsWithId[]>([]);
    const [state, dispatch] = useReducer(rootReducer, {
        accountListId: null,
        breadcrumb: null,
        ...initialState,
    });

    const openTaskDrawer = (props: TaskDrawerProps): void => {
        setTaskDrawers([...taskDrawers, { id: uuidv4(), ...props }]);
    };

    const openTaskCompletedDrawer = (taskId: string): void => {
        console.log(taskId);
    };

    const value: AppProviderContext = {
        openTaskDrawer,
        openTaskCompletedDrawer,
        state,
        dispatch,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
            {taskDrawers.map((props) => (
                <TaskDrawer key={props.id} {...omit('id', props)} />
            ))}
        </AppContext.Provider>
    );
};

export default AppProvider;

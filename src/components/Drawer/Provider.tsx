import React, { ReactNode, ReactElement, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { omit } from 'lodash/fp';
import TaskDrawer, { TaskDrawerProps } from '../Task/Drawer/Drawer';
import { DrawerContext } from '.';

export interface DrawerProviderContext {
    openTaskDrawer: (props: TaskDrawerProps) => void;
}

interface Props {
    children: ReactNode;
}

interface TaskDrawerPropsWithId extends TaskDrawerProps {
    id: string;
}

const DrawerProvider = ({ children }: Props): ReactElement => {
    const [taskDrawers, setTaskDrawers] = useState<TaskDrawerPropsWithId[]>([]);

    const openTaskDrawer = (props: TaskDrawerProps): void => {
        setTaskDrawers([...taskDrawers, { id: uuidv4(), ...props }]);
    };

    const value: DrawerProviderContext = {
        openTaskDrawer,
    };

    return (
        <DrawerContext.Provider value={value}>
            {children}
            {taskDrawers.map((props) => (
                <TaskDrawer key={props.id} {...omit('id', props)} />
            ))}
        </DrawerContext.Provider>
    );
};

export default DrawerProvider;

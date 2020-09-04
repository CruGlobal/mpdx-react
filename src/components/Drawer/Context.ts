import { createContext } from 'react';
import { DrawerProviderContext } from './Provider';

const DrawerContext = createContext<DrawerProviderContext>(undefined);

export default DrawerContext;

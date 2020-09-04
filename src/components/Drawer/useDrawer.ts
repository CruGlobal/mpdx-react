import { useContext } from 'react';
import DrawerContext from './Context';
import { DrawerProviderContext } from './Provider';

const useDrawer = (): DrawerProviderContext => useContext(DrawerContext);

export default useDrawer;

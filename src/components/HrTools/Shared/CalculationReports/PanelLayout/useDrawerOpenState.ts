import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useMediaQuery } from '@mui/material';
import theme from 'src/theme';

/**
 * State for the PanelLayout step drawer. The drawer starts open, except on
 * phones where it would cover the page, so it starts closed there.
 */
export const useDrawerOpenState = (): [
  boolean,
  Dispatch<SetStateAction<boolean>>,
] => {
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  useEffect(() => {
    if (isPhone) {
      setIsDrawerOpen(false);
    }
  }, [isPhone]);

  return [isDrawerOpen, setIsDrawerOpen];
};

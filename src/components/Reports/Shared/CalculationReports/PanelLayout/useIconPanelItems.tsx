import MenuOpenSharp from '@mui/icons-material/MenuOpenSharp';
import MenuSharp from '@mui/icons-material/MenuSharp';
import { useTranslation } from 'react-i18next';
import { IconPanelItem } from './PanelLayout';

export const useIconPanelItems = (
  isDrawerOpen: boolean,
  toggleDrawer: () => void,
): IconPanelItem[] => {
  const { t } = useTranslation();

  const iconPanelItems: IconPanelItem[] = [
    {
      key: 'toggle-menu',
      icon: isDrawerOpen ? <MenuOpenSharp /> : <MenuSharp />,
      label: t('Toggle Menu'),
      onClick: toggleDrawer,
    },
  ];

  return iconPanelItems;
};

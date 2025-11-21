import MenuOpenSharp from '@mui/icons-material/MenuOpenSharp';
import MenuSharp from '@mui/icons-material/MenuSharp';
import { useTranslation } from 'react-i18next';
import { IconPanelItem } from 'src/components/Shared/IconPanelLayout/IconPanelLayout';

export const useIconPanelItems = (
  isDrawerOpen: boolean,
  toggleDrawer: () => void,
): IconPanelItem[] => {
  const { t } = useTranslation();

  const iconPanelItems: IconPanelItem[] = [
    {
      icon: isDrawerOpen ? <MenuOpenSharp /> : <MenuSharp />,
      label: t('Toggle Menu'),
      onClick: toggleDrawer,
    },
  ];

  return iconPanelItems;
};

import React, { ReactElement, useState } from 'react';
import ArrowDropDown from '@mui/icons-material/ArrowDropDown';
import {
  Button,
  Dialog,
  ListItemText,
  Menu,
  MenuItem,
  Skeleton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormat } from 'src/lib/intlFormat/intlFormat';
import ExportEmail from './MenuItems/ExportEmail/ExportEmail';
import ExportPhysical from './MenuItems/ExportPhysical/ExportPhysical';
import LogNewsletter from './MenuItems/LogNewsLetter/LogNewsletter';
import { useGetTaskAnalyticsQuery } from './NewsletterMenu.generated';

interface Props {
  accountListId: string;
}

const NewsletterTextContainer = styled(ListItemText)(() => ({
  textAlign: 'left',
}));

const NewsletterMenu = ({ accountListId }: Props): ReactElement<Props> => {
  const { t } = useTranslation();
  const locale = useLocale();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>();
  const [selectedMenuItem, changeSelectedMenuItem] = useState(-1);
  const [newsletterMenuDialogOpen, changeNewsletterMenuDialogOpen] =
    useState(false);

  const { data, loading } = useGetTaskAnalyticsQuery({
    variables: { accountListId },
  });

  const lastElectronicNewsletterCompletedAt =
    data?.taskAnalytics.lastElectronicNewsletterCompletedAt;
  const lastPhysicalNewsletterCompletedAt =
    data?.taskAnalytics.lastPhysicalNewsletterCompletedAt;

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(undefined);
  };

  const handleMenuItemClick = (menuItem: number) => {
    changeSelectedMenuItem(menuItem);
    changeNewsletterMenuDialogOpen(true);
  };

  const handleDialogClose = () => {
    changeNewsletterMenuDialogOpen(false);
    changeSelectedMenuItem(-1);
  };

  const latestNewsletterDate = () => {
    const electronicDate =
      lastElectronicNewsletterCompletedAt &&
      DateTime.fromISO(lastElectronicNewsletterCompletedAt);
    const physicalDate =
      lastPhysicalNewsletterCompletedAt &&
      DateTime.fromISO(lastPhysicalNewsletterCompletedAt);

    if (electronicDate && physicalDate) {
      return electronicDate < physicalDate
        ? dateFormat(physicalDate, locale)
        : dateFormat(electronicDate, locale);
    }
    if (electronicDate) {
      return dateFormat(electronicDate, locale);
    }
    if (physicalDate) {
      return dateFormat(physicalDate, locale);
    }
    return t('never');
  };

  const renderDialog = () => {
    const renderDialogContent = () => {
      switch (selectedMenuItem) {
        case 0:
          return (
            <LogNewsletter
              accountListId={accountListId}
              handleClose={handleDialogClose}
            />
          );
        case 1:
          return (
            <ExportEmail
              accountListId={accountListId}
              handleClose={handleDialogClose}
            />
          );
        case 2:
          return (
            <ExportPhysical
              accountListId={accountListId}
              handleClose={handleDialogClose}
            />
          );
      }
    };
    return (
      <Dialog
        open={newsletterMenuDialogOpen}
        onClose={handleDialogClose}
        disableRestoreFocus={true}
        aria-labelledby={t('Newsletter Dialog')}
        fullWidth
        maxWidth="sm"
      >
        {renderDialogContent()}
      </Dialog>
    );
  };
  return (
    <>
      <Button
        style={{ textTransform: 'uppercase' }}
        data-testid="NewsletterMenuButton"
        onClick={handleMenuOpen}
      >
        <ArrowDropDown />

        <NewsletterTextContainer
          primary={t('Newsletter')}
          secondary={
            loading ? (
              <Skeleton
                variant="text"
                style={{ display: 'inline-block' }}
                width={90}
              />
            ) : (
              `${t('Latest')}: ${latestNewsletterDate()}`
            )
          }
        />
      </Button>
      <Menu
        id="newsletter-menu"
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        disableRestoreFocus={true}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MenuItem onClick={() => handleMenuItemClick(0)}>
          <ListItemText primary={t('Log Newsletter')} />
        </MenuItem>
        <MenuItem onClick={() => handleMenuItemClick(1)}>
          <ListItemText primary={t('Export Email')} />
        </MenuItem>
        <MenuItem onClick={() => handleMenuItemClick(2)}>
          <ListItemText primary={t('Export Physical')} />
        </MenuItem>
      </Menu>
      {renderDialog()}
    </>
  );
};

export default NewsletterMenu;

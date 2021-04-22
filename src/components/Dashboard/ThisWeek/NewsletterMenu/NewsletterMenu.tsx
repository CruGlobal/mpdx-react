import React, { ReactElement, useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  Dialog,
  ListItemText,
  styled,
} from '@material-ui/core';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';
import { Skeleton } from '@material-ui/lab';
import { useGetTaskAnalyticsQuery } from './NewsletterMenu.generated';
import ExportEmail from './MenuItems/ExportEmail/ExportEmail';
import LogNewsletter from './MenuItems/LogNewsLetter/LogNewsletter';
import ExportPhysical from './MenuItems/ExportPhysical/ExportPhysical';

interface Props {
  accountListId: string;
}

const NewsletterTextContainer = styled(ListItemText)(() => ({
  textAlign: 'left',
}));

const NewsletterMenu = ({ accountListId }: Props): ReactElement<Props> => {
  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>();
  const [selectedMenuItem, changeSelectedMenuItem] = useState(-1);
  const [newsletterMenuDialogOpen, changeNewsletterMenuDialogOpen] = useState(
    false,
  );

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
        ? physicalDate.toLocaleString()
        : electronicDate.toLocaleString();
    }
    if (electronicDate) {
      return electronicDate.toLocaleString();
    }
    if (physicalDate) {
      return physicalDate.toLocaleString();
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
        anchorEl={anchorEl}
        getContentAnchorEl={null}
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

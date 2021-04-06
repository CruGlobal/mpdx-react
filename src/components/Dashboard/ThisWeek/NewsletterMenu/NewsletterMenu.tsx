import React, { ReactElement, useState, useEffect } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
  ListItemText,
  IconButton,
  styled,
  TextareaAutosize,
} from '@material-ui/core';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import CloseIcon from '@material-ui/icons/Close';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';
import { Skeleton } from '@material-ui/lab';
import {
  useGetTaskAnalyticsQuery,
  useGetEmailNewsletterContactsLazyQuery,
} from '../NewsletterMenu.generated';

interface Props {
  accountListId: string;
}

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(1),
  top: theme.spacing(1),
  color: theme.palette.text.primary,
  '&:hover': {
    backgroundColor: '#EBECEC',
  },
}));

const NewsletterTextContainer = styled(ListItemText)(({}) => ({
  textAlign: 'left',
}));

const TextArea = styled(TextareaAutosize)(({}) => ({
  width: '100%',
}));

const NewsletterMenuDialogTitle = styled(DialogTitle)(({}) => ({
  textTransform: 'uppercase',
  textAlign: 'center',
}));

const NewsletterMenu = ({ accountListId }: Props): ReactElement<Props> => {
  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMenuItem, changeSelectedMenuItem] = useState(-1);
  const [newsletterMenuDialogOpen, changeNewsletterMenuDialogOpen] = useState(
    false,
  );
  const [emailList, changeEmailList] = useState('');

  const {
    data: {
      taskAnalytics: {
        lastElectronicNewsletterCompletedAt,
        lastPhysicalNewsletterCompletedAt,
      } = {},
    } = {},
    loading,
  } = useGetTaskAnalyticsQuery({
    variables: { accountListId },
  });

  const [
    loadEmailNewsletterContacts,
    { data: newsletterContactsData, loading: contactsLoading },
  ] = useGetEmailNewsletterContactsLazyQuery({
    variables: { accountListId },
  });

  useEffect(() => {
    if (newsletterContactsData?.contacts.nodes.length > 0) {
      changeEmailList(
        newsletterContactsData.contacts.nodes.reduce(
          (result, contact, index) => {
            return contact?.primaryPerson?.primaryEmailAddress
              ? index === 0
                ? `${contact.primaryPerson.primaryEmailAddress.email}`
                : `${result},${contact.primaryPerson.primaryEmailAddress.email}`
              : result;
          },
          '',
        ),
      );
    }
  }, [newsletterContactsData]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (menuItem) => {
    changeSelectedMenuItem(menuItem);
    changeNewsletterMenuDialogOpen(true);
    switch (menuItem) {
      case 0:
        break;
      case 1:
        loadEmailNewsletterContacts();
        break;
      case 2:
        break;
    }
  };

  const handleDialogClose = () => {
    changeNewsletterMenuDialogOpen(false);
    changeSelectedMenuItem(-1);
  };

  const latestNewsletterDate = () => {
    const electronicDate = DateTime.fromISO(
      lastElectronicNewsletterCompletedAt,
    );
    const physicalDate = DateTime.fromISO(lastPhysicalNewsletterCompletedAt);

    if (
      !lastElectronicNewsletterCompletedAt &&
      !lastPhysicalNewsletterCompletedAt
    ) {
      return t('never');
    } else if (
      lastElectronicNewsletterCompletedAt &&
      !lastPhysicalNewsletterCompletedAt
    ) {
      return electronicDate.toLocaleString();
    } else if (
      !lastElectronicNewsletterCompletedAt &&
      lastPhysicalNewsletterCompletedAt
    ) {
      return physicalDate.toLocaleString();
    } else {
      return electronicDate < physicalDate
        ? physicalDate.toLocaleString()
        : electronicDate.toLocaleString();
    }
  };
  // TODO: Finish creating dialog for "Log Newsletter" and "Export Physical"
  const renderDialog = () => {
    const title = () => {
      switch (selectedMenuItem) {
        case 0:
          return t('Log Newsletter');
        case 1:
          return t('Email Newsletter List');
        case 2:
          return t('Export Contacts');
      }
    };

    const content = () => {
      switch (selectedMenuItem) {
        case 0:
          return (
            <>
              <DialogContentText>
                {t('Log Newsletter placeholder text')}
              </DialogContentText>
            </>
          );
        case 1:
          return (
            <>
              <DialogContentText>
                {t(
                  'This is the primary email for every person in contacts marked as Newsletter-Email or Newsletter-Both. If they are marked as "Opted out of Email Newsletter", they are not included in this list.',
                )}
              </DialogContentText>
              <br />
              <DialogContentText>
                {t(
                  'Reminder: Please only use the Bcc: field when sending emails to groups of partners.',
                )}
              </DialogContentText>
              {contactsLoading || !newsletterContactsData?.contacts ? (
                <Skeleton
                  variant="text"
                  style={{ display: 'inline-block' }}
                  width={90}
                />
              ) : (
                <TextArea
                  disabled={true}
                  data-testid="emailList"
                  value={emailList}
                />
              )}
            </>
          );
        case 2:
          return (
            <>
              <DialogContentText>
                {t('Export contacts placeholder')}
              </DialogContentText>
            </>
          );
      }
    };

    const actions = () => {
      switch (selectedMenuItem) {
        case 0:
          return null;
        case 1:
          return (
            <Button
              disabled={emailList === ''}
              variant="contained"
              color="primary"
              onClick={() => navigator.clipboard.writeText(emailList)}
            >
              {t('Copy All')}
            </Button>
          );
        case 2:
          return null;
      }
    };
    return (
      <Dialog
        open={newsletterMenuDialogOpen}
        aria-labelledby={t('')}
        fullWidth
        maxWidth="md"
      >
        <NewsletterMenuDialogTitle>
          {title()}
          <CloseButton role="closeButton" onClick={handleDialogClose}>
            <CloseIcon />
          </CloseButton>
        </NewsletterMenuDialogTitle>
        <DialogContent dividers>{content()}</DialogContent>
        {selectedMenuItem === 2 ? null : (
          <DialogActions>{actions()}</DialogActions>
        )}
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

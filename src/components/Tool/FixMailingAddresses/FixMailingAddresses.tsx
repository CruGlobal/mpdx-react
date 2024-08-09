import React, { useCallback, useEffect, useState } from 'react';
import { ApolloCache } from '@apollo/client';
import { mdiCheckboxMarkedCircle } from '@mdi/js';
import { Icon } from '@mdi/react';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { Trans, useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { SetContactFocus } from 'pages/accountLists/[accountListId]/tools/useToolsHelper';
import { DynamicAddAddressModal } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/Mailing/AddAddressModal/DynamicAddAddressModal';
import { DynamicEditContactAddressModal } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/Mailing/EditContactAddressModal/DynamicEditContactAddressModal';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
import theme from '../../../theme';
import NoData from '../NoData';
import Contact from './Contact';
import {
  ContactAddressFragment,
  InvalidAddressesDocument,
  InvalidAddressesQuery,
  useInvalidAddressesQuery,
  useUpdateContactAddressMutation,
} from './GetInvalidAddresses.generated';

export type HandleSingleConfirmProps = {
  addresses: ContactAddressFragment[];
  id: string;
  name: string;
  onlyErrorOnce?: boolean;
};

const useStyles = makeStyles()(() => ({
  container: {
    padding: theme.spacing(3),
    width: '70%',
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  outer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    width: '100%',
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  descriptionBox: {
    marginBottom: theme.spacing(2),
  },
  footer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  confirmAllButton: {
    [theme.breakpoints.down('md')]: {
      width: '100%',
      maxWidth: '200px',
      margin: `${theme.spacing(1)} auto 0`,
    },
  },
  buttonIcon: {
    marginRight: theme.spacing(1),
  },
  defaultBox: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'center',
    },
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
      alignItems: 'start',
    },
  },
  select: {
    minWidth: theme.spacing(20),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),

    [theme.breakpoints.down('md')]: {
      width: '100%',
      maxWidth: '200px',
      margin: `${theme.spacing(1)} auto 0`,
    },
  },
}));

const appName = process.env.APP_NAME || 'MPDX';

export const emptyAddress: ContactAddressFragment = {
  id: 'new',
  source: appName,
  street: '',
  region: '',
  location: '',
  city: '',
  postalCode: '',
  country: '',
  primaryMailingAddress: false,
  historic: false,
  createdAt: '',
};

interface Props {
  accountListId: string;
  setContactFocus: SetContactFocus;
}
enum ModalEnum {
  New = 'New',
  Edit = 'Edit',
}

const FixMailingAddresses: React.FC<Props> = ({
  accountListId,
  setContactFocus,
}: Props) => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const [showEditAddressModal, setShowEditAddressModal] = useState(false);
  const [showNewAddressModal, setShowNewAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(emptyAddress);
  const [selectedContactId, setSelectedContactId] = useState('');
  const [defaultSource, setDefaultSource] = useState(appName);
  const [openBulkConfirmModal, setOpenBulkConfirmModal] = useState(false);
  const [sourceOptions, setSourceOptions] = useState<string[]>([appName]);

  const { data, loading } = useInvalidAddressesQuery({
    variables: { accountListId },
  });
  const [updateAddress] = useUpdateContactAddressMutation();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const existingSources = new Set<string>();
    existingSources.add(appName);

    data?.contacts.nodes.forEach((contact) => {
      contact.addresses.nodes.forEach((address) => {
        existingSources.add(address.source);
      });
    });
    setSourceOptions([...existingSources]);
  }, [loading, data]);

  const handleSingleConfirm = async ({
    addresses,
    id,
    name,
  }: HandleSingleConfirmProps) => {
    let errorOccurred = false;

    for (let idx = 0; idx < addresses.length; idx++) {
      const address = addresses[idx];

      await updateAddress({
        variables: {
          accountListId,
          attributes: {
            id: address.id,
            validValues: true,
            primaryMailingAddress: address.primaryMailingAddress,
          },
        },
        update(cache) {
          if (idx === addresses.length - 1 && !errorOccurred) {
            cache.evict({ id: `Contact:${id}` });
          }
        },
        onError() {
          errorOccurred = true;
        },
      });
    }

    if (errorOccurred) {
      enqueueSnackbar(t(`Error updating contact ${name}`), {
        variant: 'error',
        autoHideDuration: 7000,
      });
      return { success: false };
    } else {
      enqueueSnackbar(t(`Updated contact ${name}`), { variant: 'success' });
      return { success: true };
    }
  };

  const handleBulkConfirm = async () => {
    try {
      const callsByContact: (() => Promise<{ success: boolean }>)[] = [];
      data?.contacts?.nodes.forEach((contact) => {
        const primaryAddress = contact.addresses.nodes.find(
          (address) =>
            address.source === defaultSource ||
            (defaultSource === appName && address.source === 'MPDX'),
        );
        if (primaryAddress) {
          const addresses: ContactAddressFragment[] = [];
          contact.addresses.nodes.forEach((address) => {
            addresses.push({
              ...address,
              primaryMailingAddress: address.id === primaryAddress?.id,
            });
          });
          const callContactMutation = () =>
            handleSingleConfirm({
              addresses,
              id: contact.id,
              name: contact.name,
            });
          callsByContact.push(callContactMutation);
        }
      });

      if (callsByContact.length) {
        const results = await Promise.all(callsByContact.map((call) => call()));

        const failedUpdates = results.filter(
          (result) => !result.success,
        ).length;
        const successfulUpdates = results.length - failedUpdates;

        if (successfulUpdates) {
          enqueueSnackbar(t(`Updated ${successfulUpdates} contact(s)`), {
            variant: 'success',
          });
        }
        if (failedUpdates) {
          enqueueSnackbar(
            t(`Error when updating ${failedUpdates} contact(s)`),
            {
              variant: 'error',
            },
          );
        }
      } else {
        enqueueSnackbar(t(`No contacts were updated`), { variant: 'warning' });
      }
    } catch (error) {
      enqueueSnackbar(t(`Error updating contacts`), { variant: 'error' });
    }
  };

  const handleUpdateCacheForDeleteAddress = useCallback(
    (cache: ApolloCache<unknown>, data) => {
      cache.evict({
        id: `Address:${data.deletedAddressId}`,
      });
      cache.gc();
    },
    [],
  );

  const handleUpdateCacheForAddAddress = useCallback(
    (cache: ApolloCache<unknown>, createdAddressData) => {
      const InvalidAddressesQuery = {
        query: InvalidAddressesDocument,
        variables: {
          accountListId,
        },
      };
      const dataFromInvalidAddressesCache =
        cache.readQuery<InvalidAddressesQuery>(InvalidAddressesQuery);

      if (dataFromInvalidAddressesCache) {
        const newContacts = dataFromInvalidAddressesCache.contacts.nodes.map(
          (contact) => {
            if (contact.id !== createdAddressData.createAddress.contactId) {
              return contact;
            } else {
              return {
                ...contact,
                addresses: {
                  nodes: [
                    ...contact.addresses.nodes,
                    createdAddressData.createAddress.address,
                  ],
                },
              };
            }
          },
        );

        const data = {
          ...dataFromInvalidAddressesCache,
          contacts: {
            ...dataFromInvalidAddressesCache.contacts,
            nodes: newContacts,
          },
        };
        cache.writeQuery({ ...InvalidAddressesQuery, data });
      }
    },
    [],
  );

  const handleModalOpen = (
    modal: ModalEnum,
    address: ContactAddressFragment,
    contactId: string,
  ): void => {
    if (modal === ModalEnum.Edit) {
      setShowEditAddressModal(true);
    } else {
      setShowNewAddressModal(true);
    }
    setSelectedAddress(address);
    setSelectedContactId(contactId);
  };

  const handleClose = (): void => {
    setShowEditAddressModal(false);
    setShowNewAddressModal(false);
    setSelectedAddress(emptyAddress);
    setSelectedContactId('');
  };

  const handleSourceChange = (event: SelectChangeEvent<string>): void => {
    setDefaultSource(event.target.value);
  };

  const handleBulkConfirmModalClose = () => {
    setOpenBulkConfirmModal(false);
  };

  const totalContacts = data?.contacts?.nodes?.length || 0;

  return (
    <Box className={classes.outer} data-testid="Home">
      <Box className={classes.outer}>
        <Grid container className={classes.container}>
          <Grid item xs={12}>
            <Typography variant="h4">{t('Fix Mailing Addresses')}</Typography>
            <Divider className={classes.divider} />
          </Grid>

          {loading && !data && (
            <Box className={classes.outer}>
              <CircularProgress
                data-testid="loading"
                style={{ marginTop: theme.spacing(3) }}
              />
            </Box>
          )}

          {!loading && data && (
            <React.Fragment>
              {!totalContacts && <NoData tool="fixMailingAddresses" />}
              {totalContacts && (
                <>
                  <Grid item xs={12}>
                    <Box className={classes.descriptionBox}>
                      <Typography>
                        <strong>
                          {t(
                            'You have {{amount}} mailing addresses to confirm.',
                            {
                              amount: totalContacts,
                            },
                          )}
                        </strong>
                      </Typography>
                      <Typography>
                        {t(
                          'Choose below which mailing address will be set as primary. Primary mailing addresses will be used for Newsletter exports.',
                        )}
                      </Typography>
                      <Box className={classes.defaultBox}>
                        <Typography>{t('Default Primary Source:')}</Typography>

                        <Select
                          className={classes.select}
                          value={defaultSource}
                          onChange={handleSourceChange}
                          size="small"
                        >
                          {sourceOptions.map((source) => (
                            <MenuItem key={source} value={source}>
                              {source}
                            </MenuItem>
                          ))}
                        </Select>
                        <Button
                          variant="contained"
                          className={classes.confirmAllButton}
                          onClick={() => setOpenBulkConfirmModal(true)}
                        >
                          <Icon
                            path={mdiCheckboxMarkedCircle}
                            size={0.8}
                            className={classes.buttonIcon}
                          />
                          {t('Confirm {{amount}} as {{source}}', {
                            amount: totalContacts,
                            source: defaultSource,
                          })}
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    {data.contacts.nodes.map((contact) => (
                      <Contact
                        id={contact.id}
                        name={contact.name}
                        status={contact.status || ''}
                        key={contact.id}
                        addresses={contact.addresses.nodes}
                        appName={appName}
                        openEditAddressModal={(address, contactId) =>
                          handleModalOpen(ModalEnum.Edit, address, contactId)
                        }
                        openNewAddressModal={(address, contactId) =>
                          handleModalOpen(ModalEnum.New, address, contactId)
                        }
                        setContactFocus={setContactFocus}
                        handleSingleConfirm={handleSingleConfirm}
                      />
                    ))}
                  </Grid>
                  <Grid item xs={12}>
                    <Box className={classes.footer}>
                      <Typography>
                        <Trans
                          defaults="Showing <bold>{{value}}</bold> of <bold>{{value}}</bold>"
                          shouldUnescape
                          values={{ value: totalContacts }}
                          components={{ bold: <strong /> }}
                        />
                      </Typography>
                    </Box>
                  </Grid>
                </>
              )}
            </React.Fragment>
          )}
        </Grid>
      </Box>
      {showEditAddressModal && (
        <DynamicEditContactAddressModal
          accountListId={accountListId}
          address={selectedAddress}
          contactId={selectedContactId}
          handleClose={handleClose}
          handleUpdateCacheOnDelete={handleUpdateCacheForDeleteAddress}
        />
      )}
      {showNewAddressModal && (
        <DynamicAddAddressModal
          accountListId={accountListId}
          contactId={selectedContactId}
          handleClose={handleClose}
          handleUpdateCache={handleUpdateCacheForAddAddress}
        />
      )}
      {openBulkConfirmModal && (
        <Confirmation
          isOpen={true}
          title={t('Confirm')}
          message={t(
            `You are updating all contacts visible on this page, setting the first {{source}} address as the primary address. If no such address exists the contact will not be updated. Are you sure you want to do this?`,
            { source: defaultSource },
          )}
          handleClose={handleBulkConfirmModalClose}
          mutation={handleBulkConfirm}
        />
      )}
    </Box>
  );
};

export default FixMailingAddresses;

import NextLink from 'next/link';
import React, { Fragment } from 'react';
import styled from '@emotion/styled';
import { mdiCheckboxMarkedCircle } from '@mdi/js';
import { Icon } from '@mdi/react';
import StarIcon from '@mui/icons-material/Star';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Grid,
  Hidden,
  IconButton,
  Link,
  Typography,
} from '@mui/material';
import clsx from 'clsx';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { useSetContactPrimaryAddressMutation } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/Mailing/SetPrimaryAddress.generated';
import {
  AddButton,
  AddIcon,
  AddText,
  EditIcon,
  LockIcon,
} from 'src/components/Contacts/ContactDetails/ContactDetailsTab/StyledComponents';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useContactLinks } from 'src/hooks/useContactLinks';
import { useContactPartnershipStatuses } from 'src/hooks/useContactPartnershipStatuses';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { useLocale } from 'src/hooks/useLocale';
import { useUpdateCache } from 'src/hooks/useUpdateCache';
import { dateFormatShort } from 'src/lib/intlFormat';
import { isEditableSource, sourceToStr } from 'src/utils/sourceHelper';
import theme from '../../../theme';
import { HandleSingleConfirmProps, emptyAddress } from './FixMailingAddresses';
import { ContactAddressFragment } from './GetInvalidAddresses.generated';

const ContactHeader = styled(CardHeader)(() => ({
  '.MuiCardHeader-action': {
    alignSelf: 'center',
  },
}));

const ContactIconContainer = styled(IconButton)(() => ({
  margin: theme.spacing(0, 1),
  width: theme.spacing(4),
  height: theme.spacing(4),
}));

const ContactAvatar = styled(Avatar)(() => ({
  width: theme.spacing(4),
  height: theme.spacing(4),
}));

const useStyles = makeStyles()(() => ({
  confirmButon: {
    marginRight: theme.spacing(1),
  },
  AddButton: {
    width: '100%',
  },
  contactCard: {
    marginBottom: theme.spacing(2),
  },
  responsiveBorder: {
    [theme.breakpoints.down('sm')]: {
      paddingBottom: theme.spacing(2),
      borderBottom: `1px solid ${theme.palette.cruGrayMedium.main}`,
    },
  },
  paddingX: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  paddingY: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  paddingL2: {
    paddingLeft: theme.spacing(2),
    '@media(max-width: 900px)': {
      paddingLeft: 0,
    },
  },
  paddingB2: {
    paddingBottom: theme.spacing(2),
  },
  address: {
    borderBottom: '1px solid gray',
    width: '100%',
    cursor: 'pointer',
  },
  hoverHighlight: {
    cursor: 'pointer',
    '&:hover': {
      color: theme.palette.mpdxBlue.main,
    },
  },
  alignCenter: {
    textAlign: 'center',
  },
}));

interface Props {
  id: string;
  name: string;
  status: string;
  addresses: ContactAddressFragment[];
  openEditAddressModal: (address: ContactAddressFragment, id: string) => void;
  openNewAddressModal: (address: ContactAddressFragment, id: string) => void;
  handleSingleConfirm: ({
    addresses,
    id,
    name,
  }: HandleSingleConfirmProps) => void;
}

const Contact: React.FC<Props> = ({
  id,
  name,
  status,
  addresses,
  openEditAddressModal,
  openNewAddressModal,
  handleSingleConfirm,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { enqueueSnackbar } = useSnackbar();
  const { classes } = useStyles();
  const accountListId = useAccountListId();
  const { getContactUrl } = useContactLinks({
    url: `/accountLists/${accountListId}/tools/fix/mailingAddresses/`,
  });
  const contactUrl = getContactUrl(id);

  const newAddress = { ...emptyAddress, newAddress: true };
  const [setContactPrimaryAddress, { loading: settingPrimaryAddress }] =
    useSetContactPrimaryAddressMutation();
  const { update } = useUpdateCache(id);
  const { contactStatuses } = useContactPartnershipStatuses();
  const { appName } = useGetAppSettings();

  const handleSetPrimaryContact = async (address: ContactAddressFragment) => {
    await setContactPrimaryAddress({
      variables: {
        contactId: id,
        primaryAddressId: address.primaryMailingAddress ? null : address.id,
      },
      update,
      onCompleted: () => {
        enqueueSnackbar(t('Mailing information edited successfully'), {
          variant: 'success',
        });
      },
      onError: () => {
        enqueueSnackbar(
          t('Error occurred while updating mailing information'),
          {
            variant: 'error',
          },
        );
      },
    });
  };

  const handleConfirm = () => {
    handleSingleConfirm({ addresses, id, name });
  };

  return (
    <Card className={classes.contactCard}>
      <ContactHeader
        avatar={
          <NextLink href={contactUrl} passHref shallow>
            <Link underline="hover">
              <ContactAvatar src="" aria-label="Contact Avatar" />
            </Link>
          </NextLink>
        }
        action={
          <Button
            variant="contained"
            className={classes.confirmButon}
            onClick={handleConfirm}
          >
            <Icon path={mdiCheckboxMarkedCircle} size={0.8} />
            {t('Confirm')}
          </Button>
        }
        title={
          <NextLink href={contactUrl} passHref shallow>
            <Link underline="hover">
              <Typography display="inline" variant="h6">
                {name}
              </Typography>
            </Link>
          </NextLink>
        }
        subheader={
          <Typography>{contactStatuses[status]?.translated}</Typography>
        }
      />
      <CardContent className={(classes.paddingX, classes.paddingY)}>
        <Grid item xs={12}>
          <Grid container>
            <Hidden mdDown>
              <Grid item xs={12} md={5} className={classes.paddingB2}>
                <Box display="flex" justifyContent="space-between">
                  <Grid item md={8}>
                    <Typography>
                      <strong>{t('Source')}</strong>
                    </Typography>
                  </Grid>
                  <Grid item md={4}>
                    <Typography align="center">
                      <strong>{t('Primary')}</strong>
                    </Typography>
                  </Grid>
                </Box>
              </Grid>
              <Grid item xs={12} md={7} className={classes.paddingB2}>
                <Box
                  display="flex"
                  justifyContent="flex-start"
                  className={classes.paddingX}
                >
                  <Typography>
                    <strong>{t('Address')}</strong>
                  </Typography>
                </Box>
              </Grid>
            </Hidden>
            {addresses.map((address) => (
              <Fragment key={address.id}>
                <Grid item xs={12} md={5} className={classes.paddingB2}>
                  <Box display="flex" justifyContent="space-between">
                    <Grid item md={8}>
                      <Hidden mdUp>
                        <Typography display="inline">
                          <strong>{t('Source')}: </strong>
                        </Typography>
                      </Hidden>
                      <Typography display="inline">
                        {sourceToStr(t, address.source)}{' '}
                      </Typography>
                      <Typography display="inline">
                        {dateFormatShort(
                          DateTime.fromISO(
                            address.startDate || address.createdAt,
                          ),
                          locale,
                        )}
                      </Typography>
                    </Grid>
                    <Grid item md={4} className={classes.alignCenter}>
                      {!settingPrimaryAddress && (
                        <ContactIconContainer
                          aria-label={t('Edit Icon')}
                          onClick={() => handleSetPrimaryContact(address)}
                        >
                          {address.primaryMailingAddress ? (
                            <StarIcon
                              className={classes.hoverHighlight}
                              data-testid="primaryContactStarIcon"
                            />
                          ) : (
                            <StarOutlineIcon
                              className={classes.hoverHighlight}
                              data-testid="contactStarIcon"
                            />
                          )}
                        </ContactIconContainer>
                      )}
                      {settingPrimaryAddress && (
                        <CircularProgress
                          size={'20px'}
                          data-testid="settingPrimaryAddress"
                        />
                      )}
                    </Grid>
                  </Box>
                </Grid>
                <Grid item xs={12} md={7} className={classes.paddingB2}>
                  <Box
                    display="flex"
                    justifyContent="flex-start"
                    className={clsx(
                      classes.responsiveBorder,
                      classes.paddingL2,
                      classes.hoverHighlight,
                    )}
                    data-testid={`address-${address.id}`}
                    onClick={() => openEditAddressModal(address, id)}
                  >
                    <Box className={classes.address}>
                      <Typography
                        style={{
                          textDecoration: address.historic
                            ? 'line-through'
                            : 'none',
                        }}
                      >
                        {`${address.street ? address.street : ''}, ${
                          address.city ? address.city : ''
                        } ${address.state ? address.state : ''} ${
                          address.postalCode ? address.postalCode : ''
                        }`}
                      </Typography>
                    </Box>

                    <ContactIconContainer aria-label={t('Edit Icon')}>
                      {isEditableSource(address.source) ? (
                        <EditIcon />
                      ) : (
                        <LockIcon />
                      )}
                    </ContactIconContainer>
                  </Box>
                </Grid>
              </Fragment>
            ))}
            <Grid item xs={12} md={5} className={classes.paddingB2}>
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Hidden mdUp>
                    <Typography display="inline">
                      <strong>{t('Source')}: </strong>
                    </Typography>
                  </Hidden>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={7} className={classes.paddingB2}>
              <Box
                display="flex"
                justifyContent="flex-start"
                className={clsx(
                  classes.responsiveBorder,
                  classes.hoverHighlight,
                )}
              >
                <AddButton
                  className={classes.AddButton}
                  data-testid={`addAddress-${id}`}
                  onClick={() => openNewAddressModal(newAddress, id)}
                >
                  <AddIcon />
                  <AddText variant="subtitle1">
                    {t('Add Address ({{appName}})', { appName })}
                  </AddText>
                </AddButton>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Contact;

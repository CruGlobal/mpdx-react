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
  Grid,
  Hidden,
  IconButton,
  Typography,
} from '@mui/material';
import clsx from 'clsx';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import {
  AddButton,
  AddIcon,
  AddText,
  EditIcon,
  LockIcon,
} from 'src/components/Contacts/ContactDetails/ContactDetailsTab/StyledComponents';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormatShort } from 'src/lib/intlFormat';
import { contactPartnershipStatus } from 'src/utils/contacts/contactPartnershipStatus';
import theme from '../../../theme';
import { emptyAddress } from './FixMailingAddresses';
import { ContactAddressFragment } from './GetInvalidAddresses.generated';

const ContactHeader = styled(CardHeader)(() => ({
  '.MuiCardHeader-action': {
    alignSelf: 'center',
  },
}));

const ContactEditIconContainer = styled(IconButton)(() => ({
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
}));

interface Props {
  id: string;
  name: string;
  status: string;
  addresses: ContactAddressFragment[];
  openEditAddressModal: (address: ContactAddressFragment, id: string) => void;
  openNewAddressModal: (address: ContactAddressFragment, id: string) => void;
}

const Contact: React.FC<Props> = ({
  id,
  name,
  status,
  addresses,
  openEditAddressModal,
  openNewAddressModal,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { classes } = useStyles();
  const newAddress = { ...emptyAddress, newAddress: true };
  //TODO: Add button functionality
  //TODO: Make contact name a link to contact page

  return (
    <Card className={classes.contactCard}>
      <ContactHeader
        avatar={<ContactAvatar src="" aria-label="Contact Avatar" />}
        action={
          <Button variant="contained" className={classes.confirmButon}>
            <Icon path={mdiCheckboxMarkedCircle} size={0.8} />
            {t('Confirm')}
          </Button>
        }
        title={<Typography variant="h6">{name}</Typography>}
        subheader={<Typography>{contactPartnershipStatus[status]}</Typography>}
      />
      <CardContent className={(classes.paddingX, classes.paddingY)}>
        <Grid item xs={12}>
          <Grid container>
            <Hidden mdDown>
              <Grid item xs={12} md={6} className={classes.paddingB2}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  className={classes.paddingX}
                >
                  <Typography>
                    <strong>{t('Source')}</strong>
                  </Typography>
                  <Typography>
                    <strong>{t('Primary')}</strong>
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6} className={classes.paddingB2}>
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
              <Fragment key={address.street}>
                <Grid item xs={12} md={6} className={classes.paddingB2}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    className={classes.paddingX}
                  >
                    <Box>
                      <Hidden mdUp>
                        <Typography display="inline">
                          <strong>{t('Source')}: </strong>
                        </Typography>
                      </Hidden>
                      <Typography display="inline">
                        {address.source}{' '}
                      </Typography>
                      <Typography display="inline">
                        {dateFormatShort(
                          DateTime.fromISO(address.createdAt),
                          locale,
                        )}
                      </Typography>
                    </Box>
                    <Typography>
                      {address.primaryMailingAddress ? (
                        <StarIcon className={classes.hoverHighlight} />
                      ) : (
                        <StarOutlineIcon className={classes.hoverHighlight} />
                      )}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6} className={classes.paddingB2}>
                  <Box
                    display="flex"
                    justifyContent="flex-start"
                    className={clsx(
                      classes.responsiveBorder,
                      classes.paddingL2,
                      classes.hoverHighlight,
                    )}
                    onClick={() => openEditAddressModal(address, id)}
                  >
                    <Box className={classes.address}>
                      <Typography>
                        {`${address.street}, ${address.city} ${
                          address.state ? address.state : ''
                        }. ${address.postalCode}`}
                      </Typography>
                    </Box>

                    <ContactEditIconContainer aria-label={t('Edit Icon')}>
                      {address.source === 'MPDX' ? <EditIcon /> : <LockIcon />}
                    </ContactEditIconContainer>
                  </Box>
                </Grid>
              </Fragment>
            ))}
            <Grid item xs={12} md={6} className={classes.paddingB2}>
              <Box
                display="flex"
                justifyContent="space-between"
                className={classes.paddingX}
              >
                <Box>
                  <Hidden mdUp>
                    <Typography display="inline">
                      <strong>{t('Source')}: </strong>
                    </Typography>
                  </Hidden>
                  <Typography display="inline">MPDX</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} className={classes.paddingB2}>
              <Box
                display="flex"
                justifyContent="flex-start"
                className={clsx(
                  classes.responsiveBorder,
                  classes.paddingX,
                  classes.hoverHighlight,
                )}
              >
                <AddButton
                  className={classes.AddButton}
                  onClick={() => openNewAddressModal(newAddress, id)}
                >
                  <AddIcon />
                  <AddText variant="subtitle1">{t('Add Address')}</AddText>
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

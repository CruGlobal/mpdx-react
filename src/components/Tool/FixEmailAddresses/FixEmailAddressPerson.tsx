import React, { Fragment, useState } from 'react';
import {
  Box,
  Grid,
  Button,
  Typography,
  Avatar,
  makeStyles,
  Hidden,
  TextField,
  Theme,
  styled,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Icon } from '@mdi/react';
import {
  mdiCheckboxMarkedCircle,
  mdiLock,
  mdiPlus,
  mdiDelete,
  mdiStarOutline,
  mdiStar,
} from '@mdi/js';
import { DateTime } from 'luxon';
import { PersonEmailAddressInput } from '../../../../graphql/types.generated';
import theme from '../../../theme';
import { ConfirmButtonIcon, EmailAddressData } from './FixEmailAddresses';

const PersonCard = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    border: `1px solid ${theme.palette.cruGrayMedium.main}`,
  },
}));

const Container = styled(Grid)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    border: `1px solid ${theme.palette.cruGrayMedium.main}`,
  },
}));

const EmailAddressListWrapper = styled(Grid)(({ theme }) => ({
  backgroundColor: theme.palette.cruGrayLight.main,
  width: '100%',
  [theme.breakpoints.down('xs')]: {
    paddingTop: theme.spacing(2),
  },
}));

const ConfirmButtonWrapper = styled(Box)(({ theme }) => ({
  marginLeft: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(2),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  '& .MuiButton-root': {
    backgroundColor: theme.palette.mpdxBlue.main,
    color: 'white',
  },
}));

const BoxWithResponsiveBorder = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('xs')]: {
    paddingBottom: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.cruGrayMedium.main}`,
  },
}));

const ColumnHeaderWrapper = styled(Grid)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
}));

const RowWrapper = styled(Grid)(({ theme }) => ({
  paddingBottom: theme.spacing(2),
}));

const HoverableIcon = styled(Icon)(({ theme }) => ({
  '&:hover': {
    color: theme.palette.mpdxBlue.main,
    cursor: 'pointer',
  },
}));

const useStyles = makeStyles((theme: Theme) => ({
  avatar: {
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
}));

export interface email {
  source: string;
  date: string;
  address: string;
  primary: boolean;
}

interface FixEmailAddressPersonProps {
  name: string;
  emails: EmailAddressData[];
  personId: string;
  toDelete: PersonEmailAddressInput[];
  handleChange: (
    personId: string,
    numberIndex: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  handleDelete: (personId: string, emailAddress: number) => void;
  handleAdd: (personId: string, email: string) => void;
  handleChangePrimary: (personId: string, emailIndex: number) => void;
}

export const FixEmailAddressPerson: React.FC<FixEmailAddressPersonProps> = ({
  name,
  emails,
  personId,
  handleChange,
  handleDelete,
  handleAdd,
  handleChangePrimary,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [newEmailAddress, setNewEmailAddress] = useState<string>('');
  //TODO: Add button functionality
  //TODO: Make name pop up a modal to edit the person info

  const updateNewEmailAddress = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setNewEmailAddress(event.target.value);
  };

  const addNewEmailAddress = (): void => {
    if (newEmailAddress) {
      handleAdd(personId, newEmailAddress);
      setNewEmailAddress('');
    }
  };

  return (
    <Container container>
      <Grid container>
        <Grid item md={10} xs={12}>
          <PersonCard display="flex" alignItems="center">
            <Grid container>
              <Grid item xs={12}>
                <Box
                  display="flex"
                  alignItems="center"
                  style={{ height: '100%' }}
                  p={2}
                >
                  <Avatar src="" className={classes.avatar} />
                  <Box display="flex" flexDirection="column" ml={2}>
                    <Typography variant="h6">{name}</Typography>
                  </Box>
                </Box>
              </Grid>

              <EmailAddressListWrapper item xs={12}>
                <Grid container>
                  <Hidden xsDown>
                    <ColumnHeaderWrapper item xs={12} sm={6}>
                      <Box display="flex" justifyContent="space-between" px={2}>
                        <Typography>
                          <strong>{t('Source')}</strong>
                        </Typography>
                        <Typography>
                          <strong>{t('Primary')}</strong>
                        </Typography>
                      </Box>
                    </ColumnHeaderWrapper>
                    <ColumnHeaderWrapper item xs={12} sm={6}>
                      <Box display="flex" justifyContent="flex-start" px={2}>
                        <Typography>
                          <strong>{t('Address')}</strong>
                        </Typography>
                      </Box>
                    </ColumnHeaderWrapper>
                  </Hidden>
                  {emails.map((email, index) => (
                    <Fragment key={index}>
                      <RowWrapper item xs={12} sm={6}>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          px={2}
                        >
                          <Box>
                            <Hidden smUp>
                              <Typography display="inline">
                                <strong>{t('Source')}: </strong>
                              </Typography>
                            </Hidden>
                            <Typography display="inline">
                              {`${email.source} (${DateTime.fromISO(
                                email.updatedAt,
                              ).toLocaleString(DateTime.DATE_SHORT)})`}
                            </Typography>
                          </Box>
                          <Typography>
                            {email.primary ? (
                              <Box
                                data-testid={`starIcon-${personId}-${index}`}
                              >
                                <HoverableIcon path={mdiStar} size={1} />
                              </Box>
                            ) : (
                              <Box
                                data-testid={`starOutlineIcon-${personId}-${index}`}
                                onClick={() =>
                                  handleChangePrimary(personId, index)
                                }
                              >
                                <HoverableIcon path={mdiStarOutline} size={1} />
                              </Box>
                            )}
                          </Typography>
                        </Box>
                      </RowWrapper>
                      <RowWrapper item xs={12} sm={6}>
                        <BoxWithResponsiveBorder
                          display="flex"
                          px={2}
                          justifyContent="flex-start"
                        >
                          <TextField
                            style={{ width: '100%' }}
                            inputProps={{
                              'data-testid': `textfield-${personId}-${index}`,
                            }}
                            onChange={(
                              event: React.ChangeEvent<HTMLInputElement>,
                            ) => handleChange(personId, index, event)}
                            value={email.email}
                            disabled={email.source !== 'MPDX'}
                          />

                          {email.source === 'MPDX' ? (
                            <Box
                              data-testid={`delete-${personId}-${index}`}
                              onClick={() => handleDelete(personId, index)}
                            >
                              <HoverableIcon path={mdiDelete} size={1} />
                            </Box>
                          ) : (
                            <Icon
                              path={mdiLock}
                              size={1}
                              style={{
                                color: theme.palette.cruGrayMedium.main,
                              }}
                            />
                          )}
                        </BoxWithResponsiveBorder>
                      </RowWrapper>
                    </Fragment>
                  ))}
                  <RowWrapper item xs={12} sm={6}>
                    <Box display="flex" justifyContent="space-between" px={2}>
                      <Box>
                        <Hidden smUp>
                          <Typography display="inline">
                            <strong>{t('Source')}: </strong>
                          </Typography>
                        </Hidden>
                        <Typography display="inline">MPDX</Typography>
                      </Box>
                    </Box>
                  </RowWrapper>
                  <RowWrapper item xs={12} sm={6}>
                    <BoxWithResponsiveBorder
                      display="flex"
                      justifyContent="flex-start"
                      px={2}
                    >
                      <TextField
                        style={{ width: '100%' }}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>,
                        ) => updateNewEmailAddress(event)}
                        inputProps={{
                          'data-testid': `addNewEmailInput-${personId}`,
                        }}
                        value={newEmailAddress}
                      />
                      <Box
                        onClick={() => addNewEmailAddress()}
                        data-testid={`addButton-${personId}`}
                      >
                        <HoverableIcon path={mdiPlus} size={1} />
                      </Box>
                    </BoxWithResponsiveBorder>
                  </RowWrapper>
                </Grid>
              </EmailAddressListWrapper>
            </Grid>
          </PersonCard>
        </Grid>
        <Grid item xs={12} md={2}>
          <Box
            display="flex"
            flexDirection="column"
            style={{ paddingLeft: theme.spacing(1) }}
          >
            <ConfirmButtonWrapper>
              <Button variant="contained" style={{ width: '100%' }}>
                <ConfirmButtonIcon path={mdiCheckboxMarkedCircle} size={0.8} />
                {t('Confirm')}
              </Button>
            </ConfirmButtonWrapper>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

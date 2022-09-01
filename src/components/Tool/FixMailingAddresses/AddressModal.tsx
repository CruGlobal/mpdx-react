import React from 'react';
import clsx from 'clsx';
import {
  Box,
  Typography,
  Grid,
  Button,
  Modal,
  Card,
  CardHeader,
  CardContent,
  TextField,
  NativeSelect,
  CardActions,
  Checkbox,
  IconButton,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useTranslation } from 'react-i18next';

import { mdiMap, mdiCloseThick, mdiInformation } from '@mdi/js';
import Icon from '@mdi/react';
import theme from '../../../theme';
import { StyledInput } from './StyledInput';
import { ContactAddressFragment } from './GetInvalidAddresses.generated';

const useStyles = makeStyles(() => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'auto',
  },
  paddingX: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  paddingY: {
    paddingBottom: theme.spacing(2),
  },
  actionButtons: {
    textTransform: 'none',
  },
  blue: {
    color: 'white',
    backgroundColor: theme.palette.mpdxBlue.main,
  },
  iconButton: {
    position: 'absolute',
    top: -theme.spacing(2),
    right: -theme.spacing(2),
  },
  headerBox: {
    padding: 0,
    position: 'relative',
  },
  mapBox: {
    marginTop: theme.spacing(1),
    height: 200,
    width: '100%',
    backgroundColor: theme.palette.cruGrayDark.main,
  },
  widthFull: {
    width: '100%',
  },
  cardContent: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingTop: 0,
    paddingBottom: 0,
    border: 'none',
    outline: 'none',
  },
  infoBox: {
    border: `1px solid ${theme.palette.mpdxBlue.main}`,
    backgroundColor: theme.palette.cruGrayLight.main,
    color: theme.palette.mpdxBlue.main,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
  },
  infoMain: {
    display: 'flex',
    fontWeight: 600,
    marginBottom: theme.spacing(1),
  },
}));

interface Props {
  modalState: {
    open: boolean;
    address: ContactAddressFragment;
  };
  handleClose: () => void;
  handleChange: (
    event:
      | React.ChangeEvent<HTMLInputElement & HTMLSelectElement>
      | React.ChangeEvent<HTMLInputElement>,
    props: string,
  ) => void;
}

const AddressModal: React.FC<Props> = ({
  modalState,
  handleClose,
  handleChange,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const disableAll = !modalState.address.source.includes('MPDX');

  return (
    <Modal
      open={modalState.open}
      onClose={handleClose}
      className={classes.modal}
    >
      <Grid item xs={10} md={6} lg={4}>
        <Box>
          <Card>
            <CardHeader
              style={{ border: 'none' }}
              title={
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  className={classes.headerBox}
                >
                  <Typography
                    variant="h5"
                    style={{ marginTop: -theme.spacing(1) }}
                  >
                    {modalState.address.id === 'new'
                      ? 'Add Address'
                      : 'Edit Address'}
                  </Typography>
                  <IconButton
                    onClick={handleClose}
                    className={classes.iconButton}
                  >
                    <Icon path={mdiCloseThick} size={1} />
                  </IconButton>
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    className={classes.mapBox}
                  >
                    <Icon path={mdiMap} size={4} style={{ color: 'white' }} />
                  </Box>
                </Box>
              }
            />
            <CardContent className={classes.cardContent}>
              {disableAll && (
                <Box className={classes.infoBox}>
                  <Typography className={classes.infoMain}>
                    <Icon
                      path={mdiInformation}
                      size={1}
                      style={{ marginRight: theme.spacing(1) }}
                    />
                    This address is provided by your organization.
                  </Typography>
                  <Typography>
                    The address that syncs with your organization’s donations
                    cannot be edited here. Please email your donation department
                    with the updated address, or you can create a new address
                    and select it as your primary mailing address.
                  </Typography>
                </Box>
              )}
              <Grid container>
                <Grid
                  item
                  xs={12}
                  sm={9}
                  className={clsx(classes.paddingX, classes.paddingY)}
                >
                  <TextField
                    label="Street"
                    variant="outlined"
                    value={modalState.address?.street}
                    size="small"
                    className={classes.widthFull}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange(event, 'street')
                    }
                    disabled={disableAll}
                  />
                </Grid>
                <Grid
                  item
                  xs={6}
                  sm={3}
                  className={clsx(classes.paddingX, classes.paddingY)}
                >
                  <NativeSelect
                    value={modalState.address?.location || ''}
                    input={<StyledInput />}
                    disabled={disableAll}
                    onChange={(
                      event: React.ChangeEvent<
                        HTMLSelectElement & HTMLInputElement
                      >,
                    ) => handleChange(event, 'location')}
                    className={classes.widthFull}
                  >
                    <option value="" disabled>
                      Type
                    </option>
                    <option value="home">{t('Home')}</option>
                    <option value="business">{t('Business')}</option>
                    <option value="mailing">{t('Mailing')}</option>
                    <option value="seasonal">{t('Seasonal')}</option>
                    <option value="other">{t('Other')}</option>
                    <option value="temporary">{t('Temporary')}</option>
                    <option value="repAddress">{t('Rep Address')}</option>
                  </NativeSelect>
                </Grid>
                <Grid
                  item
                  xs={6}
                  sm={6}
                  className={clsx(classes.paddingX, classes.paddingY)}
                >
                  <TextField
                    label="City"
                    disabled={disableAll}
                    variant="outlined"
                    value={modalState.address?.city}
                    size="small"
                    className={classes.widthFull}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange(event, 'city')
                    }
                  />
                </Grid>
                <Grid
                  item
                  xs={6}
                  sm={3}
                  className={clsx(classes.paddingX, classes.paddingY)}
                >
                  <TextField
                    label="State"
                    disabled={disableAll}
                    variant="outlined"
                    value={modalState.address?.state || ''}
                    size="small"
                    className={classes.widthFull}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange(event, 'state')
                    }
                  />
                </Grid>
                <Grid
                  item
                  xs={6}
                  sm={3}
                  className={clsx(classes.paddingX, classes.paddingY)}
                >
                  <TextField
                    label="Zip"
                    disabled={disableAll}
                    variant="outlined"
                    value={modalState.address?.postalCode || ''}
                    size="small"
                    className={classes.widthFull}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange(event, 'postalCode')
                    }
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  className={clsx(classes.paddingX, classes.paddingY)}
                >
                  <TextField
                    label="Country"
                    disabled={disableAll}
                    variant="outlined"
                    value={modalState.address?.country}
                    size="small"
                    className={classes.widthFull}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange(event, 'country')
                    }
                  />
                </Grid>
                <Grid
                  item
                  xs={6}
                  sm={3}
                  className={clsx(classes.paddingX, classes.paddingY)}
                >
                  <TextField
                    label="Region"
                    disabled={disableAll}
                    variant="outlined"
                    value={modalState.address?.region || ''}
                    size="small"
                    className={classes.widthFull}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange(event, 'region')
                    }
                  />
                </Grid>
                <Grid
                  item
                  xs={6}
                  sm={3}
                  className={clsx(classes.paddingX, classes.paddingY)}
                >
                  <TextField
                    label="Metro"
                    variant="outlined"
                    disabled={disableAll}
                    value={modalState.address?.metroArea || ''}
                    size="small"
                    className={classes.widthFull}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange(event, 'metroArea')
                    }
                  />
                </Grid>
                <Grid item xs={12} className={clsx(classes.paddingX)}>
                  <Box
                    display="flex"
                    alignItems="center"
                    style={{ marginTop: -theme.spacing(1) }}
                  >
                    <Checkbox
                      checked={
                        modalState.address
                          ? modalState.address?.historic
                          : false
                      }
                      name="checkbox"
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        handleChange(event, 'historic')
                      }
                    />
                    <Typography style={{ marginLeft: theme.spacing(1) }}>
                      Address no longer valid
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
            <CardActions style={{ padding: theme.spacing(2) }}>
              <Button
                variant="contained"
                size="small"
                className={classes.actionButtons}
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                disabled={disableAll}
                size="small"
                className={clsx(classes.blue, classes.actionButtons)}
              >
                {/*TODO: make "newAddress" field in address false so it says "edit" instead of "add" */}
                Save
              </Button>
            </CardActions>
          </Card>
        </Box>
      </Grid>
    </Modal>
  );
};

export default AddressModal;

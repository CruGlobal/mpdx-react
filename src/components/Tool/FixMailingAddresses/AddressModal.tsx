import React, { ReactElement } from 'react';
import clsx from 'clsx';
import {
  makeStyles,
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
} from '@material-ui/core';

import { mdiMap, mdiCloseThick } from '@mdi/js';
import Icon from '@mdi/react';
import theme from '../../../theme';
import { StyledInput } from './StyledInput';
import { address } from './Contact';

const useStyles = makeStyles(() => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
    padding: theme.spacing(1),
    paddingTop: theme.spacing(2),
    paddingBottom: 0,
  },
}));

interface Props {
  modalState: {
    open: boolean;
    address: address;
  };
  handleClose: () => void;
  handleChange: (event, props) => void;
}

const AddressModal = ({
  modalState,
  handleClose,
  handleChange,
}: Props): ReactElement => {
  const classes = useStyles();

  return (
    <Modal
      open={modalState.open}
      onClose={handleClose}
      className={classes.modal}
    >
      <Grid item xs={8} md={6} lg={4}>
        <Box>
          <Card>
            <CardHeader
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
                    {modalState.address !== null
                      ? 'Edit Address'
                      : 'Add Address'}
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
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={3}
                  className={clsx(classes.paddingX, classes.paddingY)}
                >
                  <NativeSelect
                    value={modalState.address?.locationType || ''}
                    input={<StyledInput />}
                    onChange={(event) => handleChange(event, 'locationType')}
                    className={classes.widthFull}
                  >
                    <option value="" disabled>
                      Type
                    </option>
                    <option value="home">Home</option>
                    <option value="business">Business</option>
                    <option value="mailing">Mailing</option>
                    <option value="seasonal">Seasonal</option>
                    <option value="other">Other</option>
                    <option value="temporary">Temporary</option>
                    <option value="repAddress">Rep Address</option>
                  </NativeSelect>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  className={clsx(classes.paddingX, classes.paddingY)}
                >
                  <TextField
                    label="City"
                    variant="outlined"
                    value={modalState.address?.city}
                    size="small"
                    className={classes.widthFull}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={3}
                  className={clsx(classes.paddingX, classes.paddingY)}
                >
                  <TextField
                    label="State"
                    variant="outlined"
                    value={modalState.address?.state || ''}
                    size="small"
                    className={classes.widthFull}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={3}
                  className={clsx(classes.paddingX, classes.paddingY)}
                >
                  <TextField
                    label="Zip"
                    variant="outlined"
                    value={modalState.address?.zip || ''}
                    size="small"
                    className={classes.widthFull}
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
                    variant="outlined"
                    value={modalState.address?.country}
                    size="small"
                    className={classes.widthFull}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={3}
                  className={clsx(classes.paddingX, classes.paddingY)}
                >
                  <TextField
                    label="Region"
                    variant="outlined"
                    value={modalState.address?.region || ''}
                    size="small"
                    className={classes.widthFull}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={3}
                  className={clsx(classes.paddingX, classes.paddingY)}
                >
                  <TextField
                    label="Metro"
                    variant="outlined"
                    value={modalState.address?.metro || ''}
                    size="small"
                    className={classes.widthFull}
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
                        modalState.address ? !modalState.address?.valid : false
                      }
                      name="checkbox"
                      onChange={(event) => handleChange(event, 'valid')}
                    />
                    <Typography style={{ marginLeft: theme.spacing(1) }}>
                      Address no longer valid
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
            <CardActions>
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
                size="small"
                className={clsx(classes.blue, classes.actionButtons)}
              >
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

import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Modal,
  Typography,
  makeStyles,
  Theme,
  IconButton,
  Box,
} from '@mui/material';
import Icon from '@mdi/react';
import clsx from 'clsx';
import React from 'react';
import { mdiCloseThick } from '@mdi/js';
import { useTranslation } from 'react-i18next';
import theme from '../../../theme';
import { ModalState } from './FixPhoneNumbers';

const useStyles = makeStyles((theme: Theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'auto',
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
    '&:hover': {
      color: 'red',
    },
  },
  headerBox: {
    padding: 0,
    marginBottom: -theme.spacing(1),
    position: 'relative',
  },
}));

interface Props {
  modalState: ModalState;
  handleClose: () => void;
  handleDelete: () => void;
}

const DeleteModal: React.FC<Props> = ({
  modalState,
  handleClose,
  handleDelete,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <Modal
      open={modalState.open}
      onClose={handleClose}
      className={classes.modal}
    >
      <Card>
        <CardHeader
          title={
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              className={classes.headerBox}
            >
              <Typography variant="h5" style={{ marginTop: -theme.spacing(1) }}>
                {t('Confirm')}
              </Typography>
              <IconButton onClick={handleClose} className={classes.iconButton}>
                <Icon path={mdiCloseThick} size={1} />
              </IconButton>
            </Box>
          }
        />
        <CardContent>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
          >
            <Typography>
              {t('Are you sure you wish to delete this phone number:')}
            </Typography>
            <Typography>{`"${modalState.phoneNumber}"`}</Typography>
          </Box>
        </CardContent>
        <CardActions>
          <Button
            variant="contained"
            size="small"
            className={classes.actionButtons}
            onClick={handleClose}
          >
            {t('Cancel')}
          </Button>
          <Button
            variant="contained"
            size="small"
            className={clsx(classes.blue, classes.actionButtons)}
            data-testid="phoneNumberDeleteButton"
            onClick={handleDelete}
          >
            {/*TODO: make "newNumber" field in number false so it says "edit" instead of "add" */}
            {t('Delete')}
          </Button>
        </CardActions>
      </Card>
    </Modal>
  );
};

export default DeleteModal;

import React from 'react';
import { mdiCloseThick } from '@mdi/js';
import Icon from '@mdi/react';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  IconButton,
  Modal,
  Theme,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import {
  CancelButton,
  DeleteButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import theme from '../../../theme';
import { ModalState } from './FixPhoneNumbers';

const useStyles = makeStyles()((theme: Theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'auto',
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
  const { classes } = useStyles();
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
            </Box>
          }
          action={
            <IconButton onClick={handleClose}>
              <Icon path={mdiCloseThick} size={1} />
            </IconButton>
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
          <CancelButton onClick={handleClose} />
          <DeleteButton onClick={handleDelete} sx={{ marginRight: 0 }}>
            {/*TODO: make "newNumber" field in number false so it says "edit" instead of "add" */}
            {t('Delete')}
          </DeleteButton>
        </CardActions>
      </Card>
    </Modal>
  );
};

export default DeleteModal;

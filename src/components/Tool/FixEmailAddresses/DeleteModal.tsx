import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Modal,
  Typography,
  Theme,
  IconButton,
  Box,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import Icon from '@mdi/react';
import React from 'react';
import { mdiCloseThick } from '@mdi/js';
import { useTranslation } from 'react-i18next';
import theme from '../../../theme';
import { ModalState } from './FixEmailAddresses';
import {
  CancelButton,
  DeleteButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';

const useStyles = makeStyles((theme: Theme) => ({
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
              {t('Are you sure you wish to delete this email address:')}
            </Typography>
            <Typography>{`"${modalState.emailAddress}"`}</Typography>
          </Box>
        </CardContent>
        <CardActions>
          <CancelButton onClick={handleClose} />
          <DeleteButton
            dataTestId="emailAddressDeleteButton"
            onClick={handleDelete}
            sx={{ marginRight: 0 }}
          >
            {/*TODO: make "newAddress" field in address false so it says "edit" instead of "add" */}
            {t('Delete')}
          </DeleteButton>
        </CardActions>
      </Card>
    </Modal>
  );
};

export default DeleteModal;

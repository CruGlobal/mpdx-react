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
import theme from 'src/theme';
import { ModalState } from '../FixEmailAddresses';

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
  handleDelete: ({ personId, id, email }: ModalState) => void;
}

const DeleteModal: React.FC<Props> = ({
  modalState,
  handleClose,
  handleDelete,
}) => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  return (
    <Modal open={true} onClose={handleClose} className={classes.modal}>
      <Card>
        <CardHeader
          title={
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              className={classes.headerBox}
              position="relative"
            >
              <IconButton
                onClick={handleClose}
                className={classes.iconButton}
                style={{
                  position: 'absolute',
                  top: -4,
                  right: 0,
                }}
              >
                <Icon path={mdiCloseThick} size={1} />
              </IconButton>
              <Typography
                variant="h5"
                style={{ marginTop: -theme.spacing(1), alignSelf: 'center' }}
              >
                {t('Confirm')}
              </Typography>
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
            <Typography>{`"${modalState.email}"`}</Typography>
          </Box>
        </CardContent>
        <CardActions>
          <CancelButton onClick={handleClose} />
          <DeleteButton
            dataTestId="emailAddressDeleteButton"
            onClick={() => handleDelete(modalState)}
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

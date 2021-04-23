import React, { ReactElement, useMemo } from 'react';
import {
  Button,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
  IconButton,
  styled,
  TextareaAutosize,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import CloseIcon from '@material-ui/icons/Close';
import { useTranslation } from 'react-i18next';
import { useGetEmailNewsletterContactsQuery } from './GetNewsletterContacts.generated';

interface Props {
  accountListId: string;
  handleClose: () => void;
}

const ExportEmailTitle = styled(DialogTitle)(() => ({
  textTransform: 'uppercase',
  textAlign: 'center',
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(1),
  top: theme.spacing(1),
  color: theme.palette.text.primary,
  '&:hover': {
    backgroundColor: '#EBECEC',
  },
}));

const TextArea = styled(TextareaAutosize)(() => ({
  width: '100%',
}));

const ExportEmail = ({
  accountListId,
  handleClose,
}: Props): ReactElement<Props> => {
  const { t } = useTranslation();

  const { data, loading } = useGetEmailNewsletterContactsQuery({
    variables: { accountListId },
  });

  const emailList = useMemo(
    () =>
      data?.contacts?.nodes
        .map((contact) => contact.primaryPerson?.primaryEmailAddress?.email)
        .filter(Boolean)
        .join(','),
    [data],
  );

  return (
    <>
      <ExportEmailTitle>
        {t('Email Newsletter List')}
        <CloseButton onClick={handleClose}>
          <CloseIcon titleAccess={t('Close')} />
        </CloseButton>
      </ExportEmailTitle>
      <DialogContent dividers>
        <>
          <DialogContentText>
            {t(
              'This is the primary email for every person in contacts marked as Newsletter-Email or Newsletter-Both. If they are marked as "Opted out of Email Newsletter", they are not included in this list.',
            )}
          </DialogContentText>
          <br />
          <DialogContentText>
            {t(
              'Reminder: Please only use the Bcc: field when sending emails to groups of partners.',
            )}
          </DialogContentText>
          {loading || !data?.contacts ? (
            <Skeleton
              variant="text"
              style={{ display: 'inline-block' }}
              width={90}
            />
          ) : (
            <TextArea
              disabled={true}
              data-testid="emailList"
              value={emailList}
            />
          )}
        </>
      </DialogContent>
      <DialogActions>
        <Button
          disabled={!emailList}
          variant="contained"
          color="primary"
          onClick={() => emailList && navigator.clipboard.writeText(emailList)}
        >
          {t('Copy All')}
        </Button>
      </DialogActions>
    </>
  );
};

export default ExportEmail;

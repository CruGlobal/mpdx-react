import React, { ReactElement, useMemo } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Skeleton,
  TextareaAutosize,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useFetchAllPages } from 'src/hooks/useFetchAllPages';
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
    backgroundColor: theme.palette.cruGrayLight.main,
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

  const { data, error, fetchMore } = useGetEmailNewsletterContactsQuery({
    variables: { accountListId },
  });
  const { loading } = useFetchAllPages({
    fetchMore,
    error,
    pageInfo: data?.contacts.pageInfo,
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
          {loading ? (
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

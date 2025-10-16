import React, { ReactElement, useMemo } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Skeleton,
  TextareaAutosize,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { StyledDialogContentText } from 'src/components/Shared/styledComponents/StyledDialogContentText';
import { useFetchAllPages } from 'src/hooks/useFetchAllPages';
import { CloseButton } from '../styledComponents/CloseButton';
import { useGetEmailNewsletterContactsQuery } from './GetNewsletterContacts.generated';

interface Props {
  accountListId: string;
  handleClose: () => void;
}

const ExportEmailTitle = styled(DialogTitle)(() => ({
  textTransform: 'uppercase',
  textAlign: 'center',
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

  const emailList = useMemo(() => {
    if (!data) {
      return '';
    }
    return data.contacts.nodes
      .flatMap((contact) => contact.people.nodes)
      .filter(
        (person) => person.primaryEmailAddress && !person.optoutEnewsletter,
      )
      .map((person) => person.primaryEmailAddress?.email)
      .join(',');
  }, [data]);

  return (
    <>
      <ExportEmailTitle>
        {t('Digital Newsletter List')}
        <CloseButton onClick={handleClose}>
          <CloseIcon titleAccess={t('Close')} />
        </CloseButton>
      </ExportEmailTitle>
      <DialogContent dividers>
        <>
          <StyledDialogContentText>
            {t(
              'This is the primary email for every person in contacts marked as Newsletter-Digital or Newsletter-Both. If they are marked as "Opted out of Digital Newsletter", they are not included in this list.',
            )}
          </StyledDialogContentText>
          <br />
          <StyledDialogContentText>
            {t(
              'Reminder: Please only use the Bcc: field when sending emails to groups of partners.',
            )}
          </StyledDialogContentText>
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

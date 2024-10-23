import React, { useState } from 'react';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Box, CircularProgress, TextField, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { useTranslation } from 'react-i18next';
import { ActionButton } from 'src/components/common/Modal/ActionButtons/ActionButtons';
import theme from 'src/theme';
import Modal from '../../../../common/Modal/Modal';
import { useGetEmailsForExportingQuery } from './GetEmailsForExporting.generated';

interface MassActionsExportEmailsModalProps {
  ids: string[];
  accountListId: string;
  handleClose: () => void;
}

const ContentWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const HelperText = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(1),
}));

const CopyButtonWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  textAlign: 'right',
  marginTop: theme.spacing(1),
}));

export const MassActionsExportEmailsModal: React.FC<
  MassActionsExportEmailsModalProps
> = ({ handleClose, accountListId, ids }) => {
  const { t } = useTranslation();

  const [showOutlookFormat, setShowOutlookFormat] = useState(false);

  const { data: contactData, loading } = useGetEmailsForExportingQuery({
    // This query is affecting the cache of the Contacts query, so prevent it from reading from or writing to the Apollo cache
    // It's possibly a bug in our "nodes" logic in src/lib/relayStylePaginationWithNodes.tsx
    fetchPolicy: 'no-cache',

    variables: {
      accountListId,
      contactIds: ids,
      numContactIds: ids.length,
    },
  });

  // Contact Query filters "optOut" removes any contacts that one of their people has opted out of the digital newsletter.
  // So we have to filter out contacts that have opted out of the digital newsletter from the people nodes.
  const contactPrimaryEmails =
    contactData?.contacts.nodes
      .flatMap((contact) => contact.people.nodes)
      .filter(
        (person) => person.primaryEmailAddress && !person.optoutEnewsletter,
      )
      .map((person) => person.primaryEmailAddress?.email) ?? [];

  const regularFormat = contactPrimaryEmails.join(',');

  const outlookFormat = contactPrimaryEmails.join(';');

  return (
    <Modal title={t('Export Emails')} isOpen={true} handleClose={handleClose}>
      <ContentWrapper data-testid="ExportEmailsModal">
        <HelperText variant="body2">
          {t(
            'This is the primary email for every person in the selected contacts. If they are marked as "Opted out of Digital Newsletter", they are not included in this list.',
          )}
        </HelperText>
        <HelperText variant="body2" style={{ color: theme.palette.error.dark }}>
          {t(
            'Reminder: Please only use the Bcc: field when sending emails to groups of partners.',
          )}
        </HelperText>
        {!loading ? (
          <TextField
            fullWidth
            multiline
            rows={3}
            defaultValue={regularFormat}
            variant="outlined"
            InputProps={{
              readOnly: true,
            }}
          />
        ) : (
          <CircularProgress />
        )}
        <CopyButtonWrapper>
          <ActionButton
            onClick={() => navigator.clipboard.writeText(regularFormat)}
          >
            Copy All
          </ActionButton>
        </CopyButtonWrapper>
        <ActionButton onClick={() => setShowOutlookFormat(!showOutlookFormat)}>
          Microsoft Outlook Format{' '}
          {showOutlookFormat ? <ExpandLess /> : <ExpandMore />}
        </ActionButton>
        {showOutlookFormat && (
          <>
            <HelperText
              variant="body2"
              style={{ color: theme.palette.mpdxBlue.main }}
            >
              {t(
                'Microsoft Outlook requires emails to be separated by semicolons instead of commas.',
              )}
            </HelperText>
            {!loading ? (
              <TextField
                fullWidth
                multiline
                rows={3}
                defaultValue={outlookFormat}
                variant="outlined"
                InputProps={{
                  readOnly: true,
                }}
              />
            ) : (
              <CircularProgress />
            )}
            <CopyButtonWrapper>
              <ActionButton
                onClick={() => navigator.clipboard.writeText(outlookFormat)}
              >
                Copy All
              </ActionButton>
            </CopyButtonWrapper>
          </>
        )}
      </ContentWrapper>
    </Modal>
  );
};

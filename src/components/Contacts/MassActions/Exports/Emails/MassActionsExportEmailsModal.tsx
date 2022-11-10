import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../../../../common/Modal/Modal';
import { useGetEmailsForExportingQuery } from './GetEmailsForExporting.generated';
import theme from 'src/theme';
import { Box, CircularProgress, TextField, Typography } from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { ActionButton } from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { styled } from '@mui/system';

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
    variables: {
      accountListId,
      contactsFilters: {
        ids,
      },
    },
  });

  const contactPrimaryEmails =
    contactData?.contacts.nodes
      .flatMap((contact) => contact.people.nodes)
      .filter((person) => person.primaryEmailAddress)
      .map((person) => person.primaryEmailAddress?.email) ?? [];

  const regularFormat = contactPrimaryEmails.join(',');

  const outlookFormat = contactPrimaryEmails.join(';');

  return (
    <Modal title={t('Export Emails')} isOpen={true} handleClose={handleClose}>
      <ContentWrapper>
        <HelperText variant="body2">
          {t(
            'This is the primary email for every person in the selected contacts. If they are marked as "Opted out of Email Newsletter", they are not included in this list.',
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

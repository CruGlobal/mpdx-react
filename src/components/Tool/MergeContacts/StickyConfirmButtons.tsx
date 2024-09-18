import React, { Dispatch, SetStateAction } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { StickyButtonHeaderBox } from 'src/components/Shared/Header/styledComponents';
import { ActionType } from './MergeContacts';

interface StickyConfirmButtonsProps {
  accountListId: string;
  confirmAction: () => void;
  disabled: boolean;
  setActions: Dispatch<SetStateAction<Record<string, ActionType>>>;
  duplicatesDisplayedCount: number;
  totalCount: number;
}
export const StickyConfirmButtons: React.FC<StickyConfirmButtonsProps> = ({
  accountListId,
  confirmAction,
  disabled,
  setActions,
  duplicatesDisplayedCount,
  totalCount,
}) => {
  const { t } = useTranslation();

  const handleConfirmAndContinue = async () => {
    await confirmAction();
    setActions({});
  };
  const handleConfirmAndLeave = async () => {
    await confirmAction();
    setActions({});
    window.location.href = `${process.env.SITE_URL}/accountLists/${accountListId}/tools`;
  };
  return (
    <StickyButtonHeaderBox>
      <Box>
        <Typography>
          <Trans
            defaults="<i>Showing <bold>{{duplicatesDisplayedCount}}</bold> of <bold>{{totalCount}}</bold></i>"
            shouldUnescape
            values={{
              duplicatesDisplayedCount,
              totalCount,
            }}
            components={{ bold: <strong />, i: <i /> }}
          />
        </Typography>
      </Box>
      <Box>
        <Button
          variant="contained"
          disabled={disabled}
          onClick={() => handleConfirmAndContinue()}
          sx={{ mr: 2 }}
        >
          {t('Confirm and Continue')}
        </Button>
        <Button
          variant="contained"
          disabled={disabled}
          onClick={() => handleConfirmAndLeave()}
        >
          {t('Confirm and Leave')}
        </Button>
      </Box>
    </StickyButtonHeaderBox>
  );
};

import React, { Dispatch, SetStateAction } from 'react';
import styled from '@emotion/styled';
import { Box, Button, Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { LoadingSpinner } from 'src/components/Settings/Organization/LoadingSpinner';
import theme from 'src/theme';
import { ActionType } from './MergeContacts';

export const ButtonHeaderBox = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  backgroundColor: 'white',
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  position: 'sticky',
  top: '64px',
  zIndex: '100',
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.cruGrayLight.main,
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'start',
    top: '56px',
  },
}));
interface StickyConfirmButtonsProps {
  accountListId: string;
  confirmAction: () => void;
  disabled: boolean;
  loading: boolean;
  setActions: Dispatch<SetStateAction<Record<string, ActionType>>>;
  duplicatesDisplayedCount: number;
  totalCount: number;
  updating: boolean;
}
export const StickyConfirmButtons: React.FC<StickyConfirmButtonsProps> = ({
  accountListId,
  confirmAction,
  disabled,
  loading,
  setActions,
  duplicatesDisplayedCount,
  totalCount,
  updating,
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
    <ButtonHeaderBox>
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
      {(loading || updating) && (
        <LoadingSpinner firstLoad={true} data-testid="LoadingSpinner" />
      )}
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
    </ButtonHeaderBox>
  );
};

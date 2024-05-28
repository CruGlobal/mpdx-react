import NextLink from 'next/link';
import React, { useState } from 'react';
import Add from '@mui/icons-material/Add';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from '../../../../../hooks/useAccountListId';
import { ContactFlowOption } from '../../ContactFlow';
import { ResetToDefaultModal } from './ResetToDefault/ResetToDefaultModal';

const HeaderWrap = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(2),
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: `1px solid ${theme.palette.cruGrayMedium.main}`,
}));

const ButtonWrap = styled(Box)(() => ({
  ['@media (max-width: 380px)']: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'end',
  },
}));

const BackButton = styled(Button)(({ theme }) => ({
  color: theme.palette.cruGrayDark.main,
  borderColor: theme.palette.cruGrayDark.main,
  paddingLeft: theme.spacing(1),
  textTransform: 'none',
}));

const ResetButton = styled(Button)(({ theme }) => ({
  color: theme.palette.cruGrayDark.main,
  textTransform: 'none',
  ['@media (min-width: 381px)']: {
    marginRight: theme.spacing(3),
  },
}));

const AddColumnLoadingButton = styled(LoadingButton)(({ theme }) => ({
  backgroundColor: theme.palette.mpdxBlue.main,
  color: theme.palette.common.white,
  textTransform: 'none',
  paddingRight: theme.spacing(1.5),
  '&:hover': {
    backgroundColor: theme.palette.info.dark,
  },
  '&.Mui-disabled': {
    color: theme.palette.common.white,
  },
}));

interface Props {
  addColumn: () => void;
  updateOptions: (options: ContactFlowOption[]) => Promise<void>;
  resetColumnsMessage: string;
}

export const ContactFlowSetupHeader: React.FC<Props> = ({
  addColumn,
  updateOptions,
  resetColumnsMessage,
}: Props) => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const [addingColumn, setAddingColumn] = useState(false);
  const [showResetToDefaultModal, setShowResetToDefaultModal] = useState(false);

  const handleAddColumnButtonClick = async () => {
    setAddingColumn(true);
    await addColumn();
    setAddingColumn(false);
  };

  const handleResetToDefault = () => {
    setShowResetToDefaultModal(true);
  };

  return (
    <HeaderWrap>
      <NextLink href={`/accountLists/${accountListId}/contacts`}>
        <BackButton variant="outlined">
          <ChevronLeft />
          {t('Contacts')}
        </BackButton>
      </NextLink>
      <ButtonWrap>
        <ResetButton onClick={handleResetToDefault}>
          {t('Reset to default')}
        </ResetButton>
        <AddColumnLoadingButton
          loading={addingColumn}
          loadingPosition="start"
          startIcon={<Add />}
          onClick={handleAddColumnButtonClick}
        >
          {t('Add Column')}
        </AddColumnLoadingButton>
      </ButtonWrap>
      {showResetToDefaultModal && (
        <ResetToDefaultModal
          handleClose={() => setShowResetToDefaultModal(false)}
          updateOptions={updateOptions}
          resetColumnsMessage={resetColumnsMessage}
        />
      )}
    </HeaderWrap>
  );
};

import React from 'react';
import { styled, Box, Button } from '@material-ui/core';
import { ChevronLeft } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';

const HeaderWrap = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(2),
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: `1px solid ${theme.palette.cruGrayMedium.main}`,
}));

const BackButton = styled(Button)(({ theme }) => ({
  color: theme.palette.info.main,
  borderColor: theme.palette.info.main,
  fontWeight: 600,
}));

const AddColumnButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.mpdxBlue.main,
  color: theme.palette.common.white,
}));

interface Props {
  addColumn: () => void;
}

export const ContactFlowSetupHeader: React.FC<Props> = ({
  addColumn,
}: Props) => {
  const { t } = useTranslation();
  return (
    <HeaderWrap>
      <BackButton variant="outlined">
        <ChevronLeft />
        {t('Contacts')}
      </BackButton>
      <AddColumnButton onClick={addColumn}>{t('Add Column')}</AddColumnButton>
    </HeaderWrap>
  );
};

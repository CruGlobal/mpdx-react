import React from 'react';
import { styled, Box, Button } from '@material-ui/core';
import { ChevronLeft, Add } from '@material-ui/icons';
import NextLink from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from '../../../../../../src/hooks/useAccountListId';

const HeaderWrap = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(2),
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: `1px solid ${theme.palette.cruGrayMedium.main}`,
}));

const BackButton = styled(Button)(({ theme }) => ({
  color: theme.palette.cruGrayDark.main,
  borderColor: theme.palette.cruGrayDark.main,
  paddingLeft: theme.spacing(1),
  textTransform: 'none',
}));

const AddColumnButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.mpdxBlue.main,
  color: theme.palette.common.white,
  textTransform: 'none',
  paddingRight: theme.spacing(1.5),
  '&:hover': {
    backgroundColor: theme.palette.info.dark,
  },
}));

interface Props {
  addColumn: () => void;
}

export const ContactFlowSetupHeader: React.FC<Props> = ({
  addColumn,
}: Props) => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  return (
    <HeaderWrap>
      <NextLink href={`/accountLists/${accountListId}/contacts`}>
        <BackButton variant="outlined">
          <ChevronLeft />
          {t('Contacts')}
        </BackButton>
      </NextLink>
      <AddColumnButton onClick={addColumn}>
        <Add />
        {t('Add Column')}
      </AddColumnButton>
    </HeaderWrap>
  );
};

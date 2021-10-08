import React from 'react';
import { Box, Typography, styled } from '@material-ui/core';
import { mdiPhone } from '@mdi/js';
import { useTranslation } from 'react-i18next';
import Icon from '@mdi/react';

const StyledBox = styled(Box)(({ theme }) => ({
  width: '100%',
  border: '1px solid',
  borderColor: theme.palette.cruGrayMedium.main,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  backgroundColor: theme.palette.cruGrayLight.main,
  paddingTop: theme.spacing(7),
  paddingBottom: theme.spacing(7),
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  textAlign: 'center',
  boxShadow: `0px 0px 5px ${theme.palette.cruGrayMedium.main} inset`,
}));

const NoContacts: React.FC = () => {
  const { t } = useTranslation();
  return (
    <StyledBox data-testid="no-contacts">
      <Icon path={mdiPhone} size={1.5} />
      <Typography variant="h5">
        {t('No people with phone numbers need attention')}
      </Typography>
      <Typography>
        {t(
          'People with new phone numbers or multiple primary phone numbers will appear here.',
        )}
      </Typography>
    </StyledBox>
  );
};

export default NoContacts;

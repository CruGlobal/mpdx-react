import Link from 'next/link';
import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import theme from 'src/theme';

export const NoEditAccess: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container
      maxWidth="md"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="h2">
          {t('You do not have permission to edit this request.')}
        </Typography>

        <Typography variant="h6">
          {t(
            'Our records show that this request is either approved or under review. If you believe you should have access to edit this request, please contact ',
          )}
          <Link
            href="mailto:support@mpdx.org"
            style={{ color: theme.palette.primary.main, fontWeight: 'bold' }}
          >
            support@mpdx.org
          </Link>
          .
        </Typography>
      </Box>
    </Container>
  );
};

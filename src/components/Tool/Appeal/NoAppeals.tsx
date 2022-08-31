import { Box, CardContent, Typography } from '@mui/material';
import React, { ReactElement } from 'react';
import Icon from '@mdi/react';
import { mdiTrophy } from '@mdi/js';
import { useTranslation } from 'react-i18next';
import AnimatedCard from '../../../../src/components/AnimatedCard';

export interface Props {
  primary?: boolean;
}

const NoAppeals = ({ primary }: Props): ReactElement => {
  const { t } = useTranslation();

  return (
    <Box m={1}>
      <AnimatedCard>
        <CardContent>
          <Box
            display="flex"
            justifyContent="center"
            textAlign="center"
            flexDirection="column"
            alignItems="center"
          >
            <Icon path={mdiTrophy} size={3} />
            <Typography variant="h6">
              {primary
                ? t('No Primary Appeal has been selected.')
                : t('No Appeals have been setup yet.')}
            </Typography>
          </Box>
        </CardContent>
      </AnimatedCard>
    </Box>
  );
};

export default NoAppeals;

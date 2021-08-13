import { Box, CardContent, Typography } from '@material-ui/core';
import React, { ReactElement } from 'react';
import Icon from '@mdi/react';
import { mdiAlertCircleOutline } from '@mdi/js';
import AnimatedCard from '../../../../src/components/AnimatedCard';

export interface Props {
  primary?: boolean;
}

const NoAppeals = ({ primary }: Props): ReactElement => {
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
            <Icon path={mdiAlertCircleOutline} size={3} />
            <Typography variant="h6">
              {primary
                ? 'You do not have a primary appeal.'
                : 'You do not have any appeals.'}
            </Typography>
          </Box>
        </CardContent>
      </AnimatedCard>
    </Box>
  );
};

export default NoAppeals;

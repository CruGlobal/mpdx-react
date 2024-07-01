import React, { ReactElement } from 'react';
import { mdiTrophy } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, CardContent, Theme, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import AnimatedCard from '../../AnimatedCard';

export interface Props {
  primary?: boolean;
}

const useStyles = makeStyles()((theme: Theme) => ({
  greyedOut: {
    backgroundColor: theme.palette.cruGrayLight.main,
  },
}));

const NoAppeals = ({ primary }: Props): ReactElement => {
  const { t } = useTranslation();
  const { classes } = useStyles();

  return (
    <Box m={1}>
      <AnimatedCard className={classes.greyedOut}>
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

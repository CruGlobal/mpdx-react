import React, { ReactElement } from 'react';
import { Box, Typography, Divider } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import Appeal from '../../../../src/components/Tool/Appeal/Appeal';
import NoAppeals from '../../../../src/components/Tool/Appeal/NoAppeals';

export interface Props {
  appeal: Appeal;
}

export interface Appeal {
  __typename?: string;
  amount?: number;
  amountCurrency: string;
  id: string;
  name?: string;
  pledgesAmountNotReceivedNotProcessed: number;
  pledgesAmountProcessed: number;
  pledgesAmountReceivedNotProcessed: number;
  pledgesAmountTotal: number;
}

const PrimaryAppeal = ({ appeal }: Props): ReactElement => {
  const { t } = useTranslation();

  return (
    <Box>
      <Box m={1}>
        <Typography variant="h6">{t('Primary Appeal')}</Typography>
      </Box>
      <Divider />
      {appeal ? (
        <>
          <Appeal
            name={appeal.name || ''}
            primary
            amount={appeal.amount || 0}
            amountCurrency={appeal.amountCurrency}
            given={appeal.pledgesAmountProcessed || 0}
            received={appeal.pledgesAmountReceivedNotProcessed || 0}
            commited={appeal.pledgesAmountNotReceivedNotProcessed || 0}
            total={appeal.pledgesAmountTotal || 0}
          />
        </>
      ) : (
        <NoAppeals />
      )}
    </Box>
  );
};

export default PrimaryAppeal;

import React, { ReactElement } from 'react';
import {
  Box,
  Typography,
  Divider,
  CircularProgress,
  styled,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useGetPrimaryAppealQuery } from '../../../../pages/accountLists/[accountListId]/tools/GetPrimaryAppeal.generated';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';
import Appeal from '../../../../src/components/Tool/Appeal/Appeal';
import NoAppeals from '../../../../src/components/Tool/Appeal/NoAppeals';

const LoadingIndicator = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(0, 1, 0, 0),
}));

const PrimaryAppeal = (): ReactElement => {
  const accountListId = useAccountListId();
  const { t } = useTranslation();
  const { data, loading } = useGetPrimaryAppealQuery({
    variables: { id: accountListId || '' },
  });

  return (
    <Box>
      <Box m={1}>
        <Typography variant="h6">{t('Primary Appeal')}</Typography>
      </Box>
      <Divider />
      {loading ? (
        <LoadingIndicator color="primary" size={20} />
      ) : data && data.accountList.primaryAppeal ? (
        <>
          <Appeal
            name={data.accountList.primaryAppeal.name || ''}
            amount={data.accountList.primaryAppeal.amount || 0}
            amountCurrency={data.accountList.primaryAppeal.amountCurrency}
            given={data.accountList.primaryAppeal.pledgesAmountProcessed || 0}
            received={
              data.accountList.primaryAppeal
                .pledgesAmountReceivedNotProcessed || 0
            }
            commited={
              data.accountList.primaryAppeal
                .pledgesAmountNotReceivedNotProcessed || 0
            }
            total={data.accountList.primaryAppeal.pledgesAmountTotal || 0}
          />
        </>
      ) : (
        <NoAppeals />
      )}
    </Box>
  );
};

export default PrimaryAppeal;

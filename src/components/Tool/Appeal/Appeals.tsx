import React from 'react';
import {
  Box,
  Typography,
  Divider,
  CircularProgress,
  styled,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useGetAppealsQuery } from '../../../../pages/accountLists/[accountListId]/tools/GetAppeals.generated';
import Appeal from '../../../../src/components/Tool/Appeal/Appeal';
import NoAppeals from '../../../../src/components/Tool/Appeal/NoAppeals';

const LoadingIndicator = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(0, 1, 0, 0),
}));

interface Props {
  accountListId: string;
}

const Appeals: React.FC<Props> = ({ accountListId }: Props) => {
  const { t } = useTranslation();
  const { data, loading } = useGetAppealsQuery({
    variables: { accountListId: accountListId || '' },
  });

  return (
    <Box mb={1}>
      <Box m={1}>
        <Typography variant="h6">{t('Primary Appeal')}</Typography>
      </Box>
      <Divider />
      {loading ? (
        <Box display="flex" justifyContent="center" mt={10}>
          <LoadingIndicator color="primary" size={40} />
        </Box>
      ) : data?.primaryAppeal && data.primaryAppeal.nodes.length > 0 ? (
        <Appeal
          name={data.primaryAppeal.nodes[0].name || ''}
          id={data.primaryAppeal.nodes[0].id || ''}
          primary
          amount={data.primaryAppeal.nodes[0].amount || 0}
          amountCurrency={data.primaryAppeal.nodes[0].amountCurrency}
          given={data.primaryAppeal.nodes[0].pledgesAmountProcessed || 0}
          received={
            data.primaryAppeal.nodes[0].pledgesAmountReceivedNotProcessed || 0
          }
          commited={
            data.primaryAppeal.nodes[0].pledgesAmountNotReceivedNotProcessed ||
            0
          }
          total={data.primaryAppeal.nodes[0].pledgesAmountTotal || 0}
        />
      ) : (
        <NoAppeals primary />
      )}
      <Box m={1}>
        <Typography variant="h6">{t('Appeals')}</Typography>
      </Box>
      <Divider />
      {loading ? (
        <Box display="flex" justifyContent="center" mt={10}>
          <LoadingIndicator color="primary" size={40} />
        </Box>
      ) : data?.regularAppeals && data.regularAppeals.nodes.length > 0 ? (
        <>
          {data.regularAppeals.nodes.map((appeal) => (
            <Box key={appeal.name} mb={3}>
              <Appeal
                name={appeal.name || ''}
                id={appeal.id || ''}
                primary={false}
                amount={appeal.amount || 0}
                amountCurrency={appeal.amountCurrency}
                given={appeal.pledgesAmountProcessed}
                received={appeal.pledgesAmountReceivedNotProcessed}
                commited={appeal.pledgesAmountNotReceivedNotProcessed}
                total={appeal.pledgesAmountTotal}
              />
            </Box>
          ))}
        </>
      ) : (
        <NoAppeals />
      )}
      {!loading && (
        <Box display="flex" justifyContent="center">
          <Typography variant="h6" data-testid="TypographyShowing">
            Showing{' '}
            <strong>
              {(data?.primaryAppeal ? data.primaryAppeal.nodes.length : 0) +
                (data?.regularAppeals ? data.regularAppeals.nodes.length : 0)}
            </strong>{' '}
            of{' '}
            <strong>
              {(data?.primaryAppeal ? data.primaryAppeal.nodes.length : 0) +
                (data?.regularAppeals ? data.regularAppeals.nodes.length : 0)}
            </strong>
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Appeals;

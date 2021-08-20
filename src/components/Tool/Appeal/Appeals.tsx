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
import { useGetAppealsQuery } from '../../../../pages/accountLists/[accountListId]/tools/GetAppeals.generated';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';
import Appeal from '../../../../src/components/Tool/Appeal/Appeal';
import NoAppeals from '../../../../src/components/Tool/Appeal/NoAppeals';

const LoadingIndicator = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(0, 1, 0, 0),
}));

const Appeals = (): ReactElement => {
  const accountListId = useAccountListId();
  const { t } = useTranslation();
  const primaryAppealResponse = useGetPrimaryAppealQuery({
    variables: { accountListId: accountListId || '' },
  });
  const regularAppealsResponse = useGetAppealsQuery({
    variables: { accountListId: accountListId || '' },
  });

  return (
    <Box mb={1}>
      <Box m={1}>
        <Typography variant="h6">{t('Primary Appeal')}</Typography>
      </Box>
      <Divider />
      {primaryAppealResponse.loading ? (
        <Box display="flex" justifyContent="center" mt={10}>
          <LoadingIndicator color="primary" size={40} />
        </Box>
      ) : primaryAppealResponse.data && primaryAppealResponse.data.appeals ? (
        <Appeal
          name={primaryAppealResponse.data.appeals.nodes[0].name || ''}
          id={primaryAppealResponse.data.appeals.nodes[0].id || ''}
          primary
          amount={primaryAppealResponse.data.appeals.nodes[0].amount || 0}
          amountCurrency={
            primaryAppealResponse.data.appeals.nodes[0].amountCurrency
          }
          given={
            primaryAppealResponse.data.appeals.nodes[0]
              .pledgesAmountProcessed || 0
          }
          received={
            primaryAppealResponse.data.appeals.nodes[0]
              .pledgesAmountReceivedNotProcessed || 0
          }
          commited={
            primaryAppealResponse.data.appeals.nodes[0]
              .pledgesAmountNotReceivedNotProcessed || 0
          }
          total={
            primaryAppealResponse.data.appeals.nodes[0].pledgesAmountTotal || 0
          }
        />
      ) : (
        <NoAppeals primary />
      )}
      <Box m={1}>
        <Typography variant="h6">{t('Appeals')}</Typography>
      </Box>
      <Divider />
      {regularAppealsResponse.loading ? (
        <Box display="flex" justifyContent="center" mt={10}>
          <LoadingIndicator color="primary" size={40} />
        </Box>
      ) : regularAppealsResponse.data && regularAppealsResponse.data.appeals ? (
        <>
          {regularAppealsResponse.data.appeals.nodes.map((appeal) => (
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
      {!primaryAppealResponse.loading && !regularAppealsResponse.loading && (
        <Box display="flex" justifyContent="center">
          <Typography variant="h6" data-testid="TypographyShowing">
            Showing{' '}
            <strong>
              {(primaryAppealResponse.data
                ? primaryAppealResponse.data.appeals.nodes.length
                : 0) +
                (regularAppealsResponse.data
                  ? regularAppealsResponse.data.appeals.nodes.length
                  : 0)}
            </strong>{' '}
            of{' '}
            <strong>
              {(primaryAppealResponse.data
                ? primaryAppealResponse.data.appeals.nodes.length
                : 0) +
                (regularAppealsResponse.data
                  ? regularAppealsResponse.data.appeals.nodes.length
                  : 0)}
            </strong>
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Appeals;

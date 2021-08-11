import React, { ReactElement } from 'react';
import {
  Box,
  Typography,
  Divider,
  CircularProgress,
  styled,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useGetAppealsQuery } from '../../../../pages/accountLists/[accountListId]/tools/GetAppeals.generated';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';
import Appeal from '../../../../src/components/Tool/Appeal/Appeal';
import NoAppeals from '../../../../src/components/Tool/Appeal/NoAppeals';

const LoadingIndicator = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(0, 1, 0, 0),
}));

export interface Props {
  primaryId: string;
}

const Appeals = ({ primaryId }: Props): ReactElement => {
  const accountListId = useAccountListId();
  const { t } = useTranslation();
  const { data, loading } = useGetAppealsQuery({
    variables: { accountListId: accountListId || '' },
  });

  return (
    <Box mb={1}>
      <Box m={1}>
        <Typography variant="h6">{t('Appeals')}</Typography>
      </Box>
      <Divider />
      {loading ? (
        <Box display="flex" justifyContent="center" mt={10}>
          <LoadingIndicator color="primary" size={20} />
        </Box>
      ) : data && data.appeals ? (
        <>
          {data.appeals
            .filter((appeal) => appeal.id !== primaryId)
            .map((appeal) => (
              <Box key={appeal.name} mb={3}>
                <Appeal
                  name={appeal.name || ''}
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
          <Box display="flex" justifyContent="center">
            <Typography variant="h6">
              Showing{' '}
              <strong>
                {
                  data.appeals.filter((appeal) => appeal.id !== primaryId)
                    .length // Incase there is no primary appeal.
                }
              </strong>{' '}
              of{' '}
              <strong>
                {
                  data.appeals.filter((appeal) => appeal.id !== primaryId)
                    .length
                }
              </strong>
            </Typography>
          </Box>
        </>
      ) : (
        <NoAppeals />
      )}
    </Box>
  );
};

export default Appeals;

import React, { useMemo } from 'react';
import { Box, Divider, Skeleton, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { Trans, useTranslation } from 'react-i18next';
import {
  GetAppealsDocument,
  useGetAppealsQuery,
} from 'pages/accountLists/[accountListId]/tools/GetAppeals.generated';
import { useFetchAllPages } from 'src/hooks/useFetchAllPages';
import Appeal from './Appeal';
import { useChangePrimaryAppealMutation } from './ChangePrimaryAppeal.generated';
import NoAppeals from './NoAppeals';

interface AppealsProps {
  accountListId: string;
}

const Appeals: React.FC<AppealsProps> = ({ accountListId }) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [changePrimaryAppeal, { loading: updating }] =
    useChangePrimaryAppealMutation();
  const { data, error, fetchMore } = useGetAppealsQuery({
    variables: { accountListId },
  });
  const { loading } = useFetchAllPages({
    fetchMore,
    error,
    pageInfo: data?.regularAppeals.pageInfo,
  });

  const handleChangePrimary = async (newPrimaryId: string): Promise<void> => {
    await changePrimaryAppeal({
      variables: {
        accountListId,
        attributes: {
          id: newPrimaryId,
          primary: true,
        },
      },
      refetchQueries: [
        { query: GetAppealsDocument, variables: { accountListId } },
      ],
      onCompleted: () => {
        enqueueSnackbar(t('Appeal successfully set to primary'), {
          variant: 'success',
        });
      },
      onError: () => {
        enqueueSnackbar(t('Unable to set appeal as primary'), {
          variant: 'error',
        });
      },
    });
  };

  const primaryAppeal = useMemo(() => {
    if (data?.primaryAppeal) {
      return data.primaryAppeal.nodes[0];
    } else {
      return null;
    }
  }, [data]);

  return (
    <Box mb={1}>
      <Box m={1}>
        <Typography variant="h6">{t('Primary Appeal')}</Typography>
      </Box>
      <Divider />
      {loading || updating ? (
        <Skeleton height={'170px'} />
      ) : primaryAppeal ? (
        <Appeal
          appeal={primaryAppeal}
          primary={true}
          changePrimary={handleChangePrimary}
        />
      ) : (
        <NoAppeals primary />
      )}
      <Box m={1}>
        <Typography variant="h6">{t('Appeals')}</Typography>
      </Box>
      <Divider />
      {loading || updating ? (
        <>
          {Array(5)
            .fill('')
            .map((_, idx) => (
              <Skeleton height={140} key={`appeal-skeleton-${idx}`} />
            ))}
        </>
      ) : data?.regularAppeals.nodes.length ? (
        data.regularAppeals.nodes.map((appeal) => (
          <Box key={appeal.id} mb={3}>
            <Appeal appeal={appeal} changePrimary={handleChangePrimary} />
          </Box>
        ))
      ) : (
        <NoAppeals />
      )}
      {data && (
        <Box display="flex" justifyContent="center">
          <Typography data-testid="TypographyShowing">
            <Trans
              defaults="Showing <bold>{{value}}</bold> of <bold>{{total}}</bold>"
              shouldUnescape
              values={{
                value:
                  data.primaryAppeal.nodes.length +
                  data.regularAppeals.nodes.length,
                total:
                  data.primaryAppeal.totalCount +
                  data.regularAppeals.totalCount,
              }}
              components={{ bold: <strong /> }}
            />
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Appeals;

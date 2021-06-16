import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@material-ui/core';
import { ExpectedMonthlyTotalReportHeader } from './Header/ExpectedMonthlyTotalReportHeader';
import { ExpectedMonthlyTotalReportTable } from './Table/ExpectedMonthlyTotalReportTable';
import { ExpectedMonthlyTotalReportEmpty } from './Empty/ExpectedMonthlyTotalReportEmpty';

interface Props {
  accountListId: string;
  data: [];
}

export const ExpectedMonthlyTotalReport: React.FC<Props> = ({
  accountListId,
  data,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {data.length > 0 ? (
        <Box>
          <ExpectedMonthlyTotalReportHeader
            accountListId={accountListId}
            empty={false}
          />
          <ExpectedMonthlyTotalReportTable
            accountListId={accountListId}
            title={t('Donations So Far This Month')}
            data={data}
            donations={true}
          />
          <ExpectedMonthlyTotalReportTable
            accountListId={accountListId}
            title={t('Likely Partners This Month')}
            data={data}
            donations={false}
          />
          <ExpectedMonthlyTotalReportTable
            accountListId={accountListId}
            title={t('Possible Partners This Month')}
            data={data}
            donations={false}
          />
        </Box>
      ) : (
        <Box>
          <ExpectedMonthlyTotalReportHeader
            accountListId={accountListId}
            empty={true}
          />
          <ExpectedMonthlyTotalReportEmpty accountListId={accountListId} />
        </Box>
      )}
    </>
  );
};

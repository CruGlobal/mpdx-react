/* eslint-disable eqeqeq */
import { Box, styled, Typography } from '@material-ui/core';
import { DateTime } from 'luxon';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import theme from '../../../../../theme';
import { DonationsContactFragment } from '../ContactDonationsTab.generated';

const LegendText = styled(Typography)(({ theme }) => ({
  margin: theme.spacing(3, 0),
  writingMode: 'vertical-rl',
  textOrientation: 'mixed',
}));

const GraphContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  margin: theme.spacing(0, 2, 0, 0),
}));

const NoDonationsBox = styled(Box)(({ theme }) => ({
  margin: theme.spacing(4),
}));
interface DonationsGraphProps {
  donations: DonationsContactFragment | null;
  convertedCurrency: string;
}

export const DonationsGraph: React.FC<DonationsGraphProps> = ({
  donations,
  convertedCurrency,
}) => {
  const { t } = useTranslation();
  const donationsForThisYear = donations?.nodes.filter((donation) => {
    return (
      DateTime.fromISO(donation.donationDate).toJSDate() >
      DateTime.local().minus({ year: 1 }).toJSDate()
    );
  });

  const donationsForLastYear = donations?.nodes.filter((donation) => {
    return (
      DateTime.fromISO(donation.donationDate) <
        DateTime.local().minus({ year: 1 }) ||
      DateTime.fromISO(donation.donationDate) >
        DateTime.local().minus({ year: 2 })
    );
  });

  const contactDonationsMap = [...Array(12)].map((x, i) => {
    const mapDate = DateTime.now().plus({ month: i });
    let thisYearCurrencyConvertedTotal = 0;
    let lastYearCurrencyConvertedTotal = 0;
    donationsForThisYear?.forEach((thisDonation) => {
      if (DateTime.fromISO(thisDonation.donationDate).month === mapDate.month) {
        thisYearCurrencyConvertedTotal += thisDonation.amount.convertedAmount;
      }
    });
    donationsForLastYear?.forEach((lastDonation) => {
      if (DateTime.fromISO(lastDonation.donationDate).month === mapDate.month) {
        lastYearCurrencyConvertedTotal += lastDonation.amount.convertedAmount;
      }
    });

    return {
      month: mapDate.monthShort,
      lastYear: lastYearCurrencyConvertedTotal,
      thisYear: thisYearCurrencyConvertedTotal,
    };
  });

  return (
    <GraphContainer>
      {donations == null || donations.nodes.length < 1 ? (
        <NoDonationsBox role="alert">
          <Typography variant="subtitle2" role="status">
            {t('No Donations Data')}
          </Typography>
        </NoDonationsBox>
      ) : (
        <>
          <LegendText variant="body1" role="banner">{`${t(
            'Curreny',
          )} (${convertedCurrency})`}</LegendText>
          <BarChart width={600} height={300} data={contactDonationsMap}>
            <CartesianGrid strokeDasharray="3 3" display={'Test'} />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="thisYear" fill={theme.palette.secondary.main} />
            <Bar dataKey="lastYear" fill={theme.palette.secondary.dark} />
          </BarChart>
        </>
      )}
    </GraphContainer>
  );
};

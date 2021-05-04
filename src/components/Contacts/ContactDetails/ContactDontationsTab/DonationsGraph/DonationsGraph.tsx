import { Box } from '@material-ui/core';
import { DateTime } from 'luxon';
import React from 'react';
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

interface DonationsGraphProps {
  donations: DonationsContactFragment;
}

export const DonationsGraph: React.FC<DonationsGraphProps> = ({
  donations,
}) => {
  const { nodes } = donations;
  const donationsForThisYear = nodes.filter((donation) => {
    return (
      DateTime.fromISO(donation.donationDate).toJSDate() >
      DateTime.local().minus({ year: 1 }).toJSDate()
    );
  });

  const donationsForLastYear = nodes.filter((donation) => {
    return (
      DateTime.fromISO(donation.donationDate).toJSDate() <
        DateTime.local().minus({ year: 1 }).toJSDate() ||
      DateTime.fromISO(donation.donationDate).toJSDate() >
        DateTime.local().minus({ year: 2 }).toJSDate()
    );
  });

  const contactDonationsMap = [...Array(12)].map((x, i) => {
    const mapDate = DateTime.now().minus({ month: i });
    let thisYearCurrencyConvertedTotal = 0;
    let lastYearCurrencyConvertedTotal = 0;
    donationsForThisYear.forEach((thisDonation) => {
      if (DateTime.fromISO(thisDonation.donationDate).month === mapDate.month) {
        thisYearCurrencyConvertedTotal += thisDonation.amount.convertedAmount;
      }
    });
    donationsForLastYear.forEach((lastDonation) => {
      if (DateTime.fromISO(lastDonation.donationDate).month === mapDate.month) {
        lastYearCurrencyConvertedTotal += lastDonation.amount.convertedAmount;
      }
    });

    const data: { month: string; lastYear: number; thisYear: number } = {
      month: mapDate.monthShort,
      lastYear: lastYearCurrencyConvertedTotal,
      thisYear: thisYearCurrencyConvertedTotal,
    };
    return data;
  });

  return (
    <Box>
      <BarChart width={600} height={300} data={contactDonationsMap}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="thisYear" fill={theme.palette.secondary.main} />
        <Bar dataKey="lastYear" fill={theme.palette.secondary.dark} />
      </BarChart>
    </Box>
  );
};

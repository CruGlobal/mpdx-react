import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@material-ui/core';

interface AnniversaryProps {
  marital_status: string;
  anniversary_day: string;
  anniversary_month: string;
}

export const PersPrefAnniversary: React.FC<AnniversaryProps> = ({
  marital_status,
  anniversary_day,
  anniversary_month,
}) => {
  const { t } = useTranslation();
  const anniversary = anniversary_month || anniversary_day ? true : false;

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  let output = '';

  if (marital_status) {
    output += marital_status;
  } else if (anniversary) {
    output += 'Anniversary';
  }

  if (anniversary) {
    output += ': ';
    if (anniversary_month) {
      output += `${t(months[parseInt(anniversary_month) - 1])} `;
    }
    if (anniversary_day) {
      output += anniversary_day;
    }
  }

  if (output !== '') {
    return <Typography gutterBottom>{output}</Typography>;
  }

  return null;
};

import { styled } from '@mui/material';

const RightAdornment = styled('span')(({ theme }) => ({
  paddingRight: theme.spacing(1),
}));

const LeftAdornment = styled('span')(({ theme }) => ({
  paddingLeft: theme.spacing(1),
}));

export const CurrencyAdornment: React.FC = () => (
  <RightAdornment>$</RightAdornment>
);

export const PercentageAdornment: React.FC = () => (
  <LeftAdornment>%</LeftAdornment>
);

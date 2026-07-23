import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  SxProps,
  Theme,
} from '@mui/material';
import { useMPGAIncomeExpenses } from '../MPGAIncomeExpensesContext/MPGAIncomeExpensesContext';

export interface CardSkeletonProps {
  title: string;
  children?: React.ReactNode;
  styling?: SxProps<Theme>;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  title,
  children,
  styling,
}) => {
  const { subtitle } = useMPGAIncomeExpenses();

  return (
    <Card>
      <CardHeader title={title} subheader={subtitle} />
      <Divider />
      <CardContent sx={{ ...styling }}>{children}</CardContent>
    </Card>
  );
};

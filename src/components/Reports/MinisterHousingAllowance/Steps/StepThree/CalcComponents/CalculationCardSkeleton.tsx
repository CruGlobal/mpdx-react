import {
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

interface CalculationCardSkeletonProps {
  title: string;
  children?: React.ReactNode;
}

export const CalculationCardSkeleton: React.FC<
  CalculationCardSkeletonProps
> = ({ title, children }) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>
        <Table
          sx={{
            '& .MuiTableRow-root:last-child td': {
              border: 0,
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{ color: 'primary.main', fontSize: 16, width: '70%' }}
              >
                {t('Category')}
              </TableCell>
              <TableCell
                sx={{ color: 'primary.main', fontSize: 16, width: '30%' }}
              >
                {t('Amount')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{children}</TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

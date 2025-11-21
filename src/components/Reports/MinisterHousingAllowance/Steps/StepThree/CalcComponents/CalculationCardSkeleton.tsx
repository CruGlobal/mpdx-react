import {
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  SimplePrintOnly,
  SimpleScreenOnly,
} from 'src/components/Reports/styledComponents';

interface CalculationCardSkeletonProps {
  title: string;
  children?: React.ReactNode;
}

export const CalculationCardSkeleton: React.FC<
  CalculationCardSkeletonProps
> = ({ title, children }) => {
  const { t } = useTranslation();

  return (
    <Card
      sx={{
        '@media print': {
          maxWidth: '100%',
          boxSizing: 'border-box',
          boxShadow: 'none',
        },
      }}
    >
      <SimpleScreenOnly>
        <CardHeader title={title} />
      </SimpleScreenOnly>
      <SimplePrintOnly>
        <Typography variant="h6" sx={{ mb: -3 }}>
          {title}
        </Typography>
      </SimplePrintOnly>
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

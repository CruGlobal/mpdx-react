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

interface FormCardSkeletonProps {
  title: string;
  colTwoHeader?: string;
  colThreeHeader?: string;
  hideHeaders?: boolean;
  children?: React.ReactNode;
}

export const FormCardSkeleton: React.FC<FormCardSkeletonProps> = ({
  title,
  colTwoHeader,
  colThreeHeader,
  hideHeaders,
  children,
}) => {
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
          {!hideHeaders && (
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    color: 'primary.main',
                    fontSize: 16,
                    width: colThreeHeader ? '40%' : '70%',
                  }}
                >
                  {t('Category')}
                </TableCell>
                <TableCell
                  sx={{ color: 'primary.main', fontSize: 16, width: '30%' }}
                >
                  {colTwoHeader ? colTwoHeader : t('Amount')}
                </TableCell>
                {colThreeHeader && (
                  <TableCell
                    sx={{ color: 'primary.main', fontSize: 16, width: '30%' }}
                  >
                    {colThreeHeader ? colThreeHeader : ''}
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
          )}
          <TableBody>{children}</TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

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

interface FormCardProps {
  title: string;
  customTextAbove?: string;
  colTwoHeader?: string;
  colThreeHeader?: string;
  customTextBelow?: string;
  hideHeaders?: boolean;
  children?: React.ReactNode;
}

export const FormCard: React.FC<FormCardProps> = ({
  title,
  customTextAbove,
  colTwoHeader,
  colThreeHeader,
  customTextBelow,
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
        {customTextAbove && (
          <Typography sx={{ mb: 2 }}>{customTextAbove}</Typography>
        )}
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
                    {colThreeHeader}
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
          )}
          <TableBody>{children}</TableBody>
        </Table>
        {customTextBelow && (
          <Typography sx={{ mt: 2 }}>{customTextBelow}</Typography>
        )}
      </CardContent>
    </Card>
  );
};

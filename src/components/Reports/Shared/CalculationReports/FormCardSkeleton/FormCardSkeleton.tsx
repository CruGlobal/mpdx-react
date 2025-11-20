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

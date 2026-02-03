import React from 'react';
import {
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { StepCard } from './StepCard';

export const ContactInformationSummaryCard: React.FC = () => {
  const { t } = useTranslation();
  const { requestData } = useAdditionalSalaryRequest();
  const { phoneNumber, emailAddress: email } =
    requestData?.additionalSalaryRequest ?? {};

  return (
    <StepCard>
      <CardHeader title={t('Contact Information')} />
      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell sx={{ width: '50%' }}>
                <Typography variant="body1">{t('Phone Number')}</Typography>
              </TableCell>
              <TableCell sx={{ width: '50%' }}>
                <Typography variant="body1">{phoneNumber}</Typography>
              </TableCell>
            </TableRow>
            <TableRow sx={{ '& td': { borderBottom: 'none' } }}>
              <TableCell sx={{ width: '50%' }}>
                <Typography variant="body1">{t('Email')}</Typography>
              </TableCell>
              <TableCell sx={{ width: '50%' }}>
                <Typography variant="body1">{email}</Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </StepCard>
  );
};

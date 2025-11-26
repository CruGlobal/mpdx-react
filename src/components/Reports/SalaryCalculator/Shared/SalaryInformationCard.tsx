import Link from 'next/link';
import React from 'react';
import { WorkspacePremiumSharp } from '@mui/icons-material';
import {
  Avatar,
  Box,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  styled,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useLandingData } from '../Landing/useLandingData';
import { StepCard } from './StepCard';

const FlexBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const LinkTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  textDecoration: 'underline',
  cursor: 'pointer',
}));

export const SalaryInformationCard: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { self, spouse, hasSpouse, salaryCategories } = useLandingData();

  return (
    <StepCard sx={(theme) => ({ my: theme.spacing(3) })}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'success.main' }}>
            <WorkspacePremiumSharp sx={{ fontSize: 32, color: 'white' }} />
          </Avatar>
        }
        title={
          <Box>
            <Typography variant="h6">
              {t('Current Salary Information')}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {t('Last updated: ')}
            </Typography>
          </Box>
        }
      />
      <CardContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('Category')}</TableCell>
              <TableCell>{self?.staffInfo.firstName}</TableCell>
              {hasSpouse && (
                <TableCell>{spouse?.staffInfo.firstName}</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {salaryCategories.map((row) => (
              <TableRow key={row.category}>
                <TableCell>{row.category}</TableCell>
                <TableCell>
                  {row.category === t('Current MHA') ? (
                    <FlexBox>
                      {row.user ?? ''}
                      <Link
                        href={`/accountLists/${accountListId}/reports/housingAllowance`}
                        passHref
                      >
                        <LinkTypography>{t('View')}</LinkTypography>
                      </Link>
                    </FlexBox>
                  ) : (
                    row.user ?? ''
                  )}
                </TableCell>
                {hasSpouse && <TableCell>{row.spouse ?? ''}</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </StepCard>
  );
};

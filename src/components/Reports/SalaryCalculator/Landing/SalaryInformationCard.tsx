import Link from 'next/link';
import React from 'react';
import { WorkspacePremiumSharp } from '@mui/icons-material';
import {
  Avatar,
  Box,
  CardContent,
  CardHeader,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { StepCard } from '../Shared/StepCard';
import { useLandingData } from './useLandingData';

export const SalaryInformationCard: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { self, spouse, hasSpouse, salaryCategories } = useLandingData();

  return (
    <StepCard sx={{ my: 3 }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'success.main' }}>
            <WorkspacePremiumSharp sx={{ fontSize: 32, color: 'white' }} />
          </Avatar>
        }
        title={
          <Grid container direction="column" spacing={0}>
            <Grid item>
              <Typography variant="h6">
                {t('Current Salary Information')}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="body2" color="textSecondary">
                {t('Last updated: ')}
              </Typography>
            </Grid>
          </Grid>
        }
      />
      <CardContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell scope="col">{t('Category')}</TableCell>
              <TableCell scope="col">{self?.staffInfo.firstName}</TableCell>
              {hasSpouse && (
                <TableCell scope="col">{spouse?.staffInfo.firstName}</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {salaryCategories.map((row) => (
              <TableRow key={row.category}>
                <TableCell component="th" scope="row">
                  {row.category}
                </TableCell>
                <TableCell>
                  {row.category === t('Current MHA') ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {row.user ?? ''}
                      <Link
                        href={`/accountLists/${accountListId}/reports/housingAllowance`}
                        passHref
                        legacyBehavior
                      >
                        <Typography
                          component="a"
                          sx={{
                            color: 'primary.main',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                          }}
                        >
                          {t('View')}
                        </Typography>
                      </Link>
                    </Box>
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

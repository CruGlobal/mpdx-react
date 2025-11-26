import Link from 'next/link';
import React from 'react';
import { WorkspacePremiumSharp } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useLandingData } from './useLandingData';

const StyledCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

export const SalaryInformationCard: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { self, spouse, hasSpouse, salaryCategories } = useLandingData();

  return (
    <StyledCard>
      <CardHeader
        avatar={
          <WorkspacePremiumSharp color="success" sx={{ fontSize: 48 }} />
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
      <CardContent sx={{ p: 0 }}>
        <TableContainer sx={(theme) => ({ px: theme.spacing(3) })}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={(theme) => ({ paddingLeft: theme.spacing(3) })}>
                  <Typography color="primary" fontWeight="bold">
                    {t('Category')}
                  </Typography>
                </TableCell>
                <TableCell
                  align="left"
                  sx={(theme) => ({ paddingLeft: theme.spacing(3) })}
                >
                  <Typography color="primary" fontWeight="bold">
                    {self?.staffInfo.firstName}
                  </Typography>
                </TableCell>
                {hasSpouse && (
                  <TableCell
                    align="left"
                    sx={(theme) => ({ paddingLeft: theme.spacing(3) })}
                  >
                    <Typography color="primary" fontWeight="bold">
                      {spouse?.staffInfo.firstName}
                    </Typography>
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {salaryCategories.map((row, index) => (
                <TableRow key={row.category}>
                  <TableCell
                    component="th"
                    scope="row"
                    sx={(theme) => ({
                      paddingLeft: theme.spacing(3),
                      ...(index === salaryCategories.length - 1 && {
                        borderBottom: 'none',
                      }),
                    })}
                  >
                    <Typography>{row.category}</Typography>
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={(theme) => ({
                      paddingLeft: theme.spacing(3),
                      ...(index === salaryCategories.length - 1 && {
                        borderBottom: 'none',
                      }),
                    })}
                  >
                    {row.category === t('Current MHA') ? (
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Typography>{row.user ?? ''}</Typography>
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
                      <Typography>{row.user ?? ''}</Typography>
                    )}
                  </TableCell>
                  {hasSpouse && (
                    <TableCell
                      align="left"
                      sx={(theme) => ({
                        paddingLeft: theme.spacing(3),
                        ...(index === salaryCategories.length - 1 && {
                          borderBottom: 'none',
                        }),
                      })}
                    >
                      <Typography>{row.spouse ?? ''}</Typography>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </StyledCard>
  );
};

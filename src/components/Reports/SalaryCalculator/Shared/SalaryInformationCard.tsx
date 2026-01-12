import NextLink from 'next/link';
import React from 'react';
import { Info, WorkspacePremiumSharp } from '@mui/icons-material';
import {
  Avatar,
  Box,
  CardContent,
  CardHeader,
  IconButton,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  styled,
  useTheme,
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

export const SalaryInformationCard: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const accountListId = useAccountListId();
  const {
    self,
    spouse,
    hasSpouse,
    salaryCategories,
    salaryData: { lastUpdated },
  } = useLandingData();

  return (
    <StepCard sx={{ marginBlock: theme.spacing(3) }}>
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
            <Typography
              variant="body2"
              color="textSecondary"
              data-testid="last-updated"
            >
              {t('Last updated:')} {lastUpdated}
            </Typography>
          </Box>
        }
      />
      <CardContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('Category')}</TableCell>
              <TableCell>{self?.staffInfo.preferredName}</TableCell>
              {hasSpouse && (
                <TableCell>{spouse?.staffInfo.preferredName}</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody
            sx={{
              'tr:last-child td': {
                borderBottom: 'none',
              },
            }}
          >
            {salaryCategories.map((row) => (
              <TableRow key={row.category}>
                <TableCell>
                  <FlexBox>
                    {row.category}
                    {row.tooltip && (
                      <Tooltip placement="top" title={row.tooltip} arrow>
                        <IconButton sx={{ padding: 0.5 }}>
                          <Info fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </FlexBox>
                </TableCell>
                <TableCell>
                  <FlexBox>
                    {row.user}
                    {row.link && (
                      <Link
                        component={NextLink}
                        href={`/accountLists/${accountListId}${row.link}`}
                      >
                        {t('View')}
                      </Link>
                    )}
                  </FlexBox>
                </TableCell>
                {hasSpouse && <TableCell>{row.spouse}</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </StepCard>
  );
};

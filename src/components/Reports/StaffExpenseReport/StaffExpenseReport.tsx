import React from 'react';
import {
  Box,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import {
  BreakdownByMonth,
  SubCategory,
  TransactionCategory,
} from '../../../graphql/types.generated';
import { useStaffExpenseReportQuery } from './StaffExpenseReport.generated';

interface StaffExpenseReportProps {
  isNavListOpen: boolean;
  onNavListToggle: () => void;
}

const BreakdownTable = ({ breakdown }: { breakdown: BreakdownByMonth[] }) => (
  <Table size="small" sx={{ mt: 1 }}>
    <TableHead>
      <TableRow>
        <TableCell>
          <strong>Month</strong>
        </TableCell>
        <TableCell>
          <strong>Total</strong>
        </TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {breakdown.map((b, i) => (
        <TableRow key={i}>
          <TableCell>{b.month}</TableCell>
          <TableCell>{b.total}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const SubcategoriesTable = ({
  subcategories,
}: {
  subcategories: SubCategory[];
}) => (
  <Box sx={{ pl: 2 }}>
    {subcategories.map((sub, index) => (
      <Box key={index} sx={{ mb: 2 }}>
        <Typography variant="subtitle2">
          Subcategory: {sub.subCategory} (Total: {sub.total})
        </Typography>
        <BreakdownTable breakdown={sub.breakdownByMonth ?? []} />
      </Box>
    ))}
  </Box>
);

const CategoriesTable = ({
  categories,
}: {
  categories: TransactionCategory[];
}) => (
  <Box sx={{ pl: 2 }}>
    {categories.map((cat, index) => (
      <Box key={index} sx={{ mb: 3 }}>
        <Typography variant="subtitle1">
          Category: {cat.category} (Total: {cat.total})
        </Typography>
        <BreakdownTable breakdown={cat.breakdownByMonth ?? []} />
        {cat.subcategories?.length && (
          <SubcategoriesTable subcategories={cat.subcategories} />
        )}
      </Box>
    ))}
  </Box>
);

export const StaffExpenseReport: React.FC<StaffExpenseReportProps> = ({
  isNavListOpen,
  onNavListToggle,
}) => {
  const { data, error } = useStaffExpenseReportQuery({
    variables: {
      accountId: '1000000001',
      fundTypes: [],
    },
  });

  return (
    <Box>
      <MultiPageHeader
        isNavListOpen={isNavListOpen}
        onNavListToggle={onNavListToggle}
        title={'Staff Expense Report'}
        headerType={HeaderTypeEnum.Report}
      />
      <Container>
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
          }}
        >
          <Typography
            sx={{ flex: '1 1 100%' }}
            variant="h6"
            id="tableTitle"
            component="div"
          >
            {data?.reportsStaffExpenses?.name || 'Loading name'}
          </Typography>
        </Toolbar>
        <TableContainer component={Paper}>
          <Table aria-label="fund table">
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Fund Type</strong>
                </TableCell>
                <TableCell>
                  <strong>Total</strong>
                </TableCell>
                <TableCell>
                  <strong>Details</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!data && !error ? (
                <TableContainer component={Paper}>
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                </TableContainer>
              ) : (
                data?.reportsStaffExpenses?.funds?.map((fund, index) => (
                  <TableRow key={index}>
                    <TableCell>{fund.fundType}</TableCell>
                    <TableCell>{fund.total}</TableCell>
                    <TableCell>
                      {fund.categories?.length ? (
                        <CategoriesTable categories={fund.categories} />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No categories
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
};

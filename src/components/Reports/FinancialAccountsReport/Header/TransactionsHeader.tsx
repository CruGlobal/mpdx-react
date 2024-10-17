import React, { useContext } from 'react';
import { FilterList } from '@mui/icons-material';
import { Box, Button, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { FilterButton } from 'src/components/Shared/Header/styledComponents';
import { SearchBox } from 'src/components/common/SearchBox/SearchBox';
import {
  FinancialAccountContext,
  FinancialAccountType,
} from '../Context/FinancialAccountsContext';
import { HeaderTopDetails } from './HeaderTopDetails';
import { StickyHeader } from './styledComponents';

const HeaderFilterAction = styled(Box)(() => ({
  width: '50px',
}));
const FilterIcon = styled(FilterList)(({ theme }) => ({
  width: 24,
  height: 24,
  color: theme.palette.primary.dark,
}));
const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingTop: theme.spacing(2),
}));
const HeaderActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: theme.spacing(2),
  width: 'calc(100% - 150px)',
}));

interface FinancialAccountHeaderProps {
  disableExportCSV: boolean;
  handleExportCSV: () => void;
}
export const FinancialAccountHeader: React.FC<FinancialAccountHeaderProps> = ({
  disableExportCSV = false,
  handleExportCSV,
}) => {
  const { t } = useTranslation();

  const {
    accountListId,
    financialAccountId,
    handleNavListToggle,
    hasActiveFilters,
    handleFilterListToggle,
    searchTerm,
    setSearchTerm,
  } = useContext(FinancialAccountContext) as FinancialAccountType;

  const handleSearchTermChange = (search: string) => {
    setSearchTerm(search);
  };

  return (
    <StickyHeader p={2} data-testid="FinancialAccountHeader" onTransactionPage>
      <HeaderTopDetails
        accountListId={accountListId}
        financialAccountId={financialAccountId ?? ''}
        handleNavListToggle={handleNavListToggle}
      />
      <Divider />
      <Header>
        <HeaderFilterAction>
          <FilterButton
            activeFilters={hasActiveFilters}
            onClick={handleFilterListToggle}
          >
            <FilterIcon titleAccess={t('Toggle Filter Panel')} />
          </FilterButton>
        </HeaderFilterAction>
        <HeaderActions>
          {handleExportCSV && (
            <Button
              size="large"
              variant="contained"
              onClick={handleExportCSV}
              disabled={disableExportCSV}
              sx={{
                paddingBottom: '11px',
                paddingTop: '11px',
              }}
            >
              {t('Export CSV')}
            </Button>
          )}

          <SearchBox
            showContactSearchIcon={false}
            searchTerm={searchTerm}
            onChange={handleSearchTermChange}
            placeholder={t(
              'Search by description, code, category name, category code',
            )}
            toolTipText={t(
              'Search by description, code, category name, category code',
            )}
          />
        </HeaderActions>
      </Header>
    </StickyHeader>
  );
};

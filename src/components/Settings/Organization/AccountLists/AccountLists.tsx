import { useState, useContext, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { mdiHome } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import {
  OrganizationsContext,
  OrganizationsContextType,
} from 'pages/accountLists/[accountListId]/settings/organizations/organizationsContext';
import { InfiniteList } from 'src/components/InfiniteList/InfiniteList';
import { NullStateBox } from 'src/components/Shared/Filters/NullState/NullStateBox';
import { useSearchOrganizationsAccountListsQuery } from './accountLists.generated';
import { AccountListRow } from './AccountListRow/AccountListRow';

const LoadingSpinner: React.FC<{ firstLoad: boolean }> = ({ firstLoad }) => (
  <CircularProgress
    color="primary"
    size={35}
    sx={{
      marginRight: 3,
      position: 'absolute',
      top: firstLoad ? '50%' : 'inherit',
      bottom: firstLoad ? 'inherit' : '300px',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: '300',
    }}
  />
);

export const AccountLists: React.FC = () => {
  const { t } = useTranslation();
  const accountListsRef = useRef(null);
  const [infiniteListHeight, setInfiniteListHeight] = useState<number | null>(
    null,
  );
  const { selectedOrganizationId, search, clearFilters } = useContext(
    OrganizationsContext,
  ) as OrganizationsContextType;

  const { data, loading, fetchMore } = useSearchOrganizationsAccountListsQuery({
    variables: {
      input: {
        organizationId: selectedOrganizationId,
        search: search,
      },
    },
    skip: !!!selectedOrganizationId,
  });

  const accountLists = data?.searchOrganizationsAccountLists.accountLists;
  const pagination = data?.searchOrganizationsAccountLists.pagination;

  useEffect(() => {
    if (!accountListsRef.current) return;
    if (!window.visualViewport?.height) return;
    // 24px for the padding which he parent page has added.
    setInfiniteListHeight(
      window.visualViewport.height -
        (accountListsRef.current as HTMLElement).getBoundingClientRect().top -
        24,
    );
  }, [accountListsRef]);

  return (
    <Box
      style={{ position: 'relative', marginTop: '20px', overflowX: 'auto' }}
      ref={accountListsRef}
    >
      {loading && <LoadingSpinner firstLoad={!pagination?.page} />}
      <InfiniteList
        loading={loading}
        data={accountLists ?? []}
        style={{
          height: infiniteListHeight
            ? infiniteListHeight
            : `calc(100vh - 300px)`,
          minWidth: '920px',
        }}
        itemContent={(index, accountList) => {
          return accountList ? (
            <AccountListRow
              key={`accountList-${index}-${accountList.id}`}
              accountList={accountList}
            />
          ) : null;
        }}
        endReached={() =>
          pagination &&
          pagination?.page < pagination?.totalPages &&
          fetchMore({
            variables: {
              input: {
                organizationId: selectedOrganizationId,
                search: search,
                pageNumber: pagination.page + 1,
              },
            },
          })
        }
        EmptyPlaceholder={
          <Box width="75%" margin="auto" mt={2}>
            <NullStateBox>
              <Icon path={mdiHome} size={1.5} />

              {pagination && pagination?.totalCount === 0 && search === '' && (
                <Typography variant="h5">
                  {t('Looks like you have no account lists to manage yet')}
                </Typography>
              )}
              <Typography variant="h5">
                {t('No account lists match your filters.')}
              </Typography>

              <Button onClick={clearFilters} variant="contained">
                {t('Reset All Search Filters')}
              </Button>
            </NullStateBox>
          </Box>
        }
      />
    </Box>
  );
};

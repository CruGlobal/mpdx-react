import { useContext, useEffect, useRef, useState } from 'react';
import { mdiHome } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  OrganizationsContext,
  OrganizationsContextType,
} from 'pages/accountLists/[accountListId]/settings/organizations/OrganizationsContext';
import { InfiniteList } from 'src/components/InfiniteList/InfiniteList';
import { NullStateBox } from 'src/components/Shared/Filters/NullState/NullStateBox';
import { LoadingSpinner } from '../LoadingSpinner';
import { AccountListRow } from './AccountListRow/AccountListRow';
import { useSearchOrganizationsAccountListsQuery } from './AccountLists.generated';

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
    skip: !selectedOrganizationId,
  });

  const accountLists = data?.searchOrganizationsAccountLists.accountLists;
  const pagination = data?.searchOrganizationsAccountLists.pagination;

  useEffect(() => {
    if (!accountListsRef.current) return;
    if (!window.visualViewport?.height) return;
    // 24px for the padding which the parent page has added.
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
      {loading && (
        <LoadingSpinner
          firstLoad={!pagination?.page}
          data-testid="LoadingSpinner"
        />
      )}
      {!selectedOrganizationId && (
        <Box width="100%" margin="auto" mt={2}>
          <NullStateBox>
            <Icon path={mdiHome} size={1.5} />
            <Typography variant="h5">
              {t('Start by adding search filters')}
            </Typography>
            <Typography>
              {t('Choose an organization that you administrate.')}
            </Typography>
          </NullStateBox>
        </Box>
      )}
      {selectedOrganizationId && (
        <InfiniteList
          loading={loading}
          data={accountLists ?? []}
          disableHover
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
                search={search}
                organizationId={selectedOrganizationId}
              />
            ) : null;
          }}
          endReached={() =>
            pagination &&
            pagination.page < pagination.totalPages &&
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
            <Box width="100%" margin="auto" mt={2}>
              <NullStateBox>
                <Icon path={mdiHome} size={1.5} />

                {pagination &&
                  pagination?.totalCount === 0 &&
                  search === '' && (
                    <Typography variant="h5">
                      {t('Looks like you have no account lists to manage yet')}
                    </Typography>
                  )}
                <Typography variant="h5">
                  {t('No account lists match your search filters.')}
                </Typography>

                <Button
                  sx={{ marginY: 2 }}
                  onClick={clearFilters}
                  variant="contained"
                >
                  {t('Reset Search')}
                </Button>
              </NullStateBox>
            </Box>
          }
        />
      )}
    </Box>
  );
};

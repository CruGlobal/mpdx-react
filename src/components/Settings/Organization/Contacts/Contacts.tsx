import { useContext, useEffect, useRef, useState } from 'react';
import { Search } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  OrganizationsContext,
  OrganizationsContextType,
} from 'pages/accountLists/[accountListId]/settings/organizations/OrganizationsContext';
import { InfiniteList } from 'src/components/InfiniteList/InfiniteList';
import { NullStateBox } from 'src/components/Shared/Filters/NullState/NullStateBox';
import { LoadingSpinner } from '../LoadingSpinner';
import { useSearchOrganizationsContactsQuery } from './Contact.generated';
import { ContactRow } from './ContactRow/ContactRow';

export const Contacts: React.FC = () => {
  const { t } = useTranslation();
  const contactsRef = useRef(null);
  const [infiniteListHeight, setInfiniteListHeight] = useState<number | null>(
    null,
  );
  const {
    selectedOrganizationId,
    search,
    clearFilters,
    selectedOrganizationName,
  } = useContext(OrganizationsContext) as OrganizationsContextType;

  const { data, loading, fetchMore } = useSearchOrganizationsContactsQuery({
    variables: {
      input: {
        organizationId: selectedOrganizationId,
        search: search,
      },
    },
    skip: !(selectedOrganizationId && search),
  });

  const contacts = data?.searchOrganizationsContacts.contacts;
  const pagination = data?.searchOrganizationsContacts.pagination;

  useEffect(() => {
    if (!contactsRef.current) return;
    if (!window.visualViewport?.height) return;
    // 24px for the padding which the parent page has added.
    setInfiniteListHeight(
      window.visualViewport.height -
        (contactsRef.current as HTMLElement).getBoundingClientRect().top -
        24,
    );
  }, [contactsRef]);

  return (
    <Box style={{ position: 'relative', overflowX: 'auto' }} ref={contactsRef}>
      {loading && <LoadingSpinner firstLoad={!pagination?.page} />}
      {!loading && !(search && selectedOrganizationId) && (
        <Box width="100%" margin="auto" mt={2}>
          <NullStateBox>
            <Search fontSize="large" />
            <Typography variant="h5">
              {t('Start by adding search filters')}
            </Typography>
            <Typography>
              {t(
                'First, filter by at least one organization that you administrate.',
              )}
            </Typography>
            <Typography>
              {t(
                "You'll also need to search by contact name, email address, phone number, or partner number.",
              )}
            </Typography>
          </NullStateBox>
        </Box>
      )}
      {search && selectedOrganizationId && (
        <InfiniteList
          loading={loading}
          data={contacts ?? []}
          style={{
            height: infiniteListHeight
              ? infiniteListHeight
              : `calc(100vh - 300px)`,
            minWidth: '950px',
          }}
          disableHover
          itemContent={(index, contact) => {
            return contact ? (
              <ContactRow
                key={`contact-${contact?.id}`}
                contact={contact}
                selectedOrganizationName={selectedOrganizationName}
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
                <Search fontSize="large" />
                <Typography variant="h5">
                  {t('No contacts match your search filters')}
                </Typography>
                <Typography>
                  {t('Try searching for a different keyword or organization.')}
                </Typography>
                <Button
                  sx={{ marginY: 2 }}
                  onClick={clearFilters}
                  variant="contained"
                >
                  {t('Reset All Search Filters')}
                </Button>
              </NullStateBox>
            </Box>
          }
        />
      )}
    </Box>
  );
};

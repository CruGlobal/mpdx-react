import { useContext, useEffect, useRef, useState } from 'react';
import { mdiHome } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Typography } from '@mui/material';
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
  const { selectedOrganizationId, search } = useContext(
    OrganizationsContext,
  ) as OrganizationsContextType;

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
    if (!contactsRef.current || !window.visualViewport?.height) {
      return;
    }
    if (!window.visualViewport?.height) {
      return;
    }
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
      <InfiniteList
        loading={loading}
        data={contacts ?? []}
        style={{
          height: infiniteListHeight
            ? infiniteListHeight
            : `calc(100vh - 300px)`,
          minWidth: '950px',
        }}
        itemContent={(index, contact) => {
          return contact ? (
            <ContactRow
              key={`contact-${contact?.id}`}
              contact={contact}
              useTopMargin={index === 0}
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
          <Box width="75%" margin="auto" mt={2}>
            <NullStateBox>
              <Icon path={mdiHome} size={1.5} />
              <Typography variant="h5">
                {t(
                  'Unfortunately none of the contacts match your current search or filters.',
                )}
              </Typography>
              <Typography>
                {t('Try searching for a different keyword or organization.')}
              </Typography>
            </NullStateBox>
          </Box>
        }
      />
    </Box>
  );
};

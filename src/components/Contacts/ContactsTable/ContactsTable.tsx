import React from 'react';
import {
  Box,
  Table,
  colors,
  TableHead,
  TableBody,
  TableContainer,
} from '@material-ui/core';
import { ContactRow } from '../ContactRow';
import { ContactsHeader } from '../ContactsHeader/ContactsHeader';
import { useContactsQuery } from '../../../../pages/accountLists/[accountListId]/Contacts.generated';

interface Props {
  accountListId: string;
  onContactSelected: (contactId: string) => void;
}

export const ContactsTable: React.FC<Props> = ({
  accountListId,
  onContactSelected,
}: Props) => {
  const { data, loading, error } = useContactsQuery({
    variables: { accountListId },
  });

  const renderLoading = () => (
    <Box
      height="100%"
      alignItems="center"
      justifyContent="center"
      bgcolor={colors.green[600]}
    >
      Loading
    </Box>
  );

  const renderEmpty = () => (
    <Box height="100%" bgcolor={colors.yellow[600]}>
      No Data
    </Box>
  );

  const renderError = () => (
    <Box bgcolor={colors.red[600]}>Error: {error?.toString()}</Box>
  );

  return (
    <TableContainer>
      <Table stickyHeader aria-label="sticky table">
        <TableHead>
          <ContactsHeader />
        </TableHead>
        <TableBody>
          {error && renderError()}
          {loading ? (
            renderLoading()
          ) : !(data && data.contacts.nodes.length > 0) ? (
            renderEmpty()
          ) : (
            <div data-testID="ContactRows">
              {data.contacts.nodes?.map((contact) => (
                <ContactRow
                  key={contact.id}
                  contact={contact}
                  onContactSelected={onContactSelected}
                />
              ))}
            </div>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

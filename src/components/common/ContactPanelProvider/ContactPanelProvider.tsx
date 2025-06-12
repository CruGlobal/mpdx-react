import { useRouter } from 'next/router';
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { omit } from 'lodash';
import { extractContactId } from 'pages/accountLists/[accountListId]/contacts/ContactsWrapper';

export interface ContactPanel {
  /** The id of the contact currently open in the panel, or `undefined` if the panel is closed */
  openContactId: string | undefined;

  /** Whether or not the panel is currently open */
  isOpen: boolean;

  /** Set or update the contact id, opening the panel */
  openContact: (contactId: string) => void;

  /** Clear the contact id and close the panel */
  closePanel: () => void;
}

const ContactPanelContext = createContext<ContactPanel | null>(null);

export const useContactPanel = (): ContactPanel => {
  const context = useContext(ContactPanelContext);
  if (context === null) {
    throw new Error(
      'Could not find ContactPanelContext. Make sure that your component is inside <ContactPanelProvider>.',
    );
  }
  return context;
};

export const ContactPanelProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { query, pathname, push } = useRouter();

  // Extract the initial contact id from the URL
  const [contactId, setContactId] = useState<string | undefined>(() =>
    extractContactId(query),
  );
  // Update the contact id when the URL changes
  useEffect(() => {
    setContactId(extractContactId(query));
  }, [query]);

  const updateContactAndUrl = useCallback(
    (contactId: string | undefined) => {
      const newQuery = omit(query, 'contactId');
      // The contact id is the last item in the contactId query param
      newQuery.contactId = Array.isArray(query.contactId)
        ? query.contactId.slice(0, -1)
        : [];
      if (typeof contactId === 'string') {
        newQuery.contactId.push(contactId);
      }

      push({ pathname, query: newQuery }, undefined, { shallow: true });

      // Optimistically set the contact id
      setContactId(contactId);
    },
    [query, pathname, push],
  );

  const closePanel = useCallback(() => {
    updateContactAndUrl(undefined);
  }, [updateContactAndUrl]);

  return (
    <ContactPanelContext.Provider
      value={{
        openContactId: contactId,
        isOpen: typeof contactId === 'string',
        openContact: updateContactAndUrl,
        closePanel,
      }}
    >
      {children}
    </ContactPanelContext.Provider>
  );
};

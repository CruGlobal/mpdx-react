import { ParsedUrlQuery } from 'node:querystring';
import { UrlObject } from 'node:url';
import { useRouter } from 'next/router';
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { extractContactId } from 'pages/accountLists/[accountListId]/contacts/ContactsWrapper';

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Given a set of router query params, return new query params with the contact modified or removed.
 *
 * @param query The query params from the router
 * @param contactIdParam The name of the query param that holds the contact id (usually `'contactId'`)
 * @param contactId The new contact id (`undefined` closes the panel)
 * @returns The updated query params
 */
export const setQueryContactId = (
  query: ParsedUrlQuery,
  contactIdParam: string,
  contactId: string | undefined,
): ParsedUrlQuery => {
  // The contact id param is always an array because it corresponds to a router segment like
  // `[[...contactId]]`. The array can contain multiple elements, for example, on the contacts page
  // for routes like ".../contacts/map/:contactId". Regardless of the number of elements in the
  // array, if the contact id is present it is always the last element in the array. Note that the
  // last element may not be the contact id if the contact id is not present: (e.g. ["map"] on the
  // contact map page). See the test cases for more examples.

  // Clone the existing contact id array and remove the existing contact id if it is present
  const contactIdValue = Array.isArray(query[contactIdParam])
    ? [...query[contactIdParam]]
    : [];
  // The last element is probably the existing current contact id, but it could also be part of the
  // route (e.g. `'flows'`)
  const lastElement = contactIdValue.pop();
  if (typeof lastElement === 'string' && !uuidRegex.test(lastElement)) {
    // The last element is part of the route, not a contact id, so put it back
    contactIdValue.push(lastElement);
  }

  // Now, add the new contact id
  if (typeof contactId === 'string') {
    contactIdValue.push(contactId);
  }

  // Leave all other query params unmodified
  return {
    ...query,
    [contactIdParam]: contactIdValue,
  };
};

export interface ContactPanel {
  /** The id of the contact currently open in the panel, or `undefined` if the panel is closed */
  openContactId: string | undefined;

  /** Whether or not the panel is currently open */
  isOpen: boolean;

  /** Set or update the contact id, opening the panel */
  openContact: (contactId: string) => void;

  /** Clear the contact id and close the panel */
  closePanel: () => void;

  /**
   * Generate a url object that can be passed to `router.push` or `next/link`'s `href` prop as a
   * to link the specified contact. It will preserve the `pathname` and all other query params.
   */
  buildContactUrl: (contactId: string) => UrlObject;
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

export interface ContactPanelProviderProps {
  /**
   * The name of the query param that holds the contact id. It is `'contactId'` for most pages but
   * is `appealId` on the appeal page.
   **/
  contactIdParam?: string;
  children: ReactNode;
}

export const ContactPanelProvider: React.FC<ContactPanelProviderProps> = ({
  contactIdParam = 'contactId',
  children,
}) => {
  const { query, pathname, push } = useRouter();

  // Extract the initial contact id from the URL
  const [contactId, setContactId] = useState<string | undefined>(() =>
    extractContactId(query[contactIdParam]),
  );
  // Update the contact id when the URL changes
  useEffect(() => {
    setContactId(extractContactId(query[contactIdParam]));
  }, [query, contactIdParam]);

  const updateContactAndUrl = useCallback(
    (contactId: string | undefined) => {
      const newQuery = setQueryContactId(query, contactIdParam, contactId);
      push({ pathname, query: newQuery }, undefined, { shallow: true });

      // Optimistically set the contact id
      setContactId(contactId);
    },
    [query, pathname, contactIdParam, push],
  );

  const buildContactUrl = useCallback(
    (contactId: string): UrlObject => ({
      pathname,
      query: setQueryContactId(query, contactIdParam, contactId),
    }),
    [query, pathname, contactIdParam],
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
        buildContactUrl,
      }}
    >
      {children}
    </ContactPanelContext.Provider>
  );
};

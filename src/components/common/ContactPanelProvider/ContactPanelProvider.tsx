import { ParsedUrlQuery } from 'node:querystring';
import { UrlObject } from 'node:url';
import { useRouter } from 'next/router';
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Split a contact id query param into the prefix and the contact id. For example, a contact id
 * param value of `['map', '00000000-0000-0000-0000-000000000000']` would be split into
 * `{ prefix: ['map'], contactId: '00000000-0000-0000-0000-000000000000' }`.
 *
 * @param paramValue The of the contact id query param from the router
 * @returns The prefix and contact id from the query param
 */
export const splitContactIdParam = (
  paramValue: ParsedUrlQuery[string],
): {
  prefix: string[];
  contactId: string | undefined;
} => {
  // The contact id param is always an array because it corresponds to a router segment like
  // `[[...contactId]]`. The array can contain multiple elements, for example, on the contacts page
  // for routes like ".../contacts/map/:contactId". Regardless of the number of elements in the
  // array, if the contact id is present it is always the last element in the array. Note that the
  // last element may not be the contact id if the contact id is not present: (e.g. ['map'] on the
  // contact map page). See the test cases for more examples.

  if (!Array.isArray(paramValue)) {
    return { prefix: [], contactId: undefined };
  }

  // The contact id is the last item in the query param array, but it must be a UUID, not 'map', for
  // example. The prefix is the rest of the param value, e.g. ['map'].
  const contactId = paramValue.at(-1);
  if (typeof contactId === 'string' && uuidRegex.test(contactId)) {
    return { prefix: paramValue.slice(0, -1), contactId };
  } else {
    return { prefix: paramValue, contactId: undefined };
  }
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

  /**
   * The initial part of the contact id param before the contact id. It is `['map']` in the contacts
   * map view, for example.
   */
  contactIdPrefix?: string[];

  children: ReactNode;
}

export const ContactPanelProvider: React.FC<ContactPanelProviderProps> = ({
  contactIdParam = 'contactId',
  contactIdPrefix: manualContactIdPrefix,
  children,
}) => {
  // The router object is stable across renders, so we don't need to add it to dependency arrays
  const router = useRouter();

  const contactIdParamValue = useMemo(
    () => router.query[contactIdParam],
    // Memoize by the JSON string to ensure stability when the query changes to an equivalent object
    [JSON.stringify(router.query[contactIdParam])],
  );

  const { prefix: urlContactIdPrefix, contactId: urlContactId } = useMemo(
    () => splitContactIdParam(contactIdParamValue),
    [contactIdParamValue],
  );

  // Extract the initial contact id from the URL
  const [contactId, setContactId] = useState(() => urlContactId);
  // Update the contact id when the URL changes
  useEffect(() => {
    setContactId(urlContactId);
  }, [contactIdParamValue]);

  const contactIdPrefix = useMemo(
    () => manualContactIdPrefix ?? urlContactIdPrefix,
    [manualContactIdPrefix, contactIdParamValue],
  );

  // Update the URL when the prefix changes
  useEffect(() => {
    updateContactAndUrl(contactId);
    // Memoize by the JSON string to ensure stability when the prefix changes to an equivalent array
  }, [JSON.stringify(contactIdPrefix)]);

  const buildContactUrl = useCallback(
    (newContactId: string | undefined): UrlObject => {
      const newContactIdParamValue =
        typeof newContactId === 'string'
          ? [...contactIdPrefix, newContactId]
          : contactIdPrefix;

      const newQuery = {
        ...router.query,
        [contactIdParam]: newContactIdParamValue,
      };
      // Remove the contact id from the URL entirely if it is empty
      if (!newContactIdParamValue.length) {
        delete newQuery[contactIdParam];
      }

      return {
        pathname: router.pathname,
        query: newQuery,
      };
    },
    [
      router.pathname,
      // Memoize by the JSON string to reduce rerenders when the query changes to an equivalent object
      JSON.stringify(router.query),
      contactIdPrefix,
      contactIdParam,
    ],
  );

  const updateContactAndUrl = useCallback(
    (newContactId: string | undefined) => {
      const url = buildContactUrl(newContactId);
      const newContactIdParamValue = url.query?.[contactIdParam];
      // Avoid unnecessarily changing the route if the contact id didn't actually change
      if (
        JSON.stringify(contactIdParamValue) !==
        JSON.stringify(newContactIdParamValue)
      ) {
        router.push(url, undefined, { shallow: true });
      }

      // Optimistically set the contact id
      setContactId(newContactId);
    },
    [buildContactUrl, contactIdParamValue],
  );

  const closePanel = useCallback(() => {
    updateContactAndUrl(undefined);
  }, [updateContactAndUrl]);

  const contextValue = useMemo(
    () => ({
      openContactId: contactId,
      isOpen: typeof contactId === 'string',
      openContact: updateContactAndUrl,
      closePanel,
      buildContactUrl,
    }),
    [contactId, updateContactAndUrl, closePanel, buildContactUrl],
  );

  return (
    <ContactPanelContext.Provider value={contextValue}>
      {children}
    </ContactPanelContext.Provider>
  );
};

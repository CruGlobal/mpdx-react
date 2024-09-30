import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useLocation } from './useLocation';

export const Helpjuice: React.FC = () => {
  // Because of the way the Helpjuice script is written, it must be added in _document.page.tsx instead of a component.
  // It adds content to the DOM in response to the DOMContentLoaded. If we add the Swifty script to this component, the
  // DOMContentLoaded event has already fired, and Swifty will not add the beacon elements to the page.
  const { data: session } = useSession();
  const href = useLocation();

  useEffect(() => {
    if (!process.env.HELPJUICE_ORIGIN) {
      return;
    }

    // Add some extra information about the current user and page to the contact us Helpjuice link. Out custom JS on the
    // Helpjuice page will extract this data from the URL and use it to pre-populate the contact form.
    const contactLink = document.getElementById('helpjuice-contact-link');
    if (contactLink instanceof HTMLAnchorElement) {
      const url = new URL(`${process.env.HELPJUICE_ORIGIN}/contact-us`);
      if (session) {
        url.searchParams.set('mpdxName', session.user.name);
        url.searchParams.set('mpdxEmail', session.user.email);
      }
      url.searchParams.set('mpdxUrl', window.location.href);
      contactLink.href = url.toString();
    }

    const knowledgeBaseLink = document.querySelector('a.knowledge-base-link');
    if (
      process.env.HELPJUICE_KNOWLEDGE_BASE_URL &&
      knowledgeBaseLink instanceof HTMLAnchorElement
    ) {
      knowledgeBaseLink.href = process.env.HELPJUICE_KNOWLEDGE_BASE_URL;
    }
  }, [session, href]);

  return null;
};

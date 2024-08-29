import { useEffect } from 'react';
import { useRequiredSession } from 'src/hooks/useRequiredSession';
import { useLocation } from './useLocation';

export const Helpjuice: React.FC = () => {
  // Because of the way the Helpjuice script is written, it must be added in _document.page.tsx instead of a component.
  // It adds content to the DOM in response to the DOMContentLoaded. If we add the Swifty script to this component, the
  // DOMContentLoaded event has already fired, and Swifty will not add the beacon elements to the page.
  const session = useRequiredSession();
  const href = useLocation();

  useEffect(() => {
    if (!process.env.HELPJUICE_ORIGIN) {
      return;
    }

    // Add some extra information about the current user and page to the contact us Helpjuice link. Out custom JS on the
    // Helpjuice page will extract this data from the URL and use it to pre-populate the contact form.
    const link = document.getElementById('helpjuice-contact-link');
    if (link instanceof HTMLAnchorElement) {
      const url = new URL(`${process.env.HELPJUICE_ORIGIN}/contact-us`);
      url.searchParams.set('mpdxName', session.name);
      url.searchParams.set('mpdxEmail', session.email);
      url.searchParams.set('mpdxUrl', window.location.href);
      link.href = url.toString();
    }
  }, [session, href]);

  return null;
};

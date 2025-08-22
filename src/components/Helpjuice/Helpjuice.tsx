import { useContext, useEffect, useState } from 'react';
import { getApolloContext } from '@apollo/client';
import { useSession } from 'next-auth/react';
import { useUserPreference } from 'src/hooks/useUserPreference';
import { DismissableBeacon } from './DismissableBeacon';
import { useLocation } from './useLocation';

/**
 * This component doesn't render anything, but it finds the existing Helpjuice component in the DOM
 * and tweaks some things about it.
 */
export const Helpjuice: React.FC = () => {
  // Because of the way the Helpjuice script is written, it must be added in _document.page.tsx instead of a component.
  // It adds content to the DOM in response to the DOMContentLoaded. If we add the Swifty script to this component, the
  // DOMContentLoaded event has already fired, and Swifty will not add the beacon elements to the page.
  const { data: session } = useSession();
  const href = useLocation();

  // Add a white x that is shown using CSS when the panel is open
  useEffect(() => {
    const closeImage = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path',
    );
    closeImage.classList.add('close');
    closeImage.setAttributeNS(null, 'd', 'M20,20L88,88M88,20L20,88');
    closeImage.setAttributeNS(null, 'stroke', 'white');
    closeImage.setAttributeNS(null, 'stroke-linecap', 'round');
    closeImage.setAttributeNS(null, 'stroke-width', '8');
    closeImage.setAttributeNS(null, 'fill', 'none');

    document
      .querySelector('#helpjuice-widget #helpjuice-widget-trigger svg g')
      ?.appendChild(closeImage);

    return () => closeImage.remove();
  });

  // When a user clicks on an article in the beacon, make the title link to the article in a new
  // tab on Helpjuice and add the Helpjuice domain to links
  useEffect(() => {
    const helpJuiceOrigin = process.env.HELPJUICE_ORIGIN;
    const swiftyContainer = document.getElementsByClassName('hj-swifty')[0];
    if (!helpJuiceOrigin || !(swiftyContainer instanceof HTMLElement)) {
      return;
    }

    const observer = new MutationObserver(() => {
      const questionId = swiftyContainer.dataset.currentQuestionId;
      const nameHeader = document.getElementById('article-content-name');
      if (!questionId || !nameHeader) {
        return;
      }

      // Turn the title into a link when the selected question id changes
      const link = document.createElement('a');
      link.setAttribute('href', `${helpJuiceOrigin}/${questionId}`);
      link.setAttribute('target', '_blank');
      link.textContent = nameHeader.textContent;
      nameHeader.replaceChildren(link);

      // Helpjuice renders links to questions as relative URLs, e.g. href="/question/123"
      // We need to turn them into absolute URLs so that they open correctly
      for (const link of document.querySelectorAll('#article-content-body a')) {
        const href = link.getAttribute('href');
        if (href?.startsWith('/')) {
          link.setAttribute('href', `${helpJuiceOrigin}${href}`);
        }
      }
    });
    // Watch for changes to the selected question
    observer.observe(swiftyContainer, {
      attributeFilter: ['data-current-question-id'],
    });
    return () => observer.disconnect();
  }, []);

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
      contactLink.target = '_blank';
    }

    const knowledgeBaseLink = document.querySelector('a.knowledge-base-link');
    if (
      process.env.HELPJUICE_KNOWLEDGE_BASE_URL &&
      knowledgeBaseLink instanceof HTMLAnchorElement
    ) {
      knowledgeBaseLink.href = process.env.HELPJUICE_KNOWLEDGE_BASE_URL;
    }
  }, [session, href]);

  // Use NoApolloBeacon on pages without an <ApolloProvider>
  const hasApolloClient = Boolean(useContext(getApolloContext()).client);
  return hasApolloClient ? <ApolloBeacon /> : <NoApolloBeacon />;
};

/**
 * This variant of the dismissable beacon saves the dismissed state to a persistent user preference.
 * It can only be used on pages with an <ApolloProvider>.
 */
const ApolloBeacon: React.FC = () => {
  const [dismissed, setDismissed, { loading }] = useUserPreference({
    key: 'beacon_dismissed',
    defaultValue: false,
  });

  return (
    <DismissableBeacon
      dismissed={dismissed || loading}
      setDismissed={setDismissed}
    />
  );
};

/**
 * This variant of the dismissable beacon saves the dismissed state to ephemeral state that will be
 * lost when the page is reloaded. It is designed to be used on pages without an <ApolloProvider>.
 */
const NoApolloBeacon: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  return (
    <DismissableBeacon dismissed={dismissed} setDismissed={setDismissed} />
  );
};

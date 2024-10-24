import { useEffect } from 'react';

interface DismissableBeaconProps {
  dismissed: boolean;
  setDismissed: (dismissed: boolean) => void;
}

/**
 * Like <Helpjuice>, this component doesn't render anything, but it enhances the existing Helpjuice
 * beacon in the DOM by making it dismissable.
 */
export const DismissableBeacon: React.FC<DismissableBeaconProps> = ({
  dismissed,
  setDismissed,
}) => {
  // Sync the #helpjuice-widget .visible classname with the dismissed state
  useEffect(() => {
    const widget = document.getElementById('helpjuice-widget');
    if (dismissed) {
      widget?.classList.remove('visible');
    } else {
      widget?.classList.add('visible');
    }
  }, [dismissed]);

  // Add a Hide Beacon link to the bottom of the popup
  useEffect(() => {
    const dismissLink = document.createElement('a');
    dismissLink.id = 'dismiss-beacon';
    dismissLink.textContent = 'Hide Beacon';
    dismissLink.tabIndex = 0;
    document
      .getElementById('helpjuice-widget-contact')
      ?.appendChild(dismissLink);

    return () => {
      dismissLink?.remove();
    };
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    // Dismiss the beacon when the Hide Beacon link is clicked
    document.getElementById('dismiss-beacon')?.addEventListener(
      'click',
      () => {
        // Hide the popup
        document
          .getElementById('helpjuice-widget-expanded')
          ?.classList.remove('hj-shown');

        setDismissed(true);
      },
      { signal: abortController.signal },
    );

    // Undismiss the beacon when it is clicked
    document.getElementById('helpjuice-widget-trigger')?.addEventListener(
      'click',
      () => {
        setDismissed(false);
      },
      { signal: abortController.signal },
    );

    // Remove all event listeners on unmount
    return () => {
      abortController.abort();
    };
  }, [setDismissed]);

  return null;
};

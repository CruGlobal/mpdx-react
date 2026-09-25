import { buildHelpjuiceContactUrl } from 'src/components/Helpjuice/contactUrl';
import { toSafeHttpUrl } from '../safeUrl';
import { HandoffCardData } from '../types';
import { useCurrentPageUrl } from '../useCurrentPageUrl';

export const useHandoffContactUrl = (card: HandoffCardData): string | null => {
  const href = useCurrentPageUrl();
  const formUrl = toSafeHttpUrl(card.contact_form.url);
  return (
    formUrl &&
    buildHelpjuiceContactUrl({
      contactUrl: formUrl,
      name: card.contact_form.name,
      email: card.contact_form.email,
      href,
    })
  );
};

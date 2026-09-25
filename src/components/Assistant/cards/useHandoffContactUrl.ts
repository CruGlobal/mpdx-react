import { useSession } from 'next-auth/react';
import { buildHelpjuiceContactUrl } from 'src/components/Helpjuice/contactUrl';
import { toSafeHttpUrl } from '../safeUrl';
import { HandoffCardData } from '../types';
import { useCurrentPageUrl } from '../useCurrentPageUrl';

export const useHandoffContactUrl = (card: HandoffCardData): string | null => {
  const href = useCurrentPageUrl();
  const { data: session } = useSession();
  const formUrl = toSafeHttpUrl(card.contact_form.url);
  return (
    formUrl &&
    buildHelpjuiceContactUrl({
      contactUrl: formUrl,
      // The service knows only ids, so it always leaves these blank
      name: card.contact_form.name || session?.user.name,
      email: card.contact_form.email || session?.user.email,
      href,
      summary: card.summary,
    })
  );
};

// Matches the Guide service's default, so a missing HELPJUICE_ORIGIN never leaves the user without a way to the help desk
export const DEFAULT_HELP_DESK_CONTACT_URL =
  'https://www.helpducks.org/contact-us';

interface ContactUrlOptions {
  contactUrl: string;
  name?: string | null;
  email?: string | null;
  href: string;
}

const isPublicHost = (hostname: string): boolean =>
  hostname.includes('.') &&
  !hostname.endsWith('.localhost') &&
  !/^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname) &&
  !hostname.startsWith('[');

// Helpjuice refuses the contact page with a 403 when mpdxUrl names localhost or an IP address
const pageUrlFor = (href: string): string => {
  try {
    const url = new URL(href);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return href;
    }
    return isPublicHost(url.hostname) ? href : url.pathname + url.search;
  } catch {
    return href;
  }
};

// The custom JS on the Helpjuice contact page reads these params to pre-populate the form
export const buildHelpjuiceContactUrl = ({
  contactUrl,
  name,
  email,
  href,
}: ContactUrlOptions): string => {
  const url = new URL(contactUrl);
  if (name) {
    url.searchParams.set('mpdxName', name);
  }
  if (email) {
    url.searchParams.set('mpdxEmail', email);
  }
  url.searchParams.set('mpdxUrl', pageUrlFor(href));
  return url.toString();
};

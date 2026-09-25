// Matches the Guide service's default, so a missing HELPJUICE_ORIGIN never leaves the user without a way to the help desk
export const DEFAULT_HELP_DESK_CONTACT_URL =
  'https://www.helpducks.org/contact-us';

interface ContactUrlOptions {
  contactUrl: string;
  name?: string | null;
  email?: string | null;
  href: string;
  summary?: string;
}

const MAX_SUMMARY_LENGTH = 1500;

// Keeps the link well under URL length limits without cutting a word in half
const trimSummary = (summary: string): string => {
  const text = summary.trim();
  if (text.length <= MAX_SUMMARY_LENGTH) {
    return text;
  }
  const cut = text.slice(0, MAX_SUMMARY_LENGTH);
  if (/\s/.test(text[MAX_SUMMARY_LENGTH])) {
    return cut.trimEnd();
  }
  const lastSpace = cut.search(/\s\S*$/);
  return lastSpace > 0 ? cut.slice(0, lastSpace).trimEnd() : cut;
};

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
  summary,
}: ContactUrlOptions): string => {
  const url = new URL(contactUrl);
  if (name) {
    url.searchParams.set('mpdxName', name);
  }
  if (email) {
    url.searchParams.set('mpdxEmail', email);
  }
  url.searchParams.set('mpdxUrl', pageUrlFor(href));
  const trimmedSummary = summary && trimSummary(summary);
  if (trimmedSummary) {
    url.searchParams.set('mpdxSummary', trimmedSummary);
  }
  return url.toString();
};

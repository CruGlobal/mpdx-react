interface ContactUrlOptions {
  contactUrl: string;
  name?: string | null;
  email?: string | null;
  href: string;
}

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
  url.searchParams.set('mpdxUrl', href);
  return url.toString();
};

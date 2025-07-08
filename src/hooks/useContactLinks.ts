interface UseContactLinksProps {
  url: string;
}
interface UseContactLinksReturn {
  getContactUrl: (contactId: string) => string;
}

export const useContactLinks = ({
  url,
}: UseContactLinksProps): UseContactLinksReturn => {
  const getContactUrl = (contactId: string) => {
    if (url.endsWith('/')) {
      return url + contactId;
    } else {
      return `${url}/${contactId}`;
    }
  };

  return { getContactUrl };
};

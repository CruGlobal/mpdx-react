import { useRouter } from 'next/router';

interface UseContactLinksProps {
  url: string;
}
interface UseContactLinksReturn {
  getContactUrl: (contactId: string) => string;
  handleCloseContact: () => void;
}

export const useContactLinks = ({
  url,
}: UseContactLinksProps): UseContactLinksReturn => {
  const router = useRouter();

  const getContactUrl = (contactId: string) => {
    if (url.endsWith('/')) {
      return url + contactId;
    } else {
      return `${url}/${contactId}`;
    }
  };
  const handleCloseContact = () => {
    router.push(url);
  };

  return {
    getContactUrl,
    handleCloseContact,
  };
};

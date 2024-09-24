import { useRouter } from 'next/router';

interface UseGetContactLinksProps {
  url: string;
}
interface UseGetContactLinksReturn {
  getContactUrl: (contactId: string) => string;
  handleCloseContact: () => void;
}

export const useGetContactLinks = ({
  url,
}: UseGetContactLinksProps): UseGetContactLinksReturn => {
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

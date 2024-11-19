import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { ReactNode } from 'react';
import { useRequiredSession } from 'src/hooks/useRequiredSession';

interface OauthLinkProps extends Omit<NextLinkProps, 'href'> {
  path: string;
  children: ReactNode;
}

export const OauthLink: React.FC<OauthLinkProps> = ({ path, ...props }) => {
  const session = useRequiredSession();

  const url = new URL(path, process.env.OAUTH_URL);
  url.searchParams.append('access_token', session.apiToken);

  return <NextLink href={url.toString()} target="_blank" {...props} />;
};

import { Children, ReactElement, ReactNode, cloneElement } from 'react';
import { useRequiredSession } from 'src/hooks/useRequiredSession';

interface OauthLinkProps {
  path: string;
  children: ReactNode;
}

export const OauthLink: React.FC<OauthLinkProps> = ({ path, children }) => {
  const session = useRequiredSession();

  const url = new URL(path, process.env.OAUTH_URL);
  url.searchParams.append('access_token', session.apiToken);

  const child = Children.only(children) as ReactElement;

  const childProps = {
    href: url.toString(),
    target: '_blank',
    ...child.props,
  };

  return cloneElement(child, childProps);
};

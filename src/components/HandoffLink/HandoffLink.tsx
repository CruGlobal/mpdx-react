import { ReactElement, ReactNode, Children, cloneElement } from 'react';
import { useAccountListId } from '../../hooks/useAccountListId';
import { useUser } from '../User/useUser';

interface Props {
  path: string;
  auth?: boolean;
  children: ReactNode;
}

const HandoffLink = ({ path, auth, children }: Props): ReactElement => {
  const user = useUser();
  const accountListId = useAccountListId();

  const url = new URL(
    `${process.env.SITE_URL || window.location.origin}/api/handoff`,
  );

  if (auth) {
    url.searchParams.append('auth', 'true');
  } else {
    url.searchParams.append('accountListId', accountListId ?? '');
    url.searchParams.append('userId', user?.id ?? '');
  }
  url.searchParams.append('path', path);

  const child = Children.only(children) as ReactElement;

  const childProps = {
    href: `https://${auth ? 'auth.' : ''}${process.env.REWRITE_DOMAIN + path}`,
    target: '_blank',
    onClick: (e: React.MouseEvent) => {
      if (child.props && typeof child.props.onClick === 'function') {
        child.props.onClick(e);
      }
      if (!e.defaultPrevented) {
        window.open(url.href, '_blank');
        e.preventDefault();
      }
    },
  };

  return cloneElement(child, childProps);
};

export default HandoffLink;

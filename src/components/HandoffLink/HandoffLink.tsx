import { Children, ReactElement, ReactNode, cloneElement } from 'react';

interface Props {
  path: string;
  children: ReactNode;
}

const HandoffLink = ({ path, children }: Props): ReactElement => {
  const url = new URL(`${process.env.OAUTH_URL}/api/handoff`);
  url.searchParams.append('auth', 'true');
  url.searchParams.append('path', path);

  const child = Children.only(children) as ReactElement;

  const childProps = {
    href: `https://${process.env.REWRITE_DOMAIN + path}`,
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

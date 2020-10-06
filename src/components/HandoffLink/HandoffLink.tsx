import { ReactElement, ReactNode, Children, cloneElement } from 'react';
import { useApp } from '../App';

interface Props {
    path: string;
    children: ReactNode;
}

const HandoffLink = ({ path, children }: Props): ReactElement => {
    const app = useApp();

    const url = new URL(`${process.env.SITE_URL || window.location.origin}/api/handoff`);

    url.searchParams.append('accountListId', app?.state?.accountListId);
    url.searchParams.append('userId', app?.state?.user?.id);
    url.searchParams.append('path', path);

    const child = Children.only(children) as ReactElement;

    const childProps = {
        href: `https://${process.env.SITE_URL === 'https://next.mpdx.org' ? '' : 'stage.'}mpdx.org${path}`,
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

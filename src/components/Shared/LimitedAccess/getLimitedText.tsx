import Link from 'next/link';
import { TFunction } from 'i18next';
import { Trans } from 'react-i18next';
import theme from 'src/theme';

interface GetLimitedTextProps {
  t: TFunction;
  noStaffAccount?: boolean;
  userGroupError?: boolean;
  notSupervisor?: boolean;
}

const SupportLink: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => (
  <Link
    href="mailto:support@mpdx.org"
    style={{ color: theme.palette.primary.main, fontWeight: 'bold' }}
  >
    {children}
  </Link>
);

export const getLimitedText = ({
  t,
  noStaffAccount,
  userGroupError,
  notSupervisor,
}: GetLimitedTextProps) => {
  if (userGroupError) {
    return {
      title: t('Unable to load this page'),
      content: (
        <Trans t={t}>
          Something went wrong while loading your account information. Please
          try again later. If the problem persists, please contact{' '}
          <SupportLink>support@mpdx.org</SupportLink>.
        </Trans>
      ),
    };
  }

  if (noStaffAccount) {
    return {
      title: t('Access to this feature is limited.'),
      content: (
        <Trans t={t}>
          Our records show that you do not have a staff account. You cannot
          access this feature if you do not have a staff account. If you think
          this is a mistake, please contact{' '}
          <SupportLink>support@mpdx.org</SupportLink>.
        </Trans>
      ),
    };
  }

  if (notSupervisor) {
    return {
      title: t('Access to this feature is limited.'),
      content: (
        <Trans t={t}>
          Our records show that you do not supervise any staff. You cannot
          access this feature if you do not supervise staff. If you think this
          is a mistake, please contact{' '}
          <SupportLink>support@mpdx.org</SupportLink>.
        </Trans>
      ),
    };
  }

  return {
    title: t('Access to this feature is limited.'),
    content: (
      <Trans t={t}>
        Our records show that you are not part of the user group that has access
        to this feature. If you think this is a mistake, please contact{' '}
        <SupportLink>support@mpdx.org</SupportLink> to change your user group.
      </Trans>
    ),
  };
};

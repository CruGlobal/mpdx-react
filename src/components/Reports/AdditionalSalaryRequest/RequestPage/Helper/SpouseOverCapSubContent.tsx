import Link from 'next/link';
import { Trans, useTranslation } from 'react-i18next';
import theme from 'src/theme';

interface SpouseOverCapSubContentProps {
  spouseName: string;
}

export const SpouseOverCapSubContent: React.FC<
  SpouseOverCapSubContentProps
> = ({ spouseName }) => {
  const { t } = useTranslation();

  return (
    <Trans t={t} values={{ spouseName }} parent="span">
      Please consider submitting your request at your maximum allowable salary
      to reduce the amount on {spouseName}&apos;s request, which may avoid
      requiring approval through our{' '}
      <Link
        href="/"
        style={{ display: 'inline', color: theme.palette.primary.main }}
      >
        Progressive Approvals
      </Link>{' '}
      process.
    </Trans>
  );
};

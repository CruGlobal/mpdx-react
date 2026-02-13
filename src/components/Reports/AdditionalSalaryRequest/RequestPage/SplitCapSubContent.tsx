import Link from 'next/link';
import { Trans, useTranslation } from 'react-i18next';
import theme from 'src/theme';

interface SplitCapSubContentProps {
  spouseName: string;
}

export const SplitCapSubContent: React.FC<SplitCapSubContentProps> = ({
  spouseName,
}) => {
  const { t } = useTranslation();

  return (
    <Trans t={t} values={spouseName} parent="span">
      Please make adjustments to your request to continue. You may make a
      separate request up to {spouseName}&apos;s maximum allowable salary if
      desired. After using both you and {spouseName}&apos;s maximum allowable
      salary, any additional requests can be submitted online but will require
      approval through our{' '}
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

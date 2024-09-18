import { Link, LinkProps } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const PrivacyPolicyLink: React.FC<LinkProps> = (props) => {
  const { t } = useTranslation();

  return (
    <Link href={process.env.PRIVACY_POLICY_URL} target="_blank" {...props}>
      {t('Privacy Policy')}
    </Link>
  );
};

export const TermsOfUseLink: React.FC<LinkProps> = (props) => {
  const { t } = useTranslation();

  return (
    <Link href={process.env.TERMS_OF_USE_URL} target="_blank" {...props}>
      {t('Terms of Use')}
    </Link>
  );
};

import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useAdditionalSalaryRequest } from './AdditionalSalaryRequestContext';

interface SpouseLinkInfo {
  spouseLinkText: string;
  spouseLinkHref: string;
  showSpouseLink: boolean;
}

export const useSpouseLink = (): SpouseLinkInfo => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { spouse, isSpouse } = useAdditionalSalaryRequest();

  const name = spouse?.staffInfo?.firstName ?? '';
  const spouseLinkText = isSpouse
    ? t('Switch back to {{name}}', { name })
    : t('Request additional salary for {{name}}', { name });
  const spouseLinkHref = `/accountLists/${accountListId}/reports/additionalSalaryRequest${isSpouse ? '' : '?isSpouse=true'}`;
  const showSpouseLink = !!spouse;

  return { spouseLinkText, spouseLinkHref, showSpouseLink };
};

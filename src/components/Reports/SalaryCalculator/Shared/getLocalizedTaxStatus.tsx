import { TFunction } from 'react-i18next';
import { SecaStatusEnum } from 'pages/api/graphql-rest.page.generated';

export const getLocalizedTaxStatus = (
  status: SecaStatusEnum | null | undefined,
  t: TFunction,
) => {
  if (!status) {
    return undefined;
  }

  if (status === SecaStatusEnum.Fica) {
    return t('Subject to FICA');
  }
  if (status === SecaStatusEnum.NonExempt) {
    return t('Subject to SECA');
  }
  if (status === SecaStatusEnum.Exempt) {
    return t('Exempt');
  }
};

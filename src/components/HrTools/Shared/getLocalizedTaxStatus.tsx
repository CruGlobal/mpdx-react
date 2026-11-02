import { TFunction } from 'react-i18next';
import { SecaStatusEnum } from 'src/graphql/types.generated';

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
  if (status === SecaStatusEnum.Seca) {
    return t('Subject to SECA');
  }
  if (status === SecaStatusEnum.Optout) {
    return t('Exempt');
  }
};

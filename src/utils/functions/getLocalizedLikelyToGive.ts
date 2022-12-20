import { TFunction } from 'react-i18next';
import { LikelyToGiveEnum } from '../../../graphql/types.generated';

export const getLocalizedLikelyToGive = (
  t: TFunction,
  likelyToGive: LikelyToGiveEnum | null | undefined,
): string => {
  switch (likelyToGive) {
    case LikelyToGiveEnum.MostLikely:
      return t('Most Likely');

    case LikelyToGiveEnum.Likely:
      return t('Likely');

    case LikelyToGiveEnum.LeastLikely:
      return t('Least Likely');

    default:
      return '';
  }
};

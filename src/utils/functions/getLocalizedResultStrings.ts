import { TFunction } from 'react-i18next';
import { ResultEnum } from '../../../graphql/types.generated';

export const getLocalizedResultString = (
  t: TFunction,
  resultType: ResultEnum | null | undefined,
): string => {
  if (!resultType) {
    return '';
  }

  switch (resultType) {
    case ResultEnum.Attempted:
      return t('Attempted');

    case ResultEnum.AttemptedLeftMessage:
      return t('Attempted - Left Message');

    case ResultEnum.Completed:
      return t('Completed');

    case ResultEnum.Done:
      return t('Done');

    case ResultEnum.None:
      return t('None');

    case ResultEnum.Received:
      return t('Received');
  }
};

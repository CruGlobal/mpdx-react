import { useTranslation } from 'react-i18next';
import { AssistantErrorReason } from './types';

export const useErrorText = (
  reason: AssistantErrorReason | undefined,
): string => {
  const { t } = useTranslation();
  switch (reason) {
    case 'unavailable':
      return t(
        'The assistant is busy right now. Please try again in a moment.',
      );
    case 'rateLimited':
      return t('Please wait a moment before sending another message.');
    default:
      return t('Sorry, something went wrong. Please try again.');
  }
};

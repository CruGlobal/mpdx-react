import { TFunction } from 'i18next';

interface GetModalTextProps {
  t: TFunction;
  formTitle: string;
  isCancel: boolean;
  isDiscard: boolean;
  isDiscardEdit: boolean;
  actionRequired: boolean;
  formattedDeadlineDate: string | null;
}

interface ModalText {
  title: string;
  contentTitle: string;
  contentText: string;
  cancelButtonText: string;
  isError: boolean;
}

export const getModalText = ({
  t,
  formTitle,
  isCancel,
  isDiscard,
  isDiscardEdit,
  actionRequired,
  formattedDeadlineDate,
}: GetModalTextProps): ModalText => {
  const isError = isCancel || isDiscard || isDiscardEdit;

  switch (true) {
    case isCancel:
      return {
        title: t(`Do you want to cancel your ${formTitle}?`),
        contentTitle: t(`You are cancelling this ${formTitle}.`),
        contentText: t(
          'It will no longer be considered for board review and your information entered in this form will not be saved.',
        ),
        cancelButtonText: t('Yes, Cancel'),
        isError,
      };
    case isDiscard:
      return {
        title: t('Do you want to discard?'),
        contentTitle: t(`You are discarding this ${formTitle}.`),
        contentText: t(
          'This will clear all entered information and you may start a new form.',
        ),
        cancelButtonText: t('Yes, Discard'),
        isError,
      };
    case isDiscardEdit:
      return {
        title: t('Do you want to discard these changes?'),
        contentTitle: t('You are discarding your changes to this form.'),
        contentText: t(
          'Your work will not be saved and the board will review your request as previously submitted.',
        ),
        cancelButtonText: t('Yes, Discard Changes'),
        isError,
      };
    case actionRequired:
      return {
        title: t(`Are you ready to submit your updated ${formTitle}?`),
        contentTitle:
          formTitle === t('MHA Request')
            ? t(
                `You are submitting changes to your Annual ${formTitle} for board approval.`,
              )
            : t(`You are submitting changes to your ${formTitle}.`),
        contentText: t(
          'This updated request will take the place of your previous request. Once submitted, you can return and make edits until {{date}}. After this date, your request will be processed as is.',
          {
            date: formattedDeadlineDate,
            interpolation: { escapeValue: false },
          },
        ),
        cancelButtonText: t('Yes, Continue'),
        isError,
      };
    default:
      return {
        title: t(`Are you ready to submit your ${formTitle}?`),
        contentTitle:
          formTitle === t('MHA Request')
            ? t(`You are submitting your ${formTitle} for board approval.`)
            : t(`You are submitting your ${formTitle}.`),
        contentText: t(
          'Once submitted, you can return and make edits until {{date}}. After this date, your request will be processed as is.',
          {
            date: formattedDeadlineDate,
            interpolation: { escapeValue: false },
          },
        ),
        cancelButtonText: t('Yes, Continue'),
        isError,
      };
  }
};

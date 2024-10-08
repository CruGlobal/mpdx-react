import { TFunction } from 'react-i18next';

const appName = process.env.APP_NAME ?? 'MPDX';

// This value should be used in the database for a custom/manual source. Like when the user creates a new email, phone number, address, etc.
export const manualSourceValue = 'manual';
// In the past, 'MPDX' was saved to the database as the source for manual entries.
export const oldManualSourceValue = 'MPDX';

export const sourceToStr = (
  t: TFunction,
  source: string | undefined | null,
): string => {
  switch (source) {
    case 'Siebel':
      return t('US Donation Services');
    case 'DataServer':
      return t('DonorHub');
    case 'manual':
    case 'MPDX':
      return appName;
    case 'TntImport':
      return t('Tnt Import');
    case 'GoogleImport':
      return t('Google Import');
    default:
      return source || '';
  }
};

export const editableSources = ['MPDX', 'manual', 'TntImport'];

export const isEditableSource = (source: string | undefined): boolean => {
  // A source is editable if it is undefined or if it is in the list of editable sources.
  if (source === undefined) {
    return true;
  } else {
    return editableSources.indexOf(source) > -1;
  }
};

export const sourcesMatch = (
  defaultSource: string | undefined,
  itemSource: string | undefined,
): boolean => {
  return (
    itemSource === defaultSource ||
    (defaultSource === manualSourceValue && itemSource === oldManualSourceValue)
  );
};

import { TFunction } from 'react-i18next';

const appName = process.env.APP_NAME ?? 'MPDX';

// 'MPDX' is what the API sets as the 'source' for new data created from MPDX. For example when the user creates a new email, phone number, address, etc. The API does not use appName so we need to keep 'manualSourceValue' as 'MPDX'
export const manualSourceValue = 'MPDX';

// 'MPDX' source values in the database will display as appName
export const sourceToStr = (
  t: TFunction,
  source: string | undefined | null,
): string => {
  switch (source) {
    case 'Siebel':
      return t('US Donation Services');
    case 'DataServer':
      return t('DonorHub');
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

export const editableSources = ['MPDX', 'TntImport'];

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
  return itemSource === defaultSource;
};

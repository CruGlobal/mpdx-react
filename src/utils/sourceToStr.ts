type sources =
  | 'US Donation Services'
  | 'DonorHub'
  | 'MPDX'
  | 'Tnt Import'
  | 'Google Import';

export const sourceToStr = (source: string): sources => {
  switch (source) {
    case 'Siebel':
      return 'US Donation Services';
    case 'DataServer':
      return 'DonorHub';
    case 'MPDX':
      return 'MPDX';
    case 'TntImport':
      return 'Tnt Import';
    case 'GoogleImport':
      return 'Google Import';
    default:
      return 'MPDX';
  }
};

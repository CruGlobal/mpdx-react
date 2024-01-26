import { TFunction } from 'react-i18next';

export enum AddressLocationEnum {
  Home = 'Home',
  Business = 'Business',
  Mailing = 'Mailing',
  Seasonal = 'Seasonal',
  Other = 'Other',
  Temporary = 'Temporary',
  RepAddress = 'Rep Address',
}

export const getLocalizedAddressLocation = (
  t: TFunction,
  location: AddressLocationEnum,
): string => {
  switch (location) {
    case AddressLocationEnum.Home:
      return t('Home');
    case AddressLocationEnum.Business:
      return t('Business');
    case AddressLocationEnum.Mailing:
      return t('Mailing');
    case AddressLocationEnum.Seasonal:
      return t('Seasonal');
    case AddressLocationEnum.Other:
      return t('Other');
    case AddressLocationEnum.Temporary:
      return t('Temporary');
    case AddressLocationEnum.RepAddress:
      return t('Rep Address');
  }
};

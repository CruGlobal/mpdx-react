import { MenuItem, Select, SelectProps } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  AddressLocationEnum,
  getLocalizedAddressLocation,
} from 'src/components/Contacts/ContactDetails/ContactDetailsTab/Mailing/AddressLocation';

export const AddressLocationSelect = ({ ...props }: SelectProps) => {
  const { t } = useTranslation();
  return (
    <Select label={t('Location')} fullWidth {...props}>
      {Object.values(AddressLocationEnum).map((value) => (
        <MenuItem
          key={value}
          value={value}
          aria-label={getLocalizedAddressLocation(t, value)}
        >
          {getLocalizedAddressLocation(t, value)}
        </MenuItem>
      ))}
    </Select>
  );
};

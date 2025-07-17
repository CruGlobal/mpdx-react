import { ListSubheader, MenuItem, Select, SelectProps } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import { useLocalizedConstants } from 'src/hooks/useLocalizedConstants';

export const ContactStatusSelect = ({ children, ...props }: SelectProps) => {
  const { t } = useTranslation();
  const phases = useApiConstants()?.phases;
  const { getLocalizedContactStatus } = useLocalizedConstants();

  return (
    <Select label={t('Status')} {...props}>
      {children}
      {phases?.map((phase) => [
        <ListSubheader key={phase?.id}>{phase?.name}</ListSubheader>,
        phase?.contactStatuses.map((status) => (
          <MenuItem key={status} value={status}>
            {getLocalizedContactStatus(status)}
          </MenuItem>
        )),
      ])}
    </Select>
  );
};

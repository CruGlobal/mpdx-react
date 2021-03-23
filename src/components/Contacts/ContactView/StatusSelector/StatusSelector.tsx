import { Box, InputLabel, MenuItem, Select } from '@material-ui/core';
import React, { ReactElement, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface StatusSelectorProps {
  statuses: string[];
  selectedStatus: string;
}

export const StatusSelector: React.FC<StatusSelectorProps> = ({
  statuses,
  selectedStatus,
}) => {
  const { t } = useTranslation();
  const [contactStatus, setContactStatus] = React.useState(selectedStatus);
  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setContactStatus(event.target.value as string);
  };
  return (
    <Box>
      <InputLabel>{t('Status')}</InputLabel>
      <Select id="contactStatus" value={contactStatus} onChange={handleChange}>
        {statuses.map(function (status, _index) {
          return <MenuItem value={status}>{status}</MenuItem>;
        })}
      </Select>
    </Box>
  );
};

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, styled, Hidden } from '@material-ui/core';
import { FormatListBulleted, ViewColumn } from '@material-ui/icons';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';

export type ContactsTableViewMode = 'list' | 'columns';

interface ViewModeToggleProps {
  onChange: (
    event: React.MouseEvent<HTMLElement>,
    viewMode: ContactsTableViewMode | null,
  ) => void;
  value: ContactsTableViewMode;
}

const BulletedListIcon = styled(FormatListBulleted)(({ theme }) => ({
  color: theme.palette.primary.dark,
}));
const ViewColumnIcon = styled(ViewColumn)(({ theme }) => ({
  color: theme.palette.primary.dark,
}));

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  onChange,
  value,
}) => {
  const { t } = useTranslation();

  return (
    <Hidden xsDown>
      <Box mx={1}>
        <ToggleButtonGroup exclusive value={value} onChange={onChange}>
          <ToggleButton value="list">
            <BulletedListIcon titleAccess={t('List View')} />
          </ToggleButton>
          <ToggleButton value="columns">
            <ViewColumnIcon titleAccess={t('Column Workflow View')} />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Hidden>
  );
};

import React, { useState } from 'react';
import { Chip, Menu, MenuItem, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface CoordinatorsCellProps {
  /** Read-only OneApp coordinator names, in the order the API returns them. */
  coordinators: string[];
}

/**
 * Coordinator column contents. A ministry usually has several coordinators
 * (MPDX-9688), so the column shows the first name and hides the rest behind a
 * "+N" chip that opens the full list.
 */
export const CoordinatorsCell: React.FC<CoordinatorsCellProps> = ({
  coordinators,
}) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const [firstCoordinator, ...overflow] = coordinators;
  if (!firstCoordinator) {
    return null;
  }

  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <Typography variant="body2" component="span">
        {firstCoordinator}
      </Typography>
      {overflow.length > 0 && (
        <>
          <Chip
            size="small"
            variant="outlined"
            color="primary"
            label={`+${overflow.length}`}
            aria-label={t('Show all {{total}} coordinators', {
              total: coordinators.length,
            })}
            onClick={(event) => setAnchorEl(event.currentTarget)}
          />
          <Menu
            anchorEl={anchorEl}
            open={anchorEl !== null}
            onClose={() => setAnchorEl(null)}
            slotProps={{ list: { 'aria-label': t('Coordinators') } }}
          >
            {coordinators.map((coordinator, index) => (
              <MenuItem key={`${index}-${coordinator}`} disableRipple>
                {coordinator}
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
    </Stack>
  );
};

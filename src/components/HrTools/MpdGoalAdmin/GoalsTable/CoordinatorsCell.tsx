import React, { useState } from 'react';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {
  ButtonBaseProps,
  Chip,
  Menu,
  MenuItem,
  Stack,
  TableCell,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

// Chip forwards root props to ButtonBase, whose ripple ChipProps doesn't type.
const rippleOff = { disableRipple: true } as Pick<
  ButtonBaseProps,
  'disableRipple'
>;

interface CoordinatorsCellProps {
  /** Read-only OneApp coordinator names, in the order the API returns them. */
  coordinators: string[];
  /** Row's staff member, announced with the overflow count for row context. */
  staffName: string;
}

/** Shows the first coordinator; a ministry usually has several (MPDX-9688). */
export const CoordinatorsCell: React.FC<CoordinatorsCellProps> = ({
  coordinators,
  staffName,
}) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  if (coordinators.length === 0) {
    // No coordinator is the normal answer, and a blank cell would read as a bug.
    return <TableCell>—</TableCell>;
  }

  const [firstCoordinator, ...overflow] = coordinators;

  return (
    <TableCell>
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
              icon={<ArrowDropDownIcon />}
              label={`+${overflow.length}`}
              aria-label={t('+{{count}} more coordinators for {{name}}', {
                count: overflow.length,
                name: staffName,
              })}
              aria-haspopup="dialog"
              aria-expanded={anchorEl !== null}
              onClick={(event) => setAnchorEl(event.currentTarget)}
              {...rippleOff}
            />
            <Menu
              anchorEl={anchorEl}
              open={anchorEl !== null}
              onClose={() => setAnchorEl(null)}
              // Read-only names, so the overlay is a list and not a command menu.
              slotProps={{
                list: { role: 'list', 'aria-label': t('Coordinators') },
              }}
            >
              {coordinators.map((coordinator, index) => (
                <MenuItem
                  key={`${index}-${coordinator}`}
                  role="listitem"
                  disableRipple
                >
                  {coordinator}
                </MenuItem>
              ))}
            </Menu>
          </>
        )}
      </Stack>
    </TableCell>
  );
};

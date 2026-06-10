import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  styled,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import cruLogo from 'src/images/cru/cru-logo.svg';
import theme from 'src/theme';

const StyledTableCell = styled(TableCell)({
  border: 'none',
  paddingBlock: theme.spacing(2),
});

export interface PersonalInfoRow {
  label: string;
  value?: string;
}

interface PersonalInfoTableProps {
  rows: PersonalInfoRow[];
}

/**
 * Personal information table shown on the goal presentation pages. Renders
 * label/value rows with the Cru logo to the right of the first row.
 */
export const PersonalInfoTable: React.FC<PersonalInfoTableProps> = ({
  rows,
}) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <Table size="small">
        <TableBody>
          {rows.map((item, index) => (
            <TableRow key={item.label}>
              <StyledTableCell>
                <Typography variant="body1" fontWeight="bold">
                  {item.label}
                </Typography>
              </StyledTableCell>
              <StyledTableCell data-testid="value-typography">
                {item.value}
              </StyledTableCell>
              {index === 0 && (
                <StyledTableCell
                  sx={{ textAlign: 'center' }}
                  rowSpan={rows.length}
                >
                  <img
                    data-testid="cru-logo"
                    src={cruLogo}
                    alt={t('Campus Crusade for Christ, Inc. logo')}
                    style={{ width: 150, height: 'auto' }}
                  />
                </StyledTableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

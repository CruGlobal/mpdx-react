import React from 'react';
import {
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const StyledStack = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
}));

export interface SummaryRow {
  label: string;
  value: React.ReactNode;
  required?: boolean;
}

interface SummarySectionProps {
  title: string;
  rows: SummaryRow[];
  onEdit: () => void;
}

export const SummarySection: React.FC<SummarySectionProps> = ({
  title,
  rows,
  onEdit,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Box>
      <StyledStack>
        <Typography variant="h6">{title}</Typography>
        <Button
          size="small"
          onClick={onEdit}
          aria-label={t('Edit {{section}}', { section: title })}
        >
          {t('Edit')}
        </Button>
      </StyledStack>
      <Table size="small" sx={{ tableLayout: 'fixed' }}>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{ width: '40%', color: theme.palette.mpdxBlue.main }}
            >
              {t('Category')}
            </TableCell>
            <TableCell sx={{ color: theme.palette.mpdxBlue.main }}>
              {t('Value')}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.label}>
              <TableCell
                component="th"
                scope="row"
                sx={{ fontWeight: 'medium' }}
              >
                {row.label}
              </TableCell>
              <TableCell>
                {row.value ?? (
                  <Typography
                    component="span"
                    variant="body2"
                    fontStyle="italic"
                    sx={{
                      color: row.required
                        ? theme.palette.error.main
                        : theme.palette.text.secondary,
                    }}
                  >
                    {t('No value provided')}
                  </Typography>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

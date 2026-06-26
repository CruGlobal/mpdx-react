import React, { ReactNode } from 'react';
import { Box, Typography, TypographyOwnProps, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';

const Row = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridAutoFlow: 'column',
  gridTemplateColumns: 'minmax(160px, 260px)',
  gridAutoColumns: 'minmax(0, 1fr)',
  columnGap: theme.spacing(4),
  rowGap: theme.spacing(2),
  alignItems: 'center',
}));

const RowHeader: React.FC<TypographyOwnProps> = (props) => (
  <Typography variant="body2" fontWeight="bold" color="primary" {...props} />
);

interface SectionProps {
  title: string;
  children: ReactNode;
}

/** A titled section of the Goal Settings form. */
export const Section: React.FC<SectionProps> = ({ title, children }) => (
  <Box component="section" sx={{ mb: 4 }}>
    <Typography variant="h6" sx={{ mb: 2 }}>
      {title}
    </Typography>
    {children}
  </Box>
);

interface ColumnHeaderRowProps {
  /** One header per person column, e.g. ["John (Joining)", "Jane (Senior)"]. */
  columns: string[];
}

/** Renders the leading "Category" header plus the per-person column headers. */
export const ColumnHeaderRow: React.FC<ColumnHeaderRowProps> = ({
  columns,
}) => {
  const { t } = useTranslation();

  return (
    <Row sx={{ mb: 2 }}>
      <RowHeader>{t('Category')}</RowHeader>
      {columns.map((column) => (
        <RowHeader key={column}>{column}</RowHeader>
      ))}
    </Row>
  );
};

interface FieldRowProps {
  /** Row label shown in the leading Category column. */
  label: string;
  /** Optional helper text shown beneath the label, e.g. "Senior Staff Only". */
  helperText?: string;
  /** One field node per person column. A single child spans the value column. */
  children: ReactNode;
}

/**
 * One row: a leading Category column (label + optional helper text) followed by
 * one aligned value cell per person column. The label is hidden on each field
 * since the Category column already shows it.
 */
export const FieldRow: React.FC<FieldRowProps> = ({
  label,
  helperText,
  children,
}) => (
  <Row sx={{ mb: 3 }}>
    <div>
      <Typography variant="body1">{label}</Typography>
      {helperText && (
        <Typography variant="body2" color="text.secondary">
          {helperText}
        </Typography>
      )}
    </div>
    {children}
  </Row>
);

import { Box, SvgIconProps, Typography } from '@mui/material';
import { EmptyTableWrapper } from 'src/components/Shared/styledComponents/EmptyTableWrapper';

interface EmptyTableProps {
  title: string;
  subtitle: string;
  icon: React.ComponentType<SvgIconProps>;
}

export const EmptyTable: React.FC<EmptyTableProps> = ({
  title,
  subtitle,
  icon: Icon,
}) => (
  <EmptyTableWrapper boxShadow={3}>
    <Icon fontSize="large" />
    <Typography variant="h5">{title}</Typography>
    <Typography>{subtitle}</Typography>
    <Box sx={{ padding: 1, display: 'flex', gap: 2 }}></Box>
  </EmptyTableWrapper>
);

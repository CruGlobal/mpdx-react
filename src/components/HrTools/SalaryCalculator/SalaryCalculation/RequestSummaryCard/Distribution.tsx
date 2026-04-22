import { Box, styled } from '@mui/material';
import { Category } from './Category';

const DistributionContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  height: '12px',
  backgroundColor: theme.palette.mpdxGrayLight.main,
  overflow: 'hidden',
}));

interface DistributionProps {
  categories: Category[];
  totalCap: number;
  invalid: boolean;
}

export const Distribution: React.FC<DistributionProps> = ({
  categories,
  totalCap,
  invalid,
}) => (
  <DistributionContainer
    sx={(theme) => ({
      border: invalid ? `2px solid ${theme.palette.error.main}` : undefined,
    })}
  >
    {categories.map((category) => (
      <Box
        key={category.label}
        sx={{
          width: totalCap ? `${(category.amount / totalCap) * 100}%` : 0,
          backgroundColor: category.color,
        }}
      />
    ))}
  </DistributionContainer>
);

import { Skeleton } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledSkeleton = styled(Skeleton)(({ theme }) => ({
  padding: theme.spacing(1),
  margin: theme.spacing(1),
}));

interface MultilineSkeletonProps {
  lines: number;
}

export const MultilineSkeleton: React.FC<MultilineSkeletonProps> = ({
  lines,
}) => (
  <>
    {new Array(lines).fill(undefined).map((_, index) => (
      <StyledSkeleton key={index} data-testid="Line" />
    ))}
  </>
);

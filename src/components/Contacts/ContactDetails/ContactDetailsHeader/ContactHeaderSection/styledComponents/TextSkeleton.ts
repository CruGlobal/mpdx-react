import { Skeleton } from '@mui/material';
import { styled } from '@mui/material/styles';

export const TextSkeleton = styled(Skeleton)(({}) => ({
  display: 'inline',
  marginLeft: 18,
  width: 200,
  fontSize: 16,
}));

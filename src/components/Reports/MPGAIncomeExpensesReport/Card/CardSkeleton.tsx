import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  SxProps,
  Theme,
} from '@mui/material';

export interface CardSkeletonProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  styling?: SxProps<Theme>;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  title,
  subtitle,
  children,
  styling,
}) => {
  return (
    <Card>
      <CardHeader title={title} subheader={subtitle} />
      <Divider />
      <CardContent sx={{ ...styling }}>{children}</CardContent>
    </Card>
  );
};

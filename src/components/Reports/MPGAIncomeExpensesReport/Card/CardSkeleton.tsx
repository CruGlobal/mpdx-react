import { Card, CardContent, CardHeader, Divider } from '@mui/material';

export interface CardSkeletonProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  title,
  subtitle,
  children,
}) => {
  return (
    <Card>
      <CardHeader title={title} subheader={subtitle} />
      <Divider />
      <CardContent>{children}</CardContent>
    </Card>
  );
};

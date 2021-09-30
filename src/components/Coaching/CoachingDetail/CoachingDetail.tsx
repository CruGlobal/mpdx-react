import React from 'react';
import { Box, styled } from '@material-ui/core';

interface CoachingDetailProps {
  coachingId: string;
}

const CoachingDetailContainer = styled(Box)(({ theme }) => ({
  width: '100&',
  padding: theme.spacing(1),
}));

export const CoachingDetail: React.FC<CoachingDetailProps> = ({
  coachingId,
}) => {
  console.log(coachingId);
  return <CoachingDetailContainer></CoachingDetailContainer>;
};

export default CoachingDetail;

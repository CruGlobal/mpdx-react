import React, { memo } from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { StatusEnum } from 'src/graphql/types.generated';
import { useLocalizedConstants } from 'src/hooks/useLocalizedConstants';
import theme from 'src/theme';

interface Props {
  status: StatusEnum;
  width: number;
}

const DragLayerStatusBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'width',
})(({ width }: { width: number }) => ({
  width: width,
  padding: theme.spacing(1.5),
  backgroundColor: theme.palette.mpdxYellow.main,
  cursor: 'move',
  boxShadow: `inset 0px 0px 0px 3px  ${theme.palette.progressBarYellow.main}`,
}));

export const ContactFlowSetupDragPreviewStatus: React.FC<Props> = memo(
  function ContactFlowSetupDragPreviewStatus({ status, width }) {
    const { getLocalizedContactStatus } = useLocalizedConstants();

    return (
      <DragLayerStatusBox width={width}>
        <Typography>{getLocalizedContactStatus(status)}</Typography>
      </DragLayerStatusBox>
    );
  },
);

import { Box, Theme, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  status: string;
  width: number;
}

const DragLayerStatusBox = styled(Box)(
  ({ theme, width }: { theme: Theme; width: number }) => ({
    width: width,
    padding: theme.spacing(1.5),
    backgroundColor: theme.palette.mpdxYellow.main,
    cursor: 'move',
    boxShadow: `inset 0px 0px 0px 3px  ${theme.palette.progressBarYellow.main}`,
  }),
);

export const ContactFlowSetupDragPreviewStatus: React.FC<Props> = memo(
  function ContactFlowSetupDragPreviewStatus({ status, width }) {
    const { t } = useTranslation();
    return (
      <DragLayerStatusBox width={width}>
        <Typography>{t(status)}</Typography>
      </DragLayerStatusBox>
    );
  },
);

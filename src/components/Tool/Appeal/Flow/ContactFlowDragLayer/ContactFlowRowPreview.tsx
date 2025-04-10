import React, { memo } from 'react';
import Star from '@mui/icons-material/Star';
import StarBorder from '@mui/icons-material/StarBorder';
import { Avatar, Box, Typography } from '@mui/material';
import {
  ContactFlowRowPreviewProps,
  DetailsBox,
  PreviewBox,
  PreviewInnerBox,
} from 'src/components/Contacts/ContactFlow/ContactFlowDragLayer/ContactFlowRowPreview';
import { StatusEnum } from 'src/graphql/types.generated';
import { useLocalizedConstants } from 'src/hooks/useLocalizedConstants';
import theme from 'src/theme';

interface Props extends Omit<ContactFlowRowPreviewProps, 'status'> {
  status: StatusEnum;
}

export const ContactFlowRowPreview: React.FC<Props> = memo(
  function ContactFlowRowPreview({ name, status, starred, width }) {
    const { getLocalizedContactStatus } = useLocalizedConstants();
    return (
      <PreviewBox width={width}>
        <PreviewInnerBox>
          <DetailsBox>
            <Avatar
              src=""
              style={{
                width: theme.spacing(4),
                height: theme.spacing(4),
              }}
            />
            <Box display="flex" flexDirection="column" ml={2}>
              <Typography style={{ color: theme.palette.mpdxBlue.main }}>
                {name}
              </Typography>
              <Typography>{getLocalizedContactStatus(status)}</Typography>
            </Box>
          </DetailsBox>
          <Box display="flex" pr={2}>
            {starred ? <Star /> : <StarBorder />}
          </Box>
        </PreviewInnerBox>
      </PreviewBox>
    );
  },
);

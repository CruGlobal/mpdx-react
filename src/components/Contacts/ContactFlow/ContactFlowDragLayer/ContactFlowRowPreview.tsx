import { Avatar, Box, Typography } from '@material-ui/core';
import { Star, StarBorder } from '@material-ui/icons';
import React, { memo } from 'react';
import { StatusEnum } from '../../../../../graphql/types.generated';
import theme from '../../../../../src/theme';

interface Props {
  name: string;
  status: StatusEnum;
  starred: boolean;
  width: number;
}

export const ContactFlowRowPreview: React.FC<Props> = memo(
  function ContactFlowRowPreview({ name, status, starred, width }) {
    return (
      <Box
        display="flex"
        width={width}
        style={{
          background: 'white',
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
          p={2}
        >
          <Box display="flex" alignItems="center" width="100%">
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
              <Typography>{status}</Typography>
            </Box>
          </Box>
          <Box display="flex" pr={2}>
            {starred ? <Star /> : <StarBorder />}
          </Box>
        </Box>
      </Box>
    );
  },
);

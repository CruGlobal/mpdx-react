import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
} from '@material-ui/core';
import { StarOutline, Star } from '@material-ui/icons';
import React from 'react';
import { ContactRowFragment } from '../ContactRow/ContactRow.generated';
import theme from 'src/theme';

interface Props {
  data: ContactRowFragment[];
  title: string;
  color: string;
}

export const ContactFlowColumn: React.FC<Props> = ({
  data,
  title,
  color,
}: Props) => {
  return (
    <Card>
      <CardHeader
        style={{ borderBottom: `3px solid ${color}` }}
        title={
          <Box display="flex" justifyContent="space-between">
            <Typography>{title}</Typography>
            <Typography>{data.length}</Typography>
          </Box>
        }
      />
      <CardContent
        style={{
          height: 'calc(100vh - 260px)',
          padding: 0,
          width: '100%',
          overflow: 'auto',
        }}
      >
        {data.map((contact) => (
          <Box
            key={contact.id}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
            p={2}
            borderBottom={`1px solid ${theme.palette.cruGrayLight.main}`}
          >
            <Box display="flex" alignItems="center">
              <Avatar
                src=""
                style={{ width: theme.spacing(4), height: theme.spacing(4) }}
              />
              <Box display="flex" flexDirection="column" ml={2}>
                <Typography>{contact.name}</Typography>
                <Typography>{contact.status}</Typography>
              </Box>
            </Box>
            {contact.starred ? <Star /> : <StarOutline />}
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};

import { Box, CircularProgress } from '@material-ui/core';
import React from 'react';
import { ContactFlowColumn } from './ContactFlowColumn';
import { useContactsFlowQuery } from './ContactsFlow.generated';
import theme from 'src/theme';

interface Props {
  x?: string;
  accountListId: string;
}

export const ContactFlow: React.FC<Props> = ({ accountListId }: Props) => {
  // Uses its own query because the list view's data depends on the active filters
  const { data, loading } = useContactsFlowQuery({
    variables: {
      accountListId: accountListId ?? '',
    },
    skip: !accountListId,
  });

  return (
    <>
      {loading ? (
        <CircularProgress />
      ) : (
        <Box
          display="grid"
          width="100%"
          gridTemplateColumns="repeat(5, 1fr)"
          gridGap={theme.spacing(1)}
        >
          <Box width="100%" p={2}>
            <ContactFlowColumn
              title="Contact for Appointment"
              color={'red'}
              data={data?.contactForAppointment.nodes || []}
            />
          </Box>
          <Box width="100%" p={2}>
            <ContactFlowColumn
              title="Potential Partners"
              color={theme.palette.progressBarYellow.main}
              data={data?.potentialPartners.nodes || []}
            />
          </Box>
          <Box width="100%" p={2}>
            <ContactFlowColumn
              title="Monthly Partners"
              color={theme.palette.mpdxGreen.main}
              data={data?.monthlyPartners.nodes || []}
            />
          </Box>
          <Box width="100%" p={2}>
            <ContactFlowColumn
              title="Special Partners"
              color={theme.palette.mpdxBlue.main}
              data={data?.specialPartners.nodes || []}
            />
          </Box>
          <Box width="100%" p={2}>
            <ContactFlowColumn
              title="Prayer Partners"
              color={theme.palette.cruGrayDark.main}
              data={data?.prayerPartners.nodes || []}
            />
          </Box>
        </Box>
      )}
    </>
  );
};

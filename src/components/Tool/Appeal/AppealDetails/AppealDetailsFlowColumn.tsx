import React, { ReactElement } from 'react';
import { Grid, Box, Typography } from '@material-ui/core';
import { mdiSquareEditOutline, mdiDelete, mdiDotsVertical } from '@mdi/js';
import Icon from '@mdi/react';
import StarOutlineIcon from '@material-ui/icons/StarOutline';
import theme from '../../../../theme';
import {
  TestContactDonation,
  TestContact,
} from '../../../../../pages/accountLists/[accountListId]/tools/appeals/testAppeal';

interface Props {
  data: TestContactDonation[] | TestContact[];
  borderColor: string;
  type: string;
  title: string;
}

const AppealsDetailFlowColumn = ({
  data,
  borderColor,
  type,
  title,
}: Props): ReactElement => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      position="relative"
      overflow="auto"
      style={{
        border: '1px solid black',
        borderRadius: 10,
        borderColor: theme.palette.cruGrayMedium.main,
        height: '60vh',
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        p={2}
        style={{
          borderBottom: `5px solid ${borderColor}`,
          position: 'sticky',
          width: '100%',
        }}
      >
        <Typography>{title}</Typography>
        <Box display="flex" alignItems="center">
          <Typography>{data.length}</Typography>
          <Icon path={mdiDotsVertical} size={1} />
        </Box>
      </Box>
      {data.map((entry) => (
        <>
          {type === 'default' ? (
            <Box key={entry.name} borderBottom="1px solid gray">
              <Grid container>
                <Grid item xs={2}>
                  <Box
                    p={1}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <StarOutlineIcon />
                  </Box>
                </Grid>
                <Grid item xs={10}>
                  <Box
                    display="flex"
                    flexDirection="column"
                    style={{ padding: '8px 8px 8px 0px' }}
                  >
                    <Typography>{entry.name}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    style={{ padding: '0px 8px 8px 8px' }}
                  >
                    <Typography>
                      {entry.amount.toFixed(2)} {entry.currency}
                    </Typography>
                    <Box display="flex">
                      <Typography>{entry.date}</Typography>
                      <Icon path={mdiSquareEditOutline} size={1} />
                      <Icon path={mdiDelete} size={1} />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          ) : type === 'asked' ? (
            <Box key={entry.name} borderBottom="1px solid gray">
              <Grid container>
                <Grid item xs={2}>
                  <Box
                    p={2}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <StarOutlineIcon />
                  </Box>
                </Grid>
                <Grid item xs={10}>
                  <Box
                    display="flex"
                    flexDirection="column"
                    style={{ padding: '16px 8px 16px 0px' }}
                  >
                    <Typography>{entry.name}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box key={entry.name} borderBottom="1px solid gray">
              <Grid container>
                <Grid item xs={2}>
                  <Box
                    p={2}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <StarOutlineIcon />
                  </Box>
                </Grid>
                <Grid item xs={10}>
                  <Box
                    display="flex"
                    flexDirection="column"
                    style={{ padding: '8px 8px 8px 0px' }}
                  >
                    <Typography>{entry.name}</Typography>
                    {entry.reason.map((reason) => (
                      <Typography variant="body2" key={reason}>
                        - {reason}
                      </Typography>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </>
      ))}
    </Box>
  );
};

export default AppealsDetailFlowColumn;

import { Box } from '@material-ui/core';
import React, { ReactElement } from 'react';

import { TestAppeal } from '../../../../../pages/accountLists/[accountListId]/tools/appeals/testAppeal';
import theme from '../../../../theme';
import AppealDetailsFlowColumn from './AppealDetailsFlowColumn';

interface Props {
  appeal: TestAppeal;
}

//TODO: Move rows mapping to a separate component
//TODO: Make better for responsive
//TODO: Change sidebar to filtering view

const AppealDetailsFlow = ({ appeal }: Props): ReactElement => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      mt={2}
      flexWrap="wrap"
    >
      <Box
        mr={1}
        style={{
          width: '19%',
        }}
      >
        <AppealDetailsFlowColumn
          type="default"
          title="Given"
          data={appeal.given}
          borderColor={theme.palette.progressBarYellow.main}
        />
      </Box>
      <Box
        mr={1}
        ml={1}
        style={{
          width: '19%',
        }}
      >
        <AppealDetailsFlowColumn
          type="default"
          title="Received"
          data={appeal.received}
          borderColor={theme.palette.progressBarOrange.main}
        />
      </Box>
      <Box
        mr={1}
        ml={1}
        style={{
          width: '19%',
        }}
      >
        <AppealDetailsFlowColumn
          type="default"
          title="Committed"
          data={appeal.committed}
          borderColor={theme.palette.progressBarGray.main}
        />
      </Box>
      <Box
        mr={1}
        ml={1}
        style={{
          width: '19%',
        }}
      >
        <AppealDetailsFlowColumn
          type="asked"
          title="Asked"
          data={appeal.asked}
          borderColor={theme.palette.cruGrayDark.main}
        />
      </Box>
      <Box
        ml={1}
        style={{
          width: '19%',
        }}
      >
        <AppealDetailsFlowColumn
          type="excluded"
          title="Excluded"
          data={appeal.excluded}
          borderColor={'red'}
        />
      </Box>
    </Box>
  );
};

export default AppealDetailsFlow;

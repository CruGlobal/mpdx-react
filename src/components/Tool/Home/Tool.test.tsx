import React from 'react';
import { mdiAlert } from '@mdi/js';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '../../../../__tests__/util/TestRouter';
import theme from '../../../theme';
import Tool from './Tool';

const accountListId = 'account-list-1';

const router = {
  query: { accountListId },
  isReady: true,
};

describe('Tool', () => {
  it('props', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <Tool
            tool={'Test'}
            desc={'Test description!!!'}
            icon={mdiAlert}
            id={'test'}
          />
          ,
        </TestRouter>
      </ThemeProvider>,
    );
    expect(getByText('Test')).toBeInTheDocument();
    expect(getByText('Test description!!!')).toBeInTheDocument();
  });
});

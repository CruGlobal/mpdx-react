import React from 'react';
import { render } from '@testing-library/react';
import { mdiAlert } from '@mdi/js';
import { ThemeProvider } from '@material-ui/core';
import theme from '../../../../src/theme';
import TestRouter from '../../../../__tests__/util/TestRouter';
import Tool from './Tool';

const accountListId = 'account-list-1';

const router = {
  query: { accountListId },
  isReady: true,
};

describe('Tool', () => {
  it('props', () => {
    const { getByTestId } = render(
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
    expect(getByTestId('ToolNameTypography').textContent).toEqual('Test');
    expect(getByTestId('ToolDescriptionTypography').textContent).toEqual(
      'Test description!!!',
    );
  });
});

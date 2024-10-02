import React from 'react';
import { mdiAlert } from '@mdi/js';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import theme from '../../../theme';
import Tool from './Tool';

const accountListId = 'account-list-1';

const router = {
  query: { accountListId },
  isReady: true,
};

const TestComponent = ({
  needsAttention = true,
  totalCount = 8,
}: {
  needsAttention?: boolean;
  totalCount?: number;
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <Tool
        tool={'Test'}
        desc={'Test description!!!'}
        icon={mdiAlert}
        url={'test'}
        needsAttention={needsAttention}
        totalCount={totalCount}
        loading={false}
        toolId={'fixCommitmentInfo'}
      />
    </TestRouter>
  </ThemeProvider>
);

describe('Tool', () => {
  it('default', () => {
    const { getByText } = render(<TestComponent />);
    expect(getByText('Test')).toBeInTheDocument();
    expect(getByText('Test description!!!')).toBeInTheDocument();
  });

  it('renders count less then 9', () => {
    const { queryByText, getByTestId } = render(<TestComponent />);
    expect(queryByText('8')).toBeInTheDocument();
    expect(getByTestId('fixCommitmentInfo-icon')).toBeInTheDocument();
    expect(getByTestId('fixCommitmentInfo-icon')).toHaveStyle(
      'background-color: rgb(249, 182, 37)',
    );
    expect(getByTestId('fixCommitmentInfo-container')).toHaveStyle(
      'border-color: #9c9fa1',
    );
  });

  it('renders count with 0', () => {
    const { queryByText, getByTestId } = render(
      <TestComponent needsAttention={false} totalCount={0} />,
    );
    expect(queryByText('0')).not.toBeInTheDocument();
    expect(getByTestId('fixCommitmentInfo-icon')).toBeInTheDocument();
    expect(getByTestId('fixCommitmentInfo-icon')).not.toHaveStyle(
      'background-color: rgb(249, 182, 37)',
    );
  });

  it('renders count with over 99', () => {
    const { queryByText, getByTestId } = render(
      <TestComponent totalCount={100} />,
    );
    expect(queryByText('99+')).toBeInTheDocument();
    expect(getByTestId('fixCommitmentInfo-icon')).toBeInTheDocument();
    expect(getByTestId('fixCommitmentInfo-icon')).toHaveStyle(
      'background-color: rgb(249, 182, 37)',
    );
    expect(getByTestId('fixCommitmentInfo-container')).toHaveStyle(
      'border-color: #9c9fa1',
    );
  });
});

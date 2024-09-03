import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import TestWrapper from '__tests__/util/TestWrapper';
import { render } from '__tests__/util/testingLibraryReactMock';
import theme from '../../../../theme';
import { Item } from './Item';

const item = {
  url: 'testItem',
  title: 'test title',
  isSelected: false,
  id: 'testItem',
};

const TestComponent = ({ totalCount = 0 }: { totalCount?: number }) => (
  <ThemeProvider theme={theme}>
    <TestWrapper>
      <Item
        url={item.url}
        title={item.title}
        isSelected={item.isSelected}
        loading={false}
        totalCount={totalCount}
        toolId={item.id}
      />
    </TestWrapper>
  </ThemeProvider>
);

describe('ToolItem', () => {
  it('default', () => {
    const { queryByText } = render(<TestComponent />);
    expect(queryByText(item.title)).toBeInTheDocument();
  });

  it('renders count less then 9', () => {
    const { queryByText } = render(<TestComponent totalCount={8} />);
    expect(queryByText(item.title)).toBeInTheDocument();
    expect(queryByText('8')).toBeInTheDocument();
  });

  it('renders count greater then 9', () => {
    const { queryByText } = render(<TestComponent totalCount={10} />);
    expect(queryByText(item.title)).toBeInTheDocument();
    expect(queryByText('9+')).toBeInTheDocument();
  });

  it('renders without Badge', () => {
    const { queryByText, queryByTestId } = render(<TestComponent />);
    expect(queryByText(item.title)).toBeInTheDocument();

    expect(
      queryByTestId('fixCommitmentInfo-notifications'),
    ).not.toBeInTheDocument();
  });
});

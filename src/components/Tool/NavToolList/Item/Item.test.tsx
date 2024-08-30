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

describe('ToolItem', () => {
  it('default', () => {
    const { queryByText } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <Item
            url={item.url}
            title={item.title}
            isSelected={item.isSelected}
            loading={false}
            needsAttention={false}
            totalCount={0}
            toolId={item.id}
          />
        </TestWrapper>
        ,
      </ThemeProvider>,
    );
    expect(queryByText(item.title)).toBeInTheDocument();
  });
});

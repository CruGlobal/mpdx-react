import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { FormCardSkeleton } from './FormCardSkeleton';

const title = 'Test Title';
const colTwoHeader = 'Custom Header';
const colThreeHeader = 'Column 3 Header';

interface TestComponentProps {
  colTwoHeader?: string;
  colThreeHeader?: string;
  hideHeaders?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  colTwoHeader,
  colThreeHeader,
  hideHeaders,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <FormCardSkeleton
        title={title}
        colTwoHeader={colTwoHeader}
        colThreeHeader={colThreeHeader}
        hideHeaders={hideHeaders}
      >
        <div>Test Child</div>
      </FormCardSkeleton>
    </TestRouter>
  </ThemeProvider>
);

describe('FormCardSkeleton', () => {
  it('renders the card with title and children', () => {
    const { getByText, getByRole } = render(<TestComponent />);

    expect(
      getByText(title, { selector: '.MuiCardHeader-title' }),
    ).toBeInTheDocument();
    expect(getByRole('columnheader', { name: 'Category' })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: 'Amount' })).toBeInTheDocument();

    expect(getByText('Test Child')).toBeInTheDocument();
  });

  it('renders custom column headers when provided', () => {
    const { getByText } = render(
      <TestComponent
        colTwoHeader={colTwoHeader}
        colThreeHeader={colThreeHeader}
      />,
    );

    expect(getByText('Custom Header')).toBeInTheDocument();
    expect(getByText('Column 3 Header')).toBeInTheDocument();
  });

  it('hides headers when hideHeaders is true', () => {
    const { queryByText } = render(<TestComponent hideHeaders={true} />);

    expect(queryByText('Category')).not.toBeInTheDocument();
    expect(queryByText('Amount')).not.toBeInTheDocument();
  });
});

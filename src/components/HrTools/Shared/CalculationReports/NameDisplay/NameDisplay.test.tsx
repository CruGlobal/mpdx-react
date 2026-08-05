import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { NameDisplay } from './NameDisplay';

const titleOne = 'Title One';
const titleTwo = 'Title Two';

interface TestComponentProps {
  names: string;
  showContent?: boolean;
  spouseComponent?: React.ReactNode;
}

const TestComponent: React.FC<TestComponentProps> = ({
  names,
  showContent,
  spouseComponent,
}) => {
  return (
    <ThemeProvider theme={theme}>
      <NameDisplay
        names={names}
        showContent={showContent}
        titleOne={titleOne}
        titleTwo={titleTwo}
        amountOne={1000}
        amountTwo={20000}
        spouseComponent={spouseComponent}
      />
    </ThemeProvider>
  );
};

describe('NameDisplay', () => {
  it('renders the names it is given', () => {
    const { getByText } = render(<TestComponent names="Doe, John and Jane" />);

    expect(getByText('Doe, John and Jane')).toBeInTheDocument();
  });

  it('renders content when showContent is true', () => {
    const { getByText } = render(
      <TestComponent names="Doe, John" showContent={true} />,
    );

    expect(getByText('TITLE ONE')).toBeInTheDocument();
    expect(getByText('TITLE TWO')).toBeInTheDocument();
    expect(getByText('$1,000.00')).toBeInTheDocument();
    expect(getByText('$20,000.00')).toBeInTheDocument();
  });

  it('renders spouseComponent when provided', () => {
    const { getByTestId, getByText } = render(
      <TestComponent
        names="Doe, John"
        spouseComponent={<div data-testid="spouse-component">Spouse Info</div>}
      />,
    );

    expect(getByText('Doe, John')).toBeInTheDocument();
    expect(getByTestId('spouse-component')).toBeInTheDocument();
    expect(getByText('Spouse Info')).toBeInTheDocument();
  });
});

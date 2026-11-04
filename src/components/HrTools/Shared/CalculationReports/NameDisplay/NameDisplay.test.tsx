import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { missingValue } from '../../helpers/missingValue';
import { NameDisplay, columnLayout } from './NameDisplay';

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

  it('renders a third column when titleThree is given', () => {
    const { getByText, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <NameDisplay
          names="Doe, John"
          showContent
          titleOne={titleOne}
          titleTwo={titleTwo}
          titleThree="Title Three"
          amountOne={1000}
          amountTwo={20000}
          amountThree={5000}
        />
      </ThemeProvider>,
    );

    expect(getByText('TITLE THREE')).toBeInTheDocument();
    expect(getByTestId('amount-three')).toHaveTextContent('$5,000.00');
  });

  const renderAmounts = (amounts: {
    amountOne?: number | null;
    amountTwo?: number | null;
    amountThree?: number | null;
  }) =>
    render(
      <ThemeProvider theme={theme}>
        <NameDisplay
          names="Doe, John"
          showContent
          titleOne={titleOne}
          titleTwo={titleTwo}
          titleThree="Title Three"
          amountOne={1000}
          amountTwo={20000}
          amountThree={5000}
          {...amounts}
        />
      </ThemeProvider>,
    );

  it.each([
    ['amountOne', 'amount-one'],
    ['amountTwo', 'amount-two'],
    ['amountThree', 'amount-three'],
  ])(
    'shows the missing-value dash, not $0.00, for a null %s',
    (prop, testId) => {
      const { getByTestId } = renderAmounts({ [prop]: null });

      expect(getByTestId(testId)).toHaveTextContent(missingValue);
      expect(getByTestId(testId)).not.toHaveTextContent('$');
    },
  );

  it('still shows $0.00 for a real zero', () => {
    const { getByTestId } = renderAmounts({ amountThree: 0 });

    expect(getByTestId('amount-three')).toHaveTextContent('$0.00');
  });

  it('omits the third column without titleThree', () => {
    const { queryByTestId } = render(
      <TestComponent names="Doe, John" showContent />,
    );

    expect(queryByTestId('amount-three')).not.toBeInTheDocument();
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

describe('columnLayout', () => {
  it('stacks three columns below the md breakpoint and shrinks the amounts', () => {
    expect(columnLayout(3)).toEqual({
      size: { xs: 12, md: 4 },
      amountVariant: 'h5',
    });
  });

  it('keeps two side-by-side columns at full size', () => {
    expect(columnLayout(2)).toEqual({ size: 6, amountVariant: 'h3' });
  });
});

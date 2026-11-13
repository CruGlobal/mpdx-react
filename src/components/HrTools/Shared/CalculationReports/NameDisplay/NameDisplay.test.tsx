import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import {
  desktopWidth,
  getGridColumnsAtWidth,
  getStyleAtWidth,
  phoneWidth,
} from '__tests__/util/styleAtWidth';
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

  it('stacks two columns below the sm breakpoint and keeps full size amounts from sm up', () => {
    expect(columnLayout(2)).toMatchObject({
      size: { xs: 12, sm: 6 },
      amountVariant: 'h3',
    });
  });
});

describe('NameDisplay amounts on different screen widths', () => {
  // The 2 phone widths from the audit, a tablet, and a desktop
  const smallPhoneWidth = 360;
  const tabletWidth = 768;
  const phoneWidths = [smallPhoneWidth, phoneWidth];
  const wideWidths = [tabletWidth, desktopWidth];

  // Each amount sits in its own Grid item, and that item has no role
  const getColumn = (amount: HTMLElement): Element => {
    const column = amount.closest('.MuiGrid-root');
    if (!column) {
      throw new Error(`No Grid column for "${amount.textContent}"`);
    }
    return column;
  };

  const fontSizeInPx = (element: Element, width: number): number => {
    const value = getStyleAtWidth(element, 'font-size', width);
    return value.endsWith('rem') ? parseFloat(value) * 16 : parseFloat(value);
  };

  describe('with two amounts, like the Salary Calculator card', () => {
    const renderTwoAmounts = () => {
      const { getByTestId } = render(
        <TestComponent names="Doe, John and Jane" showContent />,
      );
      return [getByTestId('amount-one'), getByTestId('amount-two')];
    };

    it.each(phoneWidths)('stacks the amounts one per row at %ipx', (width) => {
      renderTwoAmounts().forEach((amount) => {
        expect(getGridColumnsAtWidth(getColumn(amount), width)).toBe(12);
      });
    });

    it.each(wideWidths)('keeps the amounts side by side at %ipx', (width) => {
      renderTwoAmounts().forEach((amount) => {
        expect(getGridColumnsAtWidth(getColumn(amount), width)).toBe(6);
      });
    });

    it.each(phoneWidths)(
      'uses a smaller amount size at %ipx than on a tablet',
      (width) => {
        renderTwoAmounts().forEach((amount) => {
          expect(fontSizeInPx(amount, width)).toBeLessThan(
            fontSizeInPx(amount, tabletWidth),
          );
        });
      },
    );

    it('keeps the same amount size on a tablet and on a desktop', () => {
      renderTwoAmounts().forEach((amount) => {
        expect(fontSizeInPx(amount, tabletWidth)).toBeGreaterThan(0);
        expect(fontSizeInPx(amount, tabletWidth)).toBe(
          fontSizeInPx(amount, desktopWidth),
        );
      });
    });
  });

  describe('with three amounts, like the ASR card', () => {
    const renderThreeAmounts = () => {
      const { getByTestId } = render(
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
      return [
        getByTestId('amount-one'),
        getByTestId('amount-two'),
        getByTestId('amount-three'),
      ];
    };

    it('still stacks the amounts one per row on a phone', () => {
      renderThreeAmounts().forEach((amount) => {
        expect(getGridColumnsAtWidth(getColumn(amount), phoneWidth)).toBe(12);
      });
    });

    it('still shows the amounts in three columns on a desktop', () => {
      renderThreeAmounts().forEach((amount) => {
        expect(getGridColumnsAtWidth(getColumn(amount), desktopWidth)).toBe(4);
      });
    });
  });
});

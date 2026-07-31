import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import {
  ContextType,
  MinisterHousingAllowanceContext,
} from 'src/components/HrTools/MinisterHousingAllowance/Shared/Context/MinisterHousingAllowanceContext';
import theme from 'src/theme';
import { NameDisplay } from './NameDisplay';

const titleOne = 'Title One';
const titleTwo = 'Title Two';

interface TestComponentProps {
  names: string;
  showContent?: boolean;
  contextValue?: Partial<ContextType>;
  spouseComponent?: React.ReactNode;
}

const TestComponent: React.FC<TestComponentProps> = ({
  names,
  showContent,
  contextValue,
  spouseComponent,
}) => {
  return (
    <ThemeProvider theme={theme}>
      <MinisterHousingAllowanceContext.Provider
        value={contextValue as ContextType}
      >
        <NameDisplay
          names={names}
          showContent={showContent}
          titleOne={titleOne}
          titleTwo={titleTwo}
          amountOne={1000}
          amountTwo={20000}
          spouseComponent={spouseComponent}
        />
      </MinisterHousingAllowanceContext.Provider>
    </ThemeProvider>
  );
};

describe('NameDisplay', () => {
  it('renders correctly for a single person', () => {
    const { getByText } = render(
      <TestComponent
        names="Doe, John"
        contextValue={{
          isMarried: false,
          preferredName: 'John',
          spousePreferredName: '',
          spouseHcmData: null,
        }}
      />,
    );

    expect(getByText('Doe, John')).toBeInTheDocument();
  });

  it('renders correctly for a married person', () => {
    const { getByText } = render(
      <TestComponent
        names="Doe, John and Jane"
        contextValue={{
          isMarried: true,
          preferredName: 'John',
          spousePreferredName: 'Jane',
        }}
      />,
    );

    expect(getByText('Doe, John and Jane')).toBeInTheDocument();
  });

  it('renders content when showContent is true', () => {
    const { getByText } = render(
      <TestComponent
        names="Doe, John"
        contextValue={{
          isMarried: false,
          preferredName: 'John',
          spousePreferredName: '',
          spouseHcmData: null,
        }}
        showContent={true}
      />,
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
        contextValue={{
          isMarried: false,
          preferredName: 'John',
          spousePreferredName: '',
          spouseHcmData: null,
        }}
        spouseComponent={<div data-testid="spouse-component">Spouse Info</div>}
      />,
    );

    expect(getByText('Doe, John')).toBeInTheDocument();
    expect(getByTestId('spouse-component')).toBeInTheDocument();
    expect(getByText('Spouse Info')).toBeInTheDocument();
  });
});

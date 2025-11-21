import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import {
  ContextType,
  HcmData,
  useMinisterHousingAllowance,
} from '../Shared/Context/MinisterHousingAllowanceContext';
import { NameDisplay } from './NameDisplay';

// Mock the context hook
jest.mock('../Shared/Context/MinisterHousingAllowanceContext', () => ({
  ...jest.requireActual('../Shared/Context/MinisterHousingAllowanceContext'),
  useMinisterHousingAllowance: jest.fn(),
}));

const mockUseMinisterHousingAllowance =
  useMinisterHousingAllowance as jest.MockedFunction<
    typeof useMinisterHousingAllowance
  >;

interface TestComponentProps {
  contextValue: Partial<ContextType>;
}

const TestComponent: React.FC<TestComponentProps> = ({ contextValue }) => {
  mockUseMinisterHousingAllowance.mockReturnValue(contextValue as ContextType);

  return (
    <ThemeProvider theme={theme}>
      <NameDisplay />
    </ThemeProvider>
  );
};

describe('NameDisplay', () => {
  it('renders correctly for a single person', () => {
    const { getByText } = render(
      <TestComponent
        contextValue={{
          isMarried: false,
          preferredName: 'John',
          spousePreferredName: '',
          userHcmData: {
            staffInfo: {
              personNumber: '000123456',
            },
          } as unknown as HcmData,
          spouseHcmData: null,
        }}
      />,
    );

    expect(getByText('John')).toBeInTheDocument();
    expect(getByText('000123456')).toBeInTheDocument();
  });

  it('renders correctly for a married person', () => {
    const { getByText } = render(
      <TestComponent
        contextValue={{
          isMarried: true,
          preferredName: 'John',
          spousePreferredName: 'Jane',
          userHcmData: {
            staffInfo: {
              personNumber: '000123456',
            },
          } as unknown as HcmData,
          spouseHcmData: {
            staffInfo: {
              personNumber: '100123456',
            },
          } as unknown as HcmData,
        }}
      />,
    );

    expect(getByText('John and Jane')).toBeInTheDocument();
    expect(getByText('000123456 and 100123456')).toBeInTheDocument();
  });
});

import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { ContactInformationSummaryCard } from './ContactInformationSummaryCard';

jest.mock('../Shared/AdditionalSalaryRequestContext', () => {
  const originalModule = jest.requireActual(
    '../Shared/AdditionalSalaryRequestContext',
  );
  return {
    ...originalModule,
    useAdditionalSalaryRequest: jest.fn(),
  };
});

const mockUseAdditionalSalaryRequest =
  useAdditionalSalaryRequest as jest.MockedFunction<
    typeof useAdditionalSalaryRequest
  >;

const defaultMockContextValue = {
  requestData: {
    latestAdditionalSalaryRequest: {
      phoneNumber: '555-123-4567',
      emailAddress: 'test@example.com',
    },
  },
};

interface RenderComponentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contextOverrides?: Record<string, any>;
}

const renderComponent = ({
  contextOverrides = {},
}: RenderComponentProps = {}) => {
  mockUseAdditionalSalaryRequest.mockReturnValue({
    ...defaultMockContextValue,
    ...contextOverrides,
  } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

  return render(
    <ThemeProvider theme={theme}>
      <I18nextProvider i18n={i18n}>
        <ContactInformationSummaryCard />
      </I18nextProvider>
    </ThemeProvider>,
  );
};

describe('ContactInformationSummaryCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders card with title, phone number, and email', () => {
    const { getByText } = renderComponent();

    expect(getByText('Contact Information')).toBeInTheDocument();
    expect(getByText('Phone Number')).toBeInTheDocument();
    expect(getByText('555-123-4567')).toBeInTheDocument();
    expect(getByText('Email')).toBeInTheDocument();
    expect(getByText('test@example.com')).toBeInTheDocument();
  });

  it('renders email row even when email is empty', () => {
    const { getByText } = renderComponent({
      contextOverrides: {
        user: {
          staffInfo: {
            emailAddress: '',
          },
        },
      },
    });

    expect(getByText('Phone Number')).toBeInTheDocument();
    expect(getByText('Email')).toBeInTheDocument();
  });

  it('handles missing request data gracefully', () => {
    const { getByText } = renderComponent({
      contextOverrides: {
        requestData: undefined,
      },
    });

    expect(getByText('Contact Information')).toBeInTheDocument();
    expect(getByText('Phone Number')).toBeInTheDocument();
  });
});

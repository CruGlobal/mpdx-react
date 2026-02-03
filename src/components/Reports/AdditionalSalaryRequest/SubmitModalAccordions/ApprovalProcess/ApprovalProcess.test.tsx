import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Formik } from 'formik';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import { useAdditionalSalaryRequest } from '../../Shared/AdditionalSalaryRequestContext';
import { ApprovalProcess } from './ApprovalProcess';

jest.mock('../../Shared/AdditionalSalaryRequestContext', () => {
  const originalModule = jest.requireActual(
    '../../Shared/AdditionalSalaryRequestContext',
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

const mockTrackMutation = jest.fn((mutation) => mutation);

const defaultMockContextValue = {
  requestData: {
    additionalSalaryRequest: {
      id: 'test-request-id',
    },
  },
  trackMutation: mockTrackMutation,
};

const onSubmit = jest.fn();

const TestComponent: React.FC<{
  onForm?: boolean;
}> = ({ onForm }) => {
  return (
    <ThemeProvider theme={theme}>
      <I18nextProvider i18n={i18n}>
        <TestRouter>
          <SnackbarProvider>
            <GqlMockedProvider>
              <Formik
                initialValues={{ additionalInfo: '' }}
                onSubmit={onSubmit}
              >
                <ApprovalProcess onForm={onForm} />
              </Formik>
            </GqlMockedProvider>
          </SnackbarProvider>
        </TestRouter>
      </I18nextProvider>
    </ThemeProvider>
  );
};

describe('ApprovalProcess', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAdditionalSalaryRequest.mockReturnValue(
      defaultMockContextValue as unknown as ReturnType<
        typeof useAdditionalSalaryRequest
      >,
    );
  });

  it('renders correctly', () => {
    const { getByText, getByRole } = render(<TestComponent onForm={true} />);

    expect(getByText('Approval Process')).toBeInTheDocument();
    expect(getByText('Approvals needed for this request')).toBeInTheDocument();

    expect(
      getByText(/please explain in detail, what are the specific expenses/i),
    ).toBeInTheDocument();

    expect(getByRole('textbox')).toBeInTheDocument();
  });
});

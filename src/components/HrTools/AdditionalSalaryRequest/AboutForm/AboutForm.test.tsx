import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { HcmQuery } from '../../Shared/HcmData/Hcm.generated';
import { AdditionalSalaryRequestQuery } from '../AdditionalSalaryRequest.generated';
import { AdditionalSalaryRequestProvider } from '../Shared/AdditionalSalaryRequestContext';
import { AboutForm } from './AboutForm';

const mockHandleContinue = jest.fn();

jest.mock('../Shared/AdditionalSalaryRequestContext', () => {
  const originalModule = jest.requireActual(
    '../Shared/AdditionalSalaryRequestContext',
  );
  return {
    ...originalModule,
    useAdditionalSalaryRequest: () => ({
      ...originalModule.useAdditionalSalaryRequest(),
      handleNextStep: mockHandleContinue,
    }),
  };
});

const router = {
  query: { accountListId: 'account-list-1' },
  isReady: true,
};

const hcmMocks = {
  Hcm: {
    hcm: [
      {
        id: '1',
        staffInfo: {
          id: 'staff-1',
          firstName: 'John',
          lastName: 'Doc',
          preferredName: 'Doc, John',
          personNumber: '00123456',
        },
      },
      {
        id: '2',
        staffInfo: {
          id: 'staff-2',
          firstName: 'Jane',
          lastName: 'Doe',
          preferredName: 'Jane',
          personNumber: '00123457',
        },
      },
    ],
  },
};

type AboutFormMocks = {
  Hcm: HcmQuery;
  AdditionalSalaryRequest: AdditionalSalaryRequestQuery;
};

interface TestWrapperProps {
  asrMocks?: Partial<AboutFormMocks>;
  onCall?: jest.Mock;
}

const TestWrapper: React.FC<TestWrapperProps> = ({ asrMocks, onCall }) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <SnackbarProvider>
        <GqlMockedProvider<AboutFormMocks>
          mocks={{ ...hcmMocks, ...asrMocks }}
          onCall={onCall}
        >
          <AdditionalSalaryRequestProvider>
            <AboutForm />
          </AdditionalSalaryRequestProvider>
        </GqlMockedProvider>
      </SnackbarProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('AboutForm', () => {
  it('should render the about form content', () => {
    const { getByText } = render(<TestWrapper />);

    expect(getByText('About this Form')).toBeInTheDocument();
    expect(
      getByText(
        'You can use this form to electronically submit additional salary requests. Please note:',
      ),
    ).toBeInTheDocument();
    expect(getByText(/adequate funds/i)).toBeInTheDocument();
    expect(
      getByText('will not exceed your Remaining Allowable Salary'),
    ).toBeInTheDocument();
  });

  it('should display user information', async () => {
    const { findByText, getByText } = render(<TestWrapper />);

    expect(await findByText('Doc, John')).toBeInTheDocument();
    expect(getByText('Person Number: 00123456')).toBeInTheDocument();
  });

  it('should display financial data when a request exists', async () => {
    const { findByText } = render(<TestWrapper />);

    expect(await findByText(/Primary Account Balance/i)).toBeInTheDocument();
    expect(
      await findByText(/Your Maximum Allowable Salary \(CAP\)/i),
    ).toBeInTheDocument();
  });

  it('should hide financial data when no request has been created yet', async () => {
    const mutationSpy = jest.fn();
    const { findByText, queryByText } = render(
      <TestWrapper
        asrMocks={{
          AdditionalSalaryRequest: { latestAdditionalSalaryRequest: null },
        }}
        onCall={mutationSpy}
      />,
    );

    // The CardHeader name proves the form rendered; absence assertions below
    // document that only the financial portion is hidden when no ASR exists.
    expect(await findByText('Doc, John')).toBeInTheDocument();
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('AdditionalSalaryRequest'),
    );
    expect(queryByText(/Primary Account Balance/i)).not.toBeInTheDocument();
    expect(
      queryByText(/Your Maximum Allowable Salary \(CAP\)/i),
    ).not.toBeInTheDocument();
  });

  it('should link to the Progressive Approvals document', () => {
    const { getByRole } = render(<TestWrapper />);

    expect(
      getByRole('link', { name: 'Progressive Approvals' }),
    ).toHaveAttribute(
      'href',
      'https://drive.google.com/file/d/1Z1WuiIUMrmfrUUV0V-ACCdhyuSd1Cgzg/view?usp=drive_link',
    );
  });

  it('should link to the paper version document', () => {
    const { getByRole } = render(<TestWrapper />);

    expect(getByRole('link', { name: 'paper version' })).toHaveAttribute(
      'href',
      'https://drive.google.com/file/d/17Xe-OTtC8em41PASIWR_ew8mZ9pUYqYF/view?usp=sharing',
    );
  });
});

import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import theme from 'src/theme';
import {
  ContextType,
  MinisterHousingAllowanceContext,
} from '../../Shared/Context/MinisterHousingAllowanceContext';
import { AboutForm } from './AboutForm';

const submit = jest.fn();
const setIsRightPanelOpen = jest.fn();
const boardApprovedAt = '2024-09-15';
const availabilityDate = '2024-10-01';

interface TestComponentProps {
  contextValue?: Partial<ContextType>;
}

const TestComponent: React.FC<TestComponentProps> = ({ contextValue }) => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <GqlMockedProvider>
        <MinisterHousingAllowanceContext.Provider
          value={contextValue as ContextType}
        >
          <Formik initialValues={{}} onSubmit={submit}>
            <AboutForm
              boardApprovedAt={boardApprovedAt}
              availableDate={availabilityDate}
            />
          </Formik>
        </MinisterHousingAllowanceContext.Provider>
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('AboutForm', () => {
  it('renders form and formatted dates', () => {
    const { getByText, getByRole } = render(
      <TestComponent contextValue={{ pageType: PageEnum.New }} />,
    );

    expect(
      getByRole('heading', { name: 'About this Form' }),
    ).toBeInTheDocument();
    expect(
      getByText(
        /a minister's housing allowance request is a form ministers complete/i,
      ),
    ).toBeInTheDocument();
    expect(getByText(/9\/15\/2024/)).toBeInTheDocument();
    expect(getByText(/10\/1\/2024/)).toBeInTheDocument();

    expect(getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });

  it('should open right panel when link is clicked', async () => {
    const { findByText } = render(
      <TestComponent
        contextValue={{
          pageType: PageEnum.New,
          setIsRightPanelOpen,
        }}
      />,
    );

    const link = await findByText(/what expenses can i claim on my mha/i);
    userEvent.click(link);

    expect(setIsRightPanelOpen).toHaveBeenCalledWith(true);
  });
});

import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { MhaRentOrOwnEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { PageEnum } from '../../Shared/CalculationReports/Shared/sharedTypes';
import { UpdateMinistryHousingAllowanceRequestMutation } from '../MinisterHousingAllowance.generated';
import {
  ContextType,
  MinisterHousingAllowanceContext,
  MinisterHousingAllowanceProvider,
} from '../Shared/Context/MinisterHousingAllowanceContext';
import { StepsEnum } from '../Shared/sharedTypes';
import { EditRequestPage } from './EditRequestPage';

const mutationSpy = jest.fn();
const handleNextStep = jest.fn();
const handlePreviousStep = jest.fn();
const updateMutation = jest.fn();
const setHasCalcValues = jest.fn();

const steps = [
  {
    title: '1. About this Form',
    current: true,
    complete: false,
  },
  {
    title: '2. Rent or Own?',
    current: false,
    complete: false,
  },
  {
    title: '3. Edit Your MHA',
    current: false,
    complete: false,
  },
  {
    title: '4. Receipt',
    current: false,
    complete: false,
  },
];

interface TestComponentProps {
  contextValue: Partial<ContextType>;
}

const TestComponentContext: React.FC<TestComponentProps> = ({
  contextValue,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <GqlMockedProvider<{
        UpdateMinistryHousingAllowanceRequest: UpdateMinistryHousingAllowanceRequestMutation;
      }>
        onCall={mutationSpy}
      >
        <MinisterHousingAllowanceContext.Provider
          value={contextValue as ContextType}
        >
          <EditRequestPage />
        </MinisterHousingAllowanceContext.Provider>
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <GqlMockedProvider<{
        UpdateMinistryHousingAllowanceRequest: UpdateMinistryHousingAllowanceRequestMutation;
      }>
        onCall={mutationSpy}
      >
        <MinisterHousingAllowanceProvider type={PageEnum.Edit}>
          <EditRequestPage />
        </MinisterHousingAllowanceProvider>
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('EditRequestPage', () => {
  it('renders steps list', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText(/1. about this form/i)).toBeInTheDocument();
    expect(getByText(/2. rent or own?/i)).toBeInTheDocument();
    expect(getByText(/3. edit your mha/i)).toBeInTheDocument();
    expect(getByText(/4. receipt/i)).toBeInTheDocument();
  });

  it('updates steps when Continue clicked', async () => {
    const { getByRole, getAllByRole, getByText, queryByTestId } = render(
      <TestComponent />,
    );

    expect(getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');
    expect(queryByTestId('ArrowBackIcon')).toBeInTheDocument();

    const continueButton = getByRole('button', { name: 'Continue' });
    await userEvent.click(continueButton);

    await waitFor(() => {
      expect(getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
    });

    screen.logTestingPlaygroundURL();

    await waitFor(() => {
      const editSteps = getAllByRole('listitem');

      const [firstStep, secondStep, thirdStep] = editSteps;

      expect(firstStep).toHaveTextContent('1. About this Form');
      expect(
        within(firstStep).getByTestId('CheckCircleIcon'),
      ).toBeInTheDocument();

      expect(secondStep).toHaveTextContent('2. Rent or Own?');
      expect(within(secondStep).getByTestId('CircleIcon')).toBeInTheDocument();

      expect(thirdStep).toHaveTextContent('3. Edit Your MHA');
      expect(
        within(thirdStep).getByTestId('RadioButtonUncheckedIcon'),
      ).toBeInTheDocument();
    });

    await userEvent.click(getByText('Back'));

    const updatedSteps = getAllByRole('listitem');

    const [updatedFirstStep, updatedSecondStep] = updatedSteps;

    expect(updatedFirstStep).toHaveTextContent('1. About this Form');
    expect(
      within(updatedFirstStep).getByTestId('CircleIcon'),
    ).toBeInTheDocument();

    expect(updatedSecondStep).toHaveTextContent('2. Rent or Own?');
    expect(
      within(updatedSecondStep).getByTestId('RadioButtonUncheckedIcon'),
    ).toBeInTheDocument();

    expect(getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');
  });

  it('should show an option is preselected', async () => {
    const { findAllByRole, getByRole, findByRole } = render(
      <TestComponentContext
        contextValue={
          {
            pageType: PageEnum.Edit,
            currentStep: StepsEnum.RentOrOwn,
            steps,
            handleNextStep,
            handlePreviousStep,
            requestData: {
              id: 'request-id',
              requestAttributes: {
                rentOrOwn: MhaRentOrOwnEnum.Rent,
              },
            },
          } as unknown as ContextType
        }
      />,
    );

    const continueButton = getByRole('button', { name: 'Continue' });
    await userEvent.click(continueButton);

    expect(await findByRole('radio', { name: 'Rent' })).toBeChecked();
    expect(await findAllByRole('radio', { checked: true })).toHaveLength(1);
  });

  it('opens confirmation modal when changing selection', async () => {
    const { getByRole, getByText, queryByText } = render(
      <TestComponentContext
        contextValue={
          {
            pageType: PageEnum.Edit,
            steps,
            currentStep: StepsEnum.RentOrOwn,
            handleNextStep,
            handlePreviousStep,
            hasCalcValues: true,
            setHasCalcValues,
            updateMutation,
            requestData: {
              id: 'request-id',
              requestAttributes: {
                rentOrOwn: MhaRentOrOwnEnum.Rent,
                rentalValue: 1000,
              },
            },
          } as unknown as ContextType
        }
      />,
    );

    const ownRadio = getByRole('radio', { name: 'Own' });
    await userEvent.click(ownRadio);
    expect(ownRadio).not.toBeChecked();

    expect(
      getByText('Are you sure you want to change selection?'),
    ).toBeInTheDocument();

    await userEvent.click(getByRole('button', { name: 'Yes, Continue' }));

    await waitFor(() =>
      expect(
        queryByText('Are you sure you want to change selection?'),
      ).not.toBeInTheDocument(),
    );

    expect(ownRadio).toBeChecked();
  });
});

import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { PageEnum } from '../../Shared/CalculationReports/Shared/sharedTypes';
import { UpdateMinistryHousingAllowanceRequestMutation } from '../MinisterHousingAllowance.generated';
import {
  ContextType,
  MinisterHousingAllowanceContext,
  MinisterHousingAllowanceProvider,
} from '../Shared/Context/MinisterHousingAllowanceContext';
import { StepsEnum } from '../Shared/sharedTypes';
import { NewRequestPage } from './NewRequestPage';

const mutationSpy = jest.fn();
const handleNextStep = jest.fn();
const handlePreviousStep = jest.fn();
const updateMutation = jest.fn();
const setHasCalcValues = jest.fn();
const setIsPrint = jest.fn();

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
    title: '3. Calculate Your MHA',
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
          <NewRequestPage />
        </MinisterHousingAllowanceContext.Provider>
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <GqlMockedProvider>
        <MinisterHousingAllowanceProvider type={PageEnum.New}>
          <NewRequestPage />
        </MinisterHousingAllowanceProvider>
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('NewRequestPage', () => {
  it('renders steps list', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText(/1. about this form/i)).toBeInTheDocument();
    expect(getByText(/2. rent or own?/i)).toBeInTheDocument();
    expect(getByText(/3. calculate your mha/i)).toBeInTheDocument();
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

    const steps = getAllByRole('listitem');

    const [firstStep, secondStep, thirdStep] = steps;

    expect(firstStep).toHaveTextContent('1. About this Form');
    expect(
      within(firstStep).getByTestId('CheckCircleIcon'),
    ).toBeInTheDocument();

    expect(secondStep).toHaveTextContent('2. Rent or Own?');
    expect(within(secondStep).getByTestId('CircleIcon')).toBeInTheDocument();

    expect(thirdStep).toHaveTextContent('3. Calculate Your MHA');
    expect(
      within(thirdStep).getByTestId('RadioButtonUncheckedIcon'),
    ).toBeInTheDocument();

    expect(getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');

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

  it('should show validation error if continue is clicked without selecting an option', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    const continueButton = getByRole('button', { name: 'Continue' });
    await userEvent.click(continueButton);

    expect(getByRole('radio', { name: 'Rent' })).not.toBeChecked();
    expect(getByRole('radio', { name: 'Own' })).not.toBeChecked();

    userEvent.click(getByRole('button', { name: /continue/i }));

    const alert = await findByRole('alert');
    expect(alert).toBeInTheDocument();

    expect(alert).toHaveTextContent('Your form is missing information.');
  });

  it('opens confirmation modal when changing selection after calculation values inputted', async () => {
    const { getByRole, getByText, queryByText, findByRole, findAllByRole } =
      render(
        <TestComponentContext
          contextValue={
            {
              pageType: PageEnum.New,
              steps,
              currentStep: StepsEnum.RentOrOwn,
              handleNextStep,
              handlePreviousStep,
              hasCalcValues: true,
              setHasCalcValues,
              updateMutation,
              setIsPrint,
              requestData: {
                id: 'request-id',
                requestAttributes: {
                  rentOrOwn: null,
                  rentalValue: 1000,
                },
              },
            } as unknown as ContextType
          }
        />,
      );

    expect(await findAllByRole('radio', { checked: false })).toHaveLength(2);

    const rentRadio = await findByRole('radio', { name: 'Rent' });
    await userEvent.click(rentRadio);

    expect(await findAllByRole('radio', { checked: false })).toHaveLength(1);
    expect(rentRadio).toBeChecked();

    expect(
      queryByText('Are you sure you want to change selection?'),
    ).not.toBeInTheDocument();

    userEvent.click(getByRole('radio', { name: 'Own' }));

    expect(
      getByText('Are you sure you want to change selection?'),
    ).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: /continue/i }));

    expect(getByRole('radio', { name: 'Own' })).toBeChecked();

    userEvent.click(getByRole('radio', { name: 'Rent' }));
    userEvent.click(getByRole('button', { name: /go back/i }));

    expect(getByRole('radio', { name: 'Own' })).toBeChecked();
  });
});

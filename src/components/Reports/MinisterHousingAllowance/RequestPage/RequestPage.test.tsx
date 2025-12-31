import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor, within } from '@testing-library/react';
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
import { RequestPage } from './RequestPage';

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
  type?: PageEnum;
  contextValue?: Partial<ContextType>;
}

const TestComponent: React.FC<TestComponentProps> = ({
  type,
  contextValue,
}) => {
  const content = contextValue ? (
    <MinisterHousingAllowanceContext.Provider
      value={contextValue as ContextType}
    >
      <RequestPage />
    </MinisterHousingAllowanceContext.Provider>
  ) : (
    <MinisterHousingAllowanceProvider type={type}>
      <RequestPage />
    </MinisterHousingAllowanceProvider>
  );

  return (
    <ThemeProvider theme={theme}>
      <TestRouter>
        <GqlMockedProvider<{
          UpdateMinistryHousingAllowanceRequest: UpdateMinistryHousingAllowanceRequestMutation;
        }>
          onCall={mutationSpy}
        >
          {content}
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>
  );
};

describe('RequestPage', () => {
  it('renders steps list', () => {
    const { getByText } = render(<TestComponent type={PageEnum.Edit} />);

    expect(getByText(/1. about this form/i)).toBeInTheDocument();
    expect(getByText(/2. rent or own?/i)).toBeInTheDocument();
    expect(getByText(/3. edit your mha/i)).toBeInTheDocument();
    expect(getByText(/4. receipt/i)).toBeInTheDocument();
  });

  describe('Edit Page', () => {
    it('starts on step 2 and updates steps when Continue clicked', () => {
      const { getByRole, getAllByRole, getByText, queryByTestId } = render(
        <TestComponent type={PageEnum.Edit} />,
      );

      expect(getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
      expect(queryByTestId('ArrowBackIcon')).toBeInTheDocument();

      const continueButton = getByRole('button', { name: 'Continue' });
      userEvent.click(continueButton);

      const steps = getAllByRole('listitem');

      const [firstStep, secondStep, thirdStep] = steps;

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

      userEvent.click(getByText('Back'));

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
        <TestComponent
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
      userEvent.click(continueButton);

      expect(await findByRole('radio', { name: 'Rent' })).toBeChecked();
      expect(await findAllByRole('radio', { checked: true })).toHaveLength(1);
    });

    it('opens confirmation modal when changing selection', async () => {
      const { getByRole, getByText, queryByText } = render(
        <TestComponent
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
      userEvent.click(ownRadio);
      expect(ownRadio).not.toBeChecked();

      expect(
        getByText('Are you sure you want to change selection?'),
      ).toBeInTheDocument();

      userEvent.click(getByRole('button', { name: 'Yes, Continue' }));

      await waitFor(() =>
        expect(
          queryByText('Are you sure you want to change selection?'),
        ).not.toBeInTheDocument(),
      );

      expect(ownRadio).toBeChecked();
    });
  });

  describe('New Page', () => {
    it('updates steps when Continue clicked', async () => {
      const { getByRole, getAllByRole, getByText, queryByTestId } = render(
        <TestComponent type={PageEnum.New} />,
      );

      expect(getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');
      expect(queryByTestId('ArrowBackIcon')).toBeInTheDocument();

      const continueButton = getByRole('button', { name: 'Continue' });
      userEvent.click(continueButton);

      await waitFor(() => {
        expect(getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
      });

      await waitFor(() => {
        const newSteps = getAllByRole('listitem');

        const [firstStep, secondStep, thirdStep] = newSteps;

        expect(firstStep).toHaveTextContent('1. About this Form');
        expect(
          within(firstStep).getByTestId('CheckCircleIcon'),
        ).toBeInTheDocument();

        expect(secondStep).toHaveTextContent('2. Rent or Own?');
        expect(
          within(secondStep).getByTestId('CircleIcon'),
        ).toBeInTheDocument();

        expect(thirdStep).toHaveTextContent('3. Calculate Your MHA');
        expect(
          within(thirdStep).getByTestId('RadioButtonUncheckedIcon'),
        ).toBeInTheDocument();
      });

      userEvent.click(getByText('Back'));

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
      const { getByRole, findByRole } = render(
        <TestComponent
          contextValue={{
            steps,
            currentStep: StepsEnum.RentOrOwn,
            pageType: PageEnum.New,
          }}
        />,
      );

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
          <TestComponent
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
      userEvent.click(rentRadio);

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

  describe('View Page', () => {
    it('renders empty panel layout,', () => {
      const { getByText, queryByRole, getByTestId } = render(
        <TestComponent
          contextValue={{
            pageType: PageEnum.View,
            setHasCalcValues,
            setIsPrint,
          }}
        />,
      );

      expect(getByText('Your MHA')).toBeInTheDocument();
      expect(queryByRole('progressbar')).not.toBeInTheDocument();
      expect(getByTestId('ArrowBackIcon')).toBeInTheDocument();
    });

    it('should have disabled text fields', () => {
      const { getByRole } = render(
        <TestComponent
          contextValue={{
            pageType: PageEnum.View,
            setHasCalcValues,
            setIsPrint,
          }}
        />,
      );

      const row = getByRole('row', {
        name: /estimated monthly cost of repairs/i,
      });
      const input = within(row).getByRole('textbox');

      expect(input).toBeDisabled();
    });
  });
});

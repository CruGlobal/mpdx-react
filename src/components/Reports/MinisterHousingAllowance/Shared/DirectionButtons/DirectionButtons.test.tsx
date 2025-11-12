import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import {
  MinisterHousingAllowanceProvider,
  useMinisterHousingAllowance,
} from '../Context/MinisterHousingAllowanceContext';
import { PageEnum } from '../sharedTypes';
import { DirectionButtons } from './DirectionButtons';

const submit = jest.fn();
const pushMock = jest.fn();
const handleNextStep = jest.fn();
const handlePreviousStep = jest.fn();
const handleEditNextStep = jest.fn();
const handleEditPreviousStep = jest.fn();
interface TestComponentProps {
  isCalculate?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({ isCalculate }) => (
  <ThemeProvider theme={theme}>
    <TestRouter
      router={{
        query: { accountListId: 'account-list-1' },
      }}
    >
      <Formik initialValues={{}} onSubmit={submit}>
        <MinisterHousingAllowanceProvider>
          <DirectionButtons isCalculate={isCalculate} />
        </MinisterHousingAllowanceProvider>
      </Formik>
    </TestRouter>
  </ThemeProvider>
);

jest.mock('../Context/MinisterHousingAllowanceContext', () => ({
  ...jest.requireActual('../Context/MinisterHousingAllowanceContext'),
  useMinisterHousingAllowance: jest.fn(),
}));
const useMock = useMinisterHousingAllowance as jest.Mock;

jest.mock('src/hooks/useAccountListId', () => ({
  useAccountListId: () => 'account-list-1',
}));

jest.mock('next/router', () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe('DirectionButtons', () => {
  beforeEach(() => useMock.mockReset());
  it('renders Back and Submit buttons', () => {
    useMock.mockReturnValue({
      pageType: PageEnum.New,
    });

    const { getByRole } = render(<TestComponent isCalculate={true} />);

    expect(getByRole('button', { name: /back/i })).toBeInTheDocument();
    expect(getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  describe('New Request', () => {
    beforeEach(() => {
      useMock.mockReturnValue({
        handleNextStep,
        handlePreviousStep,
        pageType: PageEnum.New,
      });
    });

    it('calls handleNext when Continue is clicked', async () => {
      const { getByRole } = render(<TestComponent isCalculate={false} />);

      await userEvent.click(getByRole('button', { name: 'CONTINUE' }));

      expect(handleNextStep).toHaveBeenCalled();
    });

    it('calls handlePreviousStep when Back is clicked', async () => {
      const { getByRole } = render(<TestComponent isCalculate={true} />);

      await userEvent.click(getByRole('button', { name: /back/i }));

      expect(handlePreviousStep).toHaveBeenCalled();
    });
  });

  describe('Edit Request', () => {
    beforeEach(() => {
      useMock.mockReturnValue({
        handleEditNextStep,
        handleEditPreviousStep,
        pageType: PageEnum.Edit,
      });
    });

    it('calls handleNext when Continue is clicked', async () => {
      const { getByRole } = render(<TestComponent isCalculate={false} />);

      await userEvent.click(getByRole('button', { name: 'CONTINUE' }));

      expect(handleEditNextStep).toHaveBeenCalled();
    });

    it('calls handlePreviousStep when Back is clicked', async () => {
      const { getByRole } = render(<TestComponent isCalculate={true} />);

      await userEvent.click(getByRole('button', { name: /back/i }));

      expect(handleEditPreviousStep).toHaveBeenCalled();
    });
  });
});

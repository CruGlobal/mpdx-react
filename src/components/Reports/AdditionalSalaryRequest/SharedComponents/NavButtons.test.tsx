import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import { AdditionalSalaryRequestProvider } from '../Shared/AdditionalSalaryRequestContext';
import {
  BackButton,
  CancelButton,
  ContinueButton,
  SubmitButton,
} from './NavButtons';

const handlePreviousStep = jest.fn();
const handleCancel = jest.fn();
const handleNextStep = jest.fn();

jest.mock('../Shared/AdditionalSalaryRequestContext', () => {
  const originalModule = jest.requireActual(
    '../Shared/AdditionalSalaryRequestContext',
  );
  return {
    ...originalModule,
    useAdditionalSalaryRequest: () => ({
      ...originalModule.useAdditionalSalaryRequest(),
      handlePreviousStep,
      handleCancel,
      handleNextStep,
    }),
  };
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    <I18nextProvider i18n={i18n}>
      <AdditionalSalaryRequestProvider>
        {children}
      </AdditionalSalaryRequestProvider>
    </I18nextProvider>
  </ThemeProvider>
);

describe('NavButtons', () => {
  describe('SubmitButton', () => {
    it('renders with correct text and tooltip', async () => {
      const mockHandleClick = jest.fn();
      const { getByText, findByText } = render(
        <TestWrapper>
          <SubmitButton handleClick={mockHandleClick} />
        </TestWrapper>,
      );

      const button = getByText('Submit');
      expect(button).toBeInTheDocument();

      userEvent.hover(button);
      expect(
        await findByText('Submit your additional salary request.'),
      ).toBeInTheDocument();
    });

    it('calls handleClick when clicked', () => {
      const mockHandleClick = jest.fn();
      const { getByText } = render(
        <TestWrapper>
          <SubmitButton handleClick={mockHandleClick} />
        </TestWrapper>,
      );

      const button = getByText('Submit');
      userEvent.click(button);
      expect(mockHandleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('BackButton', () => {
    it('renders with correct text and tooltip', async () => {
      const { getByText, findByText } = render(
        <TestWrapper>
          <BackButton />
        </TestWrapper>,
      );

      const button = getByText('Back');
      expect(button).toBeInTheDocument();

      userEvent.hover(button);
      expect(
        await findByText('Return to the previous section.'),
      ).toBeInTheDocument();
    });

    it('calls handleBack from context when clicked', () => {
      const { getByText } = render(
        <TestWrapper>
          <BackButton />
        </TestWrapper>,
      );

      const button = getByText('Back');
      expect(button).toBeInTheDocument();
      userEvent.click(button);
      expect(handlePreviousStep).toHaveBeenCalledTimes(1);
    });
  });

  describe('ContinueButton', () => {
    it('renders with correct text and tooltip', async () => {
      const { getByText, findByText } = render(
        <TestWrapper>
          <ContinueButton />
        </TestWrapper>,
      );

      const button = getByText('Continue');
      expect(button).toBeInTheDocument();
      userEvent.hover(button);
      expect(
        await findByText(
          'Proceed to the next section. Your progress is automatically saved as you go.',
        ),
      ).toBeInTheDocument();
    });

    it('calls handleContinue from context when clicked', () => {
      const { getByText } = render(
        <TestWrapper>
          <ContinueButton />
        </TestWrapper>,
      );

      const button = getByText('Continue');
      userEvent.click(button);
      expect(handleNextStep).toHaveBeenCalledTimes(1);
    });
  });

  describe('CancelButton', () => {
    it('renders with correct text and tooltip', async () => {
      const { getByText, findByText } = render(
        <TestWrapper>
          <CancelButton />
        </TestWrapper>,
      );

      const button = getByText('Cancel');
      expect(button).toBeInTheDocument();

      userEvent.hover(button);
      expect(
        await findByText('Cancel and return to the previous page.'),
      ).toBeInTheDocument();
    });

    it('calls handleCancel from context when clicked', () => {
      const { getByText } = render(
        <TestWrapper>
          <CancelButton />
        </TestWrapper>,
      );

      const button = getByText('Cancel');
      userEvent.click(button);

      expect(handleCancel).toHaveBeenCalledTimes(1);
    });

    it('has error color styling', () => {
      const { getByText } = render(
        <TestWrapper>
          <CancelButton />
        </TestWrapper>,
      );

      const button = getByText('Cancel');
      expect(button).toHaveClass('MuiButton-colorError');
    });
  });
});

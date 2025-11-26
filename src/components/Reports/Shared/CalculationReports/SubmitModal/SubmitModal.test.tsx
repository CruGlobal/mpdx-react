import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { MinisterHousingAllowanceProvider } from '../../../MinisterHousingAllowance/Shared/Context/MinisterHousingAllowanceContext';
import { PageEnum } from '../Shared/sharedTypes';
import { SubmitModal } from './SubmitModal';

const formTitle = 'Main Title';
const title = 'Test Title';
const content = 'Test Content';
const subContent = 'Test Sub Content';
const date = '2024-12-31';

const handleClose = jest.fn();
const handleConfirm = jest.fn();

interface TestComponentProps {
  pageType?: PageEnum;
  overrideTitle?: string;
  overrideContent?: string;
  overrideSubContent?: string;
  isCancel?: boolean;
  actionRequired?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  pageType,
  overrideTitle,
  overrideContent,
  overrideSubContent,
  isCancel,
  actionRequired,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <GqlMockedProvider>
        <MinisterHousingAllowanceProvider type={pageType}>
          <SubmitModal
            formTitle={formTitle}
            handleClose={handleClose}
            handleConfirm={handleConfirm}
            overrideTitle={overrideTitle}
            overrideContent={overrideContent}
            overrideSubContent={overrideSubContent}
            isCancel={isCancel}
            deadlineDate={date}
            actionRequired={actionRequired}
          />
        </MinisterHousingAllowanceProvider>
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('ConfirmationModal', () => {
  it('renders submit confirmation modal correctly', async () => {
    const { getByText, getByRole } = render(
      <TestComponent pageType={PageEnum.New} />,
    );

    expect(
      getByText('Are you ready to submit your Main Title?'),
    ).toBeInTheDocument();
    expect(
      getByText('You are submitting your Main Title for board approval.'),
    ).toBeInTheDocument();

    expect(getByText(/12\/31\/2024/)).toBeInTheDocument();

    await userEvent.click(getByRole('button', { name: /YES, CONTINUE/i }));
    expect(handleConfirm).toHaveBeenCalled();
  });

  it('renders update confirmation modal correctly', async () => {
    const { getByText, getByRole } = render(
      <TestComponent pageType={PageEnum.Edit} actionRequired={true} />,
    );

    expect(
      getByRole('heading', {
        name: 'Are you ready to submit your updated Main Title?',
      }),
    ).toBeInTheDocument();

    expect(
      getByText(/you are submitting changes to your annual/i),
    ).toBeInTheDocument();

    await userEvent.click(getByRole('button', { name: /YES, CONTINUE/i }));
    expect(handleConfirm).toHaveBeenCalled();
  });

  it('calls handleClose when modal is closed', async () => {
    const { getByRole } = render(<TestComponent isCancel={true} />);

    expect(
      getByRole('heading', { name: 'Do you want to cancel?' }),
    ).toBeInTheDocument();

    await userEvent.click(getByRole('button', { name: /NO/i }));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should override title, content, and subcontent when provided', async () => {
    const { getByText } = render(
      <TestComponent
        overrideTitle={title}
        overrideContent={content}
        overrideSubContent={subContent}
      />,
    );

    expect(getByText(title)).toBeInTheDocument();
    expect(getByText(content)).toBeInTheDocument();
    expect(getByText(subContent)).toBeInTheDocument();
  });
});

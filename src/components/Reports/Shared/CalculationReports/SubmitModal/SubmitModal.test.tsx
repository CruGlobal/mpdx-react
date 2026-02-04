import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
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
  isDiscard?: boolean;
  isDiscardEdit?: boolean;
  actionRequired?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  pageType,
  overrideTitle,
  overrideContent,
  overrideSubContent,
  isCancel,
  isDiscard,
  isDiscardEdit,
  actionRequired,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <SnackbarProvider>
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
              isDiscard={isDiscard}
              isDiscardEdit={isDiscardEdit}
              deadlineDate={date}
              actionRequired={actionRequired}
            />
          </MinisterHousingAllowanceProvider>
        </GqlMockedProvider>
      </SnackbarProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('ConfirmationModal', () => {
  it('renders submit confirmation modal correctly', async () => {
    const { getByText, getByRole, findByText } = render(
      <TestComponent pageType={PageEnum.New} />,
    );

    expect(
      await findByText('Are you ready to submit your Main Title?'),
    ).toBeInTheDocument();
    expect(
      getByText('You are submitting your Main Title for board approval.'),
    ).toBeInTheDocument();

    expect(getByText(/12\/31\/2024/)).toBeInTheDocument();

    await userEvent.click(getByRole('button', { name: /YES, CONTINUE/i }));
    expect(handleConfirm).toHaveBeenCalled();
  });

  it('renders update confirmation modal correctly', async () => {
    const { getByText, getByRole, findByRole } = render(
      <TestComponent pageType={PageEnum.Edit} actionRequired={true} />,
    );

    expect(
      await findByRole('heading', {
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
    const { getByRole, findByRole } = render(<TestComponent isCancel={true} />);

    expect(
      await findByRole('heading', {
        name: 'Do you want to cancel your Main Title?',
      }),
    ).toBeInTheDocument();

    await userEvent.click(getByRole('button', { name: /BACK/i }));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should override title, content, and subcontent when provided', async () => {
    const { getByText, findByText } = render(
      <TestComponent
        overrideTitle={title}
        overrideContent={content}
        overrideSubContent={subContent}
      />,
    );

    expect(await findByText(title)).toBeInTheDocument();
    expect(getByText(content)).toBeInTheDocument();
    expect(getByText(subContent)).toBeInTheDocument();
  });

  it('renders discard modal correctly', async () => {
    const { findByRole, getByRole } = render(
      <TestComponent isDiscard={true} />,
    );

    expect(
      await findByRole('heading', {
        name: 'Do you want to discard?',
      }),
    ).toBeInTheDocument();

    await userEvent.click(getByRole('button', { name: /BACK/i }));
    expect(handleClose).toHaveBeenCalled();
  });

  it('renders discard changes modal correctly', async () => {
    const { findByRole, getByRole } = render(
      <TestComponent isDiscardEdit={true} />,
    );

    expect(
      await findByRole('heading', {
        name: 'Do you want to discard these changes?',
      }),
    ).toBeInTheDocument();

    await userEvent.click(getByRole('button', { name: /BACK/i }));
    expect(handleClose).toHaveBeenCalled();
  });
});

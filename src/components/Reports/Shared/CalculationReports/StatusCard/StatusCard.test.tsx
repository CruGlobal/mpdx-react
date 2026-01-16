import { ThemeProvider } from '@emotion/react';
import { SvgIconProps } from '@mui/material/SvgIcon/SvgIcon';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { MinisterHousingAllowanceProvider } from '../../../MinisterHousingAllowance/Shared/Context/MinisterHousingAllowanceContext';
import { StatusCard } from './StatusCard';

const title = 'Test Title';
const subtitle = 'Test Subtitle';
const titleOne = 'View';
const titleTwo = 'Edit';
const linkOne = '/mock-view-link';
const linkTwo = '/mock-edit-link';

const handlePrint = jest.fn();
const handleConfirmCancel = jest.fn();

const MockIcon: React.FC<SvgIconProps> = (props) => (
  <svg data-testid="mock-icon" {...props}>
    Test Icon
  </svg>
);

interface TestComponentProps {
  subtitle?: string;
  isRequest?: boolean;
  hidePrint?: boolean;
  hideActions?: boolean;
  linkOne?: string;
  linkTwo?: string;
}

const TestComponent: React.FC<TestComponentProps> = ({
  subtitle,
  isRequest,
  hidePrint = false,
  hideActions = false,
  linkOne,
  linkTwo,
}) => {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <TestRouter>
          <GqlMockedProvider>
            <MinisterHousingAllowanceProvider>
              <StatusCard
                formType={'MHA Request'}
                title={title}
                subtitle={subtitle}
                icon={MockIcon}
                iconColor="primary"
                linkOneText={titleOne}
                linkTwoText={titleTwo}
                isRequest={isRequest}
                hidePrint={hidePrint}
                hideActions={hideActions}
                linkOne={linkOne}
                linkTwo={linkTwo}
                handlePrint={handlePrint}
                handleConfirmCancel={handleConfirmCancel}
              >
                <div>Test Children</div>
              </StatusCard>
            </MinisterHousingAllowanceProvider>
          </GqlMockedProvider>
        </TestRouter>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

describe('CardSkeleton', () => {
  it('should render card header no subtitle', () => {
    const { getByText, getByTestId, queryByText } = render(<TestComponent />);

    expect(getByTestId('mock-icon')).toBeInTheDocument();
    expect(getByText(title)).toBeInTheDocument();
    expect(queryByText(subtitle)).not.toBeInTheDocument();
    expect(getByTestId('PrintIcon')).toBeInTheDocument();
  });

  it('should render card header with subtitle', () => {
    const { getByText, getByTestId } = render(
      <TestComponent subtitle={subtitle} />,
    );

    expect(getByTestId('mock-icon')).toBeInTheDocument();
    expect(getByText(title)).toBeInTheDocument();
    expect(getByText(subtitle)).toBeInTheDocument();
    expect(getByTestId('PrintIcon')).toBeInTheDocument();
  });

  it('should render children', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText('Test Children')).toBeInTheDocument();
  });

  it('should render action buttons', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText(titleOne)).toBeInTheDocument();
    expect(getByText(titleTwo)).toBeInTheDocument();
  });

  it('should go to correct link when first button is clicked', () => {
    const { getByRole } = render(
      <TestComponent isRequest={true} linkOne={linkOne} />,
    );

    const firstButton = getByRole('link', { name: titleOne });

    expect(firstButton).toHaveAttribute(
      'href',
      expect.stringContaining('/mock-view-link'),
    );
  });

  it('should go to correct link when second button is clicked', () => {
    const { getByRole } = render(
      <TestComponent isRequest={true} linkTwo={linkTwo} />,
    );

    const secondButton = getByRole('link', { name: titleTwo });

    expect(secondButton).toHaveAttribute(
      'href',
      expect.stringContaining('/mock-edit-link'),
    );
  });

  it('closes Cancel modal when clicked', async () => {
    const { getByRole, findByRole, getByText, queryByRole } = render(
      <TestComponent isRequest={true} />,
    );
    const cancelButton = getByRole('button', { name: 'Cancel Request' });

    await userEvent.click(cancelButton);

    expect(await findByRole('dialog')).toBeInTheDocument();
    expect(getByText('Do you want to cancel?')).toBeInTheDocument();

    await userEvent.click(getByRole('button', { name: /yes, cancel/i }));

    expect(queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('hides print icon when hidePrint is true', () => {
    const { queryByTestId } = render(<TestComponent hidePrint={true} />);

    expect(queryByTestId('PrintIcon')).not.toBeInTheDocument();
  });

  it('hides action buttons when hideActions is true', () => {
    const { queryByText } = render(<TestComponent hideActions={true} />);

    expect(queryByText(titleOne)).not.toBeInTheDocument();
    expect(queryByText(titleTwo)).not.toBeInTheDocument();
  });

  it('calls handlePrint when print icon is clicked', async () => {
    const { getByTestId } = render(<TestComponent />);

    const printIcon = getByTestId('PrintIcon');

    await userEvent.click(printIcon);

    expect(handlePrint).toHaveBeenCalled();
  });

  it('calls handleConfirmCancel when confirming cancel', async () => {
    const { getByRole, findByRole, getByText, queryByRole } = render(
      <TestComponent isRequest={true} />,
    );
    const cancelButton = getByRole('button', { name: 'Cancel Request' });

    await userEvent.click(cancelButton);

    expect(await findByRole('dialog')).toBeInTheDocument();
    expect(getByText('Do you want to cancel?')).toBeInTheDocument();

    await userEvent.click(getByRole('button', { name: /yes, cancel/i }));

    expect(handleConfirmCancel).toHaveBeenCalled();

    expect(queryByRole('dialog')).not.toBeInTheDocument();
  });
});

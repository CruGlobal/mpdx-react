import { ThemeProvider } from '@emotion/react';
import { SvgIconProps } from '@mui/material/SvgIcon/SvgIcon';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { MinisterHousingAllowanceProvider } from '../Shared/MinisterHousingAllowanceContext';
import { CardSkeleton } from './CardSkeleton';

const title = 'Test Title';
const titleOne = 'View';
const titleTwo = 'Edit';

const MockIcon: React.FC<SvgIconProps> = (props) => (
  <svg data-testid="mock-icon" {...props}>
    Test Icon
  </svg>
);

interface TestComponentProps {
  isRequest?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({ isRequest }) => {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <TestRouter>
          <MinisterHousingAllowanceProvider>
            <CardSkeleton
              title={title}
              icon={MockIcon}
              iconColor="primary"
              titleOne={titleOne}
              titleTwo={titleTwo}
              isRequest={isRequest}
            >
              <div>Test Children</div>
            </CardSkeleton>
          </MinisterHousingAllowanceProvider>
        </TestRouter>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

describe('CardSkeleton', () => {
  it('should render card header', () => {
    const { getByText, getByTestId } = render(<TestComponent />);

    expect(getByTestId('mock-icon')).toBeInTheDocument();
    expect(getByText(title)).toBeInTheDocument();
    expect(getByTestId('FileDownloadIcon')).toBeInTheDocument();
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

  it('should go to correct link when Edit button is clicked', () => {
    const { getByRole } = render(<TestComponent isRequest={true} />);

    const editButton = getByRole('link', { name: titleTwo });

    expect(editButton).toHaveAttribute(
      'href',
      expect.stringContaining('/reports/housingAllowance/edit'),
    );
  });

  it('closes Cancel modal when clicked', async () => {
    const { getByRole, findByRole, getByText, queryByRole } = render(
      <TestComponent isRequest={true} />,
    );
    const cancelButton = getByRole('button', { name: 'CANCEL REQUEST' });

    await userEvent.click(cancelButton);

    expect(await findByRole('dialog')).toBeInTheDocument();
    expect(getByText('Do you want to cancel?')).toBeInTheDocument();

    await userEvent.click(getByRole('button', { name: /yes, cancel/i }));

    expect(queryByRole('dialog')).not.toBeInTheDocument();
  });
});

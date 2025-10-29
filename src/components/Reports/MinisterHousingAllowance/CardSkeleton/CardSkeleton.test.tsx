import { ThemeProvider } from '@emotion/react';
import { SvgIconProps } from '@mui/material/SvgIcon/SvgIcon';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { CardSkeleton } from './CardSkeleton';

const title = 'Test Title';
const titleOne = 'View';
const titleTwo = 'Edit';

const MockIcon: React.FC<SvgIconProps> = (props) => (
  <svg data-testid="mock-icon" {...props}>
    Test Icon
  </svg>
);

const TestComponent: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <CardSkeleton
          title={title}
          icon={MockIcon}
          iconColor="primary"
          titleOne={titleOne}
          titleTwo={titleTwo}
        >
          <div>Test Children</div>
        </CardSkeleton>
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
});

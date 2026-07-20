import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { SummarySection } from './SummarySection';

const TestComponent: React.FC<
  Partial<React.ComponentProps<typeof SummarySection>>
> = (props) => (
  <ThemeProvider theme={theme}>
    <SummarySection
      title="Personal Information"
      rows={[{ label: 'Tenure', value: '4' }]}
      onEdit={jest.fn()}
      {...props}
    />
  </ThemeProvider>
);

describe('SummarySection', () => {
  it('renders the title and rows', () => {
    const { getByRole } = render(<TestComponent />);
    expect(
      getByRole('heading', { level: 6, name: 'Personal Information' }),
    ).toBeInTheDocument();
    expect(getByRole('rowheader', { name: 'Tenure' })).toBeInTheDocument();
    expect(getByRole('cell', { name: '4' })).toBeInTheDocument();
  });

  it('fires onEdit when the Edit button is clicked', () => {
    const onEdit = jest.fn();
    const { getByRole } = render(<TestComponent onEdit={onEdit} />);
    userEvent.click(getByRole('button', { name: 'Edit Personal Information' }));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('renders a placeholder for a row with no value', () => {
    const { getByRole } = render(
      <TestComponent rows={[{ label: 'Tenure', value: null }]} />,
    );
    expect(getByRole('rowheader', { name: 'Tenure' })).toBeInTheDocument();
    expect(
      getByRole('cell', { name: 'No value provided' }),
    ).toBeInTheDocument();
  });

  it('renders a required empty value in the error color', () => {
    const { getByText } = render(
      <TestComponent
        rows={[{ label: 'Ministry', value: null, required: true }]}
      />,
    );

    expect(getByText('No value provided')).toHaveStyle({
      color: theme.palette.error.main,
    });
  });

  it('renders a non-required empty value in the secondary color', () => {
    const { getByText } = render(
      <TestComponent rows={[{ label: 'Tenure', value: null }]} />,
    );

    expect(getByText('No value provided')).toHaveStyle({
      color: theme.palette.text.secondary,
    });
  });
});

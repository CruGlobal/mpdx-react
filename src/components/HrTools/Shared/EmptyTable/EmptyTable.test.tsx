import { ThemeProvider } from '@emotion/react';
import { HourglassDisabled } from '@mui/icons-material';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { EmptyTable } from './EmptyTable';

const title = 'Test Title';
const subtitle = 'Test Subtitle';

describe('EmptyTable', () => {
  it('should render empty table with message and icon', () => {
    const { getByRole, getByText, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <EmptyTable
          title={title}
          subtitle={subtitle}
          icon={HourglassDisabled}
        />
      </ThemeProvider>,
    );

    expect(getByRole('heading', { name: title })).toBeInTheDocument();
    expect(getByText(subtitle)).toBeInTheDocument();
    expect(getByTestId('HourglassDisabledIcon')).toBeInTheDocument();
  });
});

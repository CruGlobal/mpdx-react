import { ThemeProvider } from '@emotion/react';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { CardSkeleton } from './CardSkeleton';

const title = 'Test Title';
const subtitle = 'Test Subtitle';

describe('CardSkeleton', () => {
  it('should render card title and subtitle', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <CardSkeleton title={title} subtitle={subtitle} />
      </ThemeProvider>,
    );

    expect(getByText(title)).toBeInTheDocument();
    expect(getByText(subtitle)).toBeInTheDocument();
  });
});

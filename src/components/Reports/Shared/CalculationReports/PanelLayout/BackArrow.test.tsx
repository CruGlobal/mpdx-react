import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '__tests__/util/testingLibraryReactMock';
import theme from 'src/theme';
import { BackArrow } from './BackArrow';

const href = '/test-back';
const title = 'Go back';

interface TestComponentProps {
  backTitle?: string;
}

const TestComponent: React.FC<TestComponentProps> = ({ backTitle }) => (
  <ThemeProvider theme={theme}>
    <BackArrow backHref={href} backTitle={backTitle} />
  </ThemeProvider>
);

describe('BackArrow', () => {
  it('renders BackArrow with provided title', () => {
    const { getByRole } = render(<TestComponent backTitle={title} />);

    expect(getByRole('link', { name: title })).toBeInTheDocument();
  });

  it('renders BackArrow with default title when backTitle is not provided', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('link', { name: 'Back to dashboard' }),
    ).toBeInTheDocument();
  });
});

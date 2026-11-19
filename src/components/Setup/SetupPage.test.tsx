import { Button } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { getStyleAtWidth } from '__tests__/util/styleAtWidth';
import theme from 'src/theme';
import { SetupPage } from './SetupPage';

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <SetupPage title="It's time to get started">
      <Button variant="contained">{"Let's Begin"}</Button>
    </SetupPage>
  </ThemeProvider>
);

describe('SetupPage', () => {
  it('renders the title and its children in the card', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('heading', { name: "It's time to get started" }),
    ).toBeInTheDocument();
    expect(getByRole('button', { name: "Let's Begin" })).toBeInTheDocument();
  });

  it('leaves room under the card so its last button can scroll clear of the help button', () => {
    const { container, getByRole } = render(<TestComponent />);

    const page = container.firstElementChild;
    if (!page) {
      throw new Error('The setup page rendered nothing');
    }
    expect(page).toContainElement(getByRole('button', { name: "Let's Begin" }));
    // The help button covers about 76px at the bottom of phones and 176px from 600px up
    const getEndRoom = (width: number) =>
      parseFloat(getStyleAtWidth(page, 'padding-bottom', width)) || 0;
    expect(getEndRoom(360)).toBeGreaterThanOrEqual(76);
    expect(getEndRoom(390)).toBeGreaterThanOrEqual(76);
    expect(getEndRoom(768)).toBeGreaterThanOrEqual(176);
    expect(getEndRoom(1280)).toBeGreaterThanOrEqual(176);
  });
});

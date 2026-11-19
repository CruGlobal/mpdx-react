import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import matchMediaMock from '__tests__/util/matchMediaMock';
import { getStyleAtWidth } from '__tests__/util/styleAtWidth';
import theme from 'src/theme';
import { SidePanelsLayout } from './SidePanelsLayout';

const onLeftClose = jest.fn();

interface TestComponentProps {
  leftOpen?: boolean;
  withClose?: boolean;
  rightOpen?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  leftOpen = true,
  withClose = true,
  rightOpen = false,
}) => (
  <ThemeProvider theme={theme}>
    <SidePanelsLayout
      leftPanel={<div>Filters</div>}
      leftOpen={leftOpen}
      onLeftClose={withClose ? onLeftClose : undefined}
      leftWidth="290px"
      mainContent={<div>Main content</div>}
      rightPanel={<button>Delete Connection</button>}
      rightOpen={rightOpen}
      rightWidth="60%"
    />
  </ThemeProvider>
);

// The help button covers about 76px at the bottom of phones and 176px from 600px up
const getEndRoom = (element: Element, width: number): number =>
  parseFloat(getStyleAtWidth(element, 'padding-bottom', width)) || 0;

describe('SidePanelsLayout', () => {
  describe('on small screens', () => {
    beforeEach(() => {
      matchMediaMock({ width: '390px' });
    });

    it('closes the left panel when the backdrop is clicked', () => {
      const { getByTestId } = render(<TestComponent />);

      const backdrop = getByTestId('SidePanelsLayoutBackdrop');
      expect(backdrop).toBeVisible();
      userEvent.click(backdrop);

      expect(onLeftClose).toHaveBeenCalledTimes(1);
    });

    it('closes the left panel when Escape is pressed', () => {
      render(<TestComponent />);

      userEvent.keyboard('{Escape}');

      expect(onLeftClose).toHaveBeenCalledTimes(1);
    });

    it('hides the backdrop when the left panel is closed', () => {
      const { getByTestId } = render(<TestComponent leftOpen={false} />);

      expect(getByTestId('SidePanelsLayoutBackdrop')).not.toBeVisible();
      userEvent.keyboard('{Escape}');
      expect(onLeftClose).not.toHaveBeenCalled();
    });

    it('hides the backdrop when there is no close callback', () => {
      const { getByTestId } = render(<TestComponent withClose={false} />);

      expect(getByTestId('SidePanelsLayoutBackdrop')).not.toBeVisible();
    });
  });

  describe('on larger screens', () => {
    beforeEach(() => {
      matchMediaMock({ width: '1024px' });
    });

    it('hides the backdrop and ignores Escape', () => {
      const { getByTestId } = render(<TestComponent />);

      expect(getByTestId('SidePanelsLayoutBackdrop')).not.toBeVisible();
      userEvent.keyboard('{Escape}');
      expect(onLeftClose).not.toHaveBeenCalled();
    });
  });

  describe('right panel', () => {
    it('leaves room at the end so its last control can scroll clear of the help button', () => {
      const { getByRole, getByTestId } = render(
        <TestComponent leftOpen={false} rightOpen />,
      );

      const rightPanel = getByTestId('RightPanelWrapper');
      expect(rightPanel).toContainElement(
        getByRole('button', { name: 'Delete Connection' }),
      );
      expect(getEndRoom(rightPanel, 360)).toBeGreaterThanOrEqual(76);
      expect(getEndRoom(rightPanel, 390)).toBeGreaterThanOrEqual(76);
      expect(getEndRoom(rightPanel, 768)).toBeGreaterThanOrEqual(176);
      expect(getEndRoom(rightPanel, 1280)).toBeGreaterThanOrEqual(176);
    });
  });
});

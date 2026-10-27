import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import matchMediaMock from '__tests__/util/matchMediaMock';
import theme from 'src/theme';
import { SidePanelsLayout } from './SidePanelsLayout';

const onLeftClose = jest.fn();

interface TestComponentProps {
  leftOpen?: boolean;
  withClose?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  leftOpen = true,
  withClose = true,
}) => (
  <ThemeProvider theme={theme}>
    <SidePanelsLayout
      leftPanel={<div>Filters</div>}
      leftOpen={leftOpen}
      onLeftClose={withClose ? onLeftClose : undefined}
      leftWidth="290px"
      mainContent={<div>Main content</div>}
    />
  </ThemeProvider>
);

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
});

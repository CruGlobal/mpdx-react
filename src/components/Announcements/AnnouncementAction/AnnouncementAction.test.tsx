import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { ActionStyleEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { ActionFragment } from '../Announcements.generated';
import { AnnouncementAction } from './AnnouncementAction';

const handlePerformAction = jest.fn();
const accountListId = 'accountListId';
const router = {
  query: { accountListId },
  isReady: true,
};
const defaultTextAndIconColor = '#EEEEEE';

interface AnnouncementActionProps {
  actionStyle?: ActionStyleEnum;
  textAndIconColor?: string;
  isBanner?: boolean;
}
const TestComponent: React.FC<AnnouncementActionProps> = ({
  actionStyle = ActionStyleEnum.Link,
  textAndIconColor = defaultTextAndIconColor,
  isBanner = false,
}) => {
  const action: ActionFragment = {
    id: 'action-1',
    style: actionStyle,
    label: 'Contacts',
    args: 'coaching-account',
  };

  return (
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>
        <AnnouncementAction
          action={action}
          textAndIconColor={textAndIconColor}
          handlePerformAction={handlePerformAction}
          isBanner={isBanner}
        />
      </ThemeProvider>
    </TestRouter>
  );
};

describe('AnnouncementAction', () => {
  describe('Icon', () => {
    it('initial', () => {
      const { getByRole } = render(
        <TestComponent actionStyle={ActionStyleEnum.Icon} />,
      );

      const icon = getByRole('button', { name: 'Contacts' });
      expect(icon.childNodes[0]).toHaveClass('material-icons');
      userEvent.click(icon);
      expect(handlePerformAction).toHaveBeenCalled();
    });
  });
  describe('Button', () => {
    it('initial', () => {
      const { getByText } = render(<TestComponent />);

      const button = getByText('Contacts');
      userEvent.click(button);

      expect(handlePerformAction).toHaveBeenCalled();
    });

    describe('Styles', () => {
      // MUI v7's Button applies variant colors through CSS custom properties
      // (`--variant-containedBg`, `--variant-textColor`, etc.) which are then
      // referenced via `background-color: var(...)`. jsdom's getComputedStyle
      // does not resolve `var()` (so `toHaveStyle('background-color', ...)`
      // reads the UA fallback), so we read the custom properties directly —
      // they are the source of the brand colors — plus any `sx`-applied colors.
      const cssVar = (el: Element, name: string) =>
        window.getComputedStyle(el).getPropertyValue(name).trim();

      it('Primary Banner', () => {
        const { getByText } = render(
          <TestComponent isBanner actionStyle={ActionStyleEnum.Primary} />,
        );

        const button = getByText('Contacts');
        expect(cssVar(button, '--variant-containedBg')).toBe('#05699B');
        // Banner overrides the text color via `sx`.
        expect(button).toHaveStyle({ color: defaultTextAndIconColor });
      });
      it('Primary Modal', () => {
        const { getByText } = render(
          <TestComponent actionStyle={ActionStyleEnum.Primary} />,
        );

        const button = getByText('Contacts');
        expect(cssVar(button, '--variant-containedBg')).toBe('#05699B');
        expect(cssVar(button, '--variant-containedColor')).toBe('#fff');
      });

      it('Link Banner', () => {
        const { getByText } = render(<TestComponent isBanner />);

        const button = getByText('Contacts');
        // The text (link) variant has a transparent background — in MUI v7 this
        // is `background-color: var(--variant-textBg)` (unset), which jsdom can't
        // resolve, so we assert the variant class that produces it.
        expect(button).toHaveClass('MuiButton-text');
        // Banner overrides the text color via `sx`.
        expect(button).toHaveStyle({ color: defaultTextAndIconColor });
      });
      it('Link Modal', () => {
        const { getByText } = render(<TestComponent />);

        const button = getByText('Contacts');
        expect(button).toHaveClass('MuiButton-text');
        expect(cssVar(button, '--variant-textColor')).toBe('#05699B');
      });

      it('Warning Banner', () => {
        const { getByText } = render(
          <TestComponent isBanner actionStyle={ActionStyleEnum.Warning} />,
        );

        const button = getByText('Contacts');
        expect(cssVar(button, '--variant-containedBg')).toBe('#ed6c02');
        expect(cssVar(button, '--variant-containedColor')).toBe('#fff');
      });
      it('Warning Modal', () => {
        const { getByText } = render(
          <TestComponent actionStyle={ActionStyleEnum.Warning} />,
        );

        const button = getByText('Contacts');
        expect(cssVar(button, '--variant-containedBg')).toBe('#ed6c02');
        expect(cssVar(button, '--variant-containedColor')).toBe('#fff');
      });
    });
  });
});

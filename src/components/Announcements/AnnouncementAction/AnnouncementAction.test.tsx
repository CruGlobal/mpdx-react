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
      it('Primary Banner', () => {
        const { getByText } = render(
          <TestComponent isBanner actionStyle={ActionStyleEnum.Primary} />,
        );

        const button = getByText('Contacts');
        expect(button).toHaveStyle({
          'background-color': '#05699B',
          color: defaultTextAndIconColor,
        });
      });
      it('Primary Modal', () => {
        const { getByText } = render(
          <TestComponent actionStyle={ActionStyleEnum.Primary} />,
        );

        const button = getByText('Contacts');
        expect(button).toHaveStyle({
          'background-color': '#05699B',
          color: '#FFFFFF',
        });
      });

      it('Link Banner', () => {
        const { getByText } = render(<TestComponent isBanner />);

        const button = getByText('Contacts');
        expect(button).toHaveStyle({
          'background-color': 'transparent',
          color: defaultTextAndIconColor,
        });
      });
      it('Link Modal', () => {
        const { getByText } = render(<TestComponent />);

        const button = getByText('Contacts');
        expect(button).toHaveStyle({
          'background-color': 'transparent',
          color: '#05699B',
        });
      });

      it('Warning Banner', () => {
        const { getByText } = render(
          <TestComponent isBanner actionStyle={ActionStyleEnum.Warning} />,
        );

        const button = getByText('Contacts');
        expect(button).toHaveStyle({
          'background-color': '#D34400',
          color: '#FFFFFF',
        });
      });
      it('Warning Modal', () => {
        const { getByText } = render(
          <TestComponent actionStyle={ActionStyleEnum.Warning} />,
        );

        const button = getByText('Contacts');
        expect(button).toHaveStyle({
          'background-color': '#D34400',
          color: '#FFFFFF',
        });
      });
    });
  });
});

import { render, waitFor } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { UserSetupStageEnum } from 'src/graphql/types.generated';
import { SetupStageQuery } from './Setup.generated';
import { SetupProvider, useSetupContext } from './SetupProvider';

const push = jest.fn();

interface TestComponentProps {
  setup: UserSetupStageEnum | null;
  setupPosition?: string | null;
  pathname?: string;
}

const ContextTestingComponent = () => {
  const { onSetupTour } = useSetupContext();

  return (
    <div data-testid="setting-up">
      {typeof onSetupTour === 'undefined'
        ? 'undefined'
        : onSetupTour.toString()}
    </div>
  );
};

const TestComponent: React.FC<TestComponentProps> = ({
  setup,
  setupPosition = null,
  pathname = '/',
}) => (
  <TestRouter router={{ push, pathname }}>
    <GqlMockedProvider<{ SetupStage: SetupStageQuery }>
      mocks={{
        SetupStage: {
          user: {
            setup,
          },
          userOption: {
            key: 'setup_position',
            value: setupPosition,
          },
        },
      }}
    >
      <SetupProvider>
        <ContextTestingComponent />
        <div>Page content</div>
      </SetupProvider>
    </GqlMockedProvider>
  </TestRouter>
);

describe('SetupProvider', () => {
  it('renders child content', () => {
    const { getByText } = render(
      <TestComponent setup={UserSetupStageEnum.NoAccountLists} />,
    );

    expect(getByText('Page content')).toBeInTheDocument();
  });

  it('redirects if the user needs to connect to create an account list', async () => {
    render(<TestComponent setup={UserSetupStageEnum.NoAccountLists} />);

    await waitFor(() => expect(push).toHaveBeenCalledWith('/setup/connect'));
  });

  it('redirects if the user needs to connect to an organization', async () => {
    render(<TestComponent setup={UserSetupStageEnum.NoOrganizationAccount} />);

    await waitFor(() => expect(push).toHaveBeenCalledWith('/setup/connect'));
  });

  it('redirects if the user needs to choose a default account', async () => {
    render(<TestComponent setup={UserSetupStageEnum.NoDefaultAccountList} />);

    await waitFor(() => expect(push).toHaveBeenCalledWith('/setup/account'));
  });

  it('does not redirect if the user is on the setup start page', async () => {
    render(
      <TestComponent
        setup={UserSetupStageEnum.NoAccountLists}
        pathname="/setup/start"
      />,
    );

    await waitFor(() => expect(push).not.toHaveBeenCalled());
  });

  it('does not redirect if the user does not need to set up their account', async () => {
    render(<TestComponent setup={null} />);

    await waitFor(() => expect(push).not.toHaveBeenCalled());
  });

  describe('onSetupTour context', () => {
    it('is undefined while data is loading', () => {
      const { getByTestId } = render(
        <TestComponent setup={null} setupPosition="" />,
      );

      expect(getByTestId('setting-up')).toHaveTextContent('undefined');
    });

    it('is true when setup is set on a dedicated tour page', async () => {
      const { getByTestId } = render(
        <TestComponent
          setup={UserSetupStageEnum.NoDefaultAccountList}
          setupPosition=""
          pathname="/setup/start"
        />,
      );

      await waitFor(() =>
        expect(getByTestId('setting-up')).toHaveTextContent('true'),
      );
    });

    it('is true when setup_position matches the current page', async () => {
      const { getByTestId } = render(
        <TestComponent
          setup={null}
          setupPosition="preferences.personal"
          pathname="/accountLists/[accountListId]/settings/preferences"
        />,
      );

      await waitFor(() =>
        expect(getByTestId('setting-up')).toHaveTextContent('true'),
      );
    });

    it('is true when setup_position is set on a tour page', async () => {
      const { getByTestId } = render(
        <TestComponent
          setup={null}
          setupPosition="start"
          pathname="/setup/start"
        />,
      );

      await waitFor(() =>
        expect(getByTestId('setting-up')).toHaveTextContent('true'),
      );
    });

    it('is false when not on a tour page', async () => {
      const { getByTestId } = render(
        <TestComponent setup={null} setupPosition="start" />,
      );

      await waitFor(() =>
        expect(getByTestId('setting-up')).toHaveTextContent('false'),
      );
    });

    it('is false when setup_position is not set', async () => {
      const { getByTestId } = render(
        <TestComponent setup={null} setupPosition="" />,
      );

      await waitFor(() =>
        expect(getByTestId('setting-up')).toHaveTextContent('false'),
      );
    });

    it('is false when setup_position does not match the current page', async () => {
      const { getByTestId } = render(
        <TestComponent
          setup={null}
          setupPosition="preferences.personal"
          pathname="/accountLists/[accountListId]/settings/notifications"
        />,
      );

      await waitFor(() =>
        expect(getByTestId('setting-up')).toHaveTextContent('false'),
      );
    });
  });
});

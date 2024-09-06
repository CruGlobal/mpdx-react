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
  const { settingUp } = useSetupContext();

  return (
    <div data-testid="setting-up">
      {typeof settingUp === 'undefined' ? 'undefined' : settingUp.toString()}
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
          userOptions: [
            {
              key: 'setup_position',
              value: setupPosition,
            },
          ],
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
  beforeEach(() => {
    process.env.DISABLE_SETUP_TOUR = undefined;
  });

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

  describe('settingUp context', () => {
    it('is undefined while data is loading', () => {
      const { getByTestId } = render(
        <TestComponent setup={null} setupPosition="" />,
      );

      expect(getByTestId('setting-up')).toHaveTextContent('undefined');
    });

    it('is true when setup is set', async () => {
      const { getByTestId } = render(
        <TestComponent
          setup={UserSetupStageEnum.NoDefaultAccountList}
          setupPosition=""
        />,
      );

      await waitFor(() =>
        expect(getByTestId('setting-up')).toHaveTextContent('true'),
      );
    });

    it('is true when setup_position is set', async () => {
      const { getByTestId } = render(
        <TestComponent setup={null} setupPosition="start" />,
      );

      await waitFor(() =>
        expect(getByTestId('setting-up')).toHaveTextContent('true'),
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

    it('is false when DISABLE_SETUP_TOUR is true', async () => {
      process.env.DISABLE_SETUP_TOUR = 'true';

      const { getByTestId } = render(
        <TestComponent setup={null} setupPosition="start" />,
      );

      await waitFor(() =>
        expect(getByTestId('setting-up')).toHaveTextContent('false'),
      );
    });
  });
});

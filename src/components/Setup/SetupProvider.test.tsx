import { render, waitFor } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { UserSetupStageEnum } from 'src/graphql/types.generated';
import { SetupStageQuery } from './Setup.generated';
import { SetupProvider } from './SetupProvider';

const push = jest.fn();

interface TestComponentProps {
  setup: UserSetupStageEnum | null;
  pathname?: string;
}

const TestComponent: React.FC<TestComponentProps> = ({
  setup,
  pathname = '/',
}) => (
  <TestRouter router={{ push, pathname }}>
    <GqlMockedProvider<{ SetupStage: SetupStageQuery }>
      mocks={{
        SetupStage: {
          user: {
            setup,
          },
        },
      }}
    >
      <SetupProvider>
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
});

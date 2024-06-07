import { render } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { useLocale } from 'src/hooks/useLocale';
import { GetUserQuery } from '../GetUser.generated';
import {
  UserPreferenceProvider,
  useUserPreferenceContext,
} from './UserPreferenceProvider';

const userId = 'userID123';

const Consumer: React.FC = () => {
  const locale = useLocale();
  const { userId } = useUserPreferenceContext();

  return (
    <>
      <p>User ID: {userId}</p>
      <p>Locale: {locale}</p>
    </>
  );
};

describe('UserPreferenceProvider', () => {
  it('always renders children', () => {
    const { getByText } = render(
      <GqlMockedProvider>
        <UserPreferenceProvider>Children</UserPreferenceProvider>
      </GqlMockedProvider>,
    );

    expect(getByText('Children')).toBeInTheDocument();
  });

  it('provides locale', async () => {
    const { getByText, findByText } = render(
      <GqlMockedProvider<{ GetUser: GetUserQuery }>
        mocks={{
          GetUser: {
            user: {
              id: userId,
              preferences: {
                localeDisplay: 'es',
              },
            },
          },
        }}
      >
        <UserPreferenceProvider>
          <Consumer />
        </UserPreferenceProvider>
      </GqlMockedProvider>,
    );

    // Initial default locale
    expect(getByText('Locale: en-US')).toBeInTheDocument();
    expect(getByText(`User ID:`)).toBeInTheDocument();

    // Locale loaded from query
    expect(await findByText('Locale: es')).toBeInTheDocument();

    // Locale loaded from query
    expect(await findByText(`User ID: ${userId}`)).toBeInTheDocument();
  });
});

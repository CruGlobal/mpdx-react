import { useContext } from 'react';
import { render } from '@testing-library/react';
import { AppSettingsContext, AppSettingsProvider } from './AppSettingsProvider';

const TestingComponent = () => {
  const { appName } = useContext(AppSettingsContext);
  return <p data-testid="app-name">{appName}</p>;
};

describe('<AuthProvider />', () => {
  test('provides expected AuthContext obj to child elements', () => {
    const { getByTestId } = render(
      <AppSettingsProvider>
        <TestingComponent />
      </AppSettingsProvider>,
    );
    expect(getByTestId('app-name').textContent).toEqual(process.env.APP_NAME);
  });
});

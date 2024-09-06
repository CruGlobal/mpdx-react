import { render } from '@testing-library/react';
import { TestSetupProvider } from 'src/components/Setup/SetupProvider';
import { LogoLink } from './LogoLink';

describe('LogoLink', () => {
  it('renders a link when not on the setup tour', () => {
    const { getByRole } = render(
      <TestSetupProvider>
        <LogoLink />
      </TestSetupProvider>,
    );
    expect(getByRole('link')).toBeInTheDocument();
  });

  it('does not render a link when on the setup tour', () => {
    const { queryByRole } = render(
      <TestSetupProvider onSetupTour>
        <LogoLink />
      </TestSetupProvider>,
    );
    expect(queryByRole('link')).not.toBeInTheDocument();
  });
});

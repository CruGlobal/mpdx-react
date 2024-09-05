import { render } from '@testing-library/react';
import { useSetupContext } from 'src/components/Setup/SetupProvider';
import { LogoLink } from './LogoLink';

jest.mock('src/components/Setup/SetupProvider');

describe('LogoLink', () => {
  it('renders a link when not on the setup tour', () => {
    (useSetupContext as jest.MockedFn<typeof useSetupContext>).mockReturnValue({
      onSetupTour: false,
    });

    const { getByRole } = render(<LogoLink />);
    expect(getByRole('link')).toBeInTheDocument();
  });

  it('does not render a link when on the setup tour', () => {
    (useSetupContext as jest.MockedFn<typeof useSetupContext>).mockReturnValue({
      onSetupTour: true,
    });

    const { queryByRole } = render(<LogoLink />);
    expect(queryByRole('link')).not.toBeInTheDocument();
  });
});

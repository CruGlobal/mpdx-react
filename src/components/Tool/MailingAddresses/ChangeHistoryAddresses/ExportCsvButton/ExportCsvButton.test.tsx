import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExportCsvButton } from './ExportCsvButton';

const onClick = jest.fn();

describe('ExportCsvButton', () => {
  it('exports when clicked', () => {
    const { getByRole } = render(<ExportCsvButton onClick={onClick} />);

    userEvent.click(getByRole('button', { name: 'Export CSV' }));

    expect(onClick).toHaveBeenCalled();
  });

  it('shows a spinner and is disabled while exporting', () => {
    const { getByRole } = render(
      <ExportCsvButton exporting onClick={onClick} />,
    );

    const button = getByRole('button', { name: 'Exporting...' });
    expect(button).toBeDisabled();
    expect(getByRole('progressbar')).toBeInTheDocument();
  });
});

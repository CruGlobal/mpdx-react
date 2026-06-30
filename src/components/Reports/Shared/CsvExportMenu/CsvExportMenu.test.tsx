import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { CsvExportMenu, CsvExportMenuItem } from './CsvExportMenu';

const TestComponent: React.FC<{
  items: CsvExportMenuItem[];
  disabled?: boolean;
}> = ({ items, disabled }) => (
  <ThemeProvider theme={theme}>
    <CsvExportMenu label="Export CSV" items={items} disabled={disabled} />
  </ThemeProvider>
);

describe('CsvExportMenu', () => {
  it('renders the dropdown button with the given label', () => {
    const { getByRole } = render(<TestComponent items={[]} />);

    expect(getByRole('button', { name: 'Export CSV' })).toBeInTheDocument();
  });

  it('disables the button when the disabled prop is set', () => {
    const { getByRole } = render(<TestComponent items={[]} disabled />);

    expect(getByRole('button', { name: 'Export CSV' })).toBeDisabled();
  });

  it('opens a menu showing each item when clicked', async () => {
    const { getByRole, findByRole } = render(
      <TestComponent
        items={[
          { label: 'Option A', onClick: jest.fn() },
          { label: 'Option B', onClick: jest.fn() },
        ]}
      />,
    );

    userEvent.click(getByRole('button', { name: 'Export CSV' }));

    expect(
      await findByRole('menuitem', { name: 'Option A' }),
    ).toBeInTheDocument();
    expect(
      await findByRole('menuitem', { name: 'Option B' }),
    ).toBeInTheDocument();
  });

  it('calls the item onClick and closes the menu when an item is selected', async () => {
    const onClick = jest.fn();
    const { getByRole, findByRole, queryByRole } = render(
      <TestComponent items={[{ label: 'Option A', onClick }]} />,
    );

    userEvent.click(getByRole('button', { name: 'Export CSV' }));
    userEvent.click(await findByRole('menuitem', { name: 'Option A' }));

    expect(onClick).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(
        queryByRole('menuitem', { name: 'Option A' }),
      ).not.toBeInTheDocument(),
    );
  });

  it('marks an individual item as disabled', async () => {
    const onClick = jest.fn();
    const { getByRole, findByRole } = render(
      <TestComponent
        items={[{ label: 'Option A', disabled: true, onClick }]}
      />,
    );

    userEvent.click(getByRole('button', { name: 'Export CSV' }));

    const item = await findByRole('menuitem', { name: 'Option A' });
    expect(item).toHaveAttribute('aria-disabled', 'true');
    expect(onClick).not.toHaveBeenCalled();
  });
});

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactStatusSelect } from './ContactStatusSelect';

const setSelectedStatus = jest.fn();

describe('ContactStatusSelect', () => {
  it('should render the select', () => {
    const { getByRole } = render(
      <ContactStatusSelect
        value={'ASK_IN_FUTURE'}
        onChange={setSelectedStatus}
      />,
    );
    expect(getByRole('combobox')).toHaveTextContent('Ask in Future');
  });

  it('changes the selected status', async () => {
    const { getByRole, findByRole } = render(
      <ContactStatusSelect
        value={'ASK_IN_FUTURE'}
        onChange={setSelectedStatus}
      />,
    );
    expect(getByRole('combobox')).toHaveTextContent('Ask in Future');
    userEvent.click(getByRole('combobox'));
    userEvent.click(await findByRole('option', { name: 'New Connection' }));
    expect(setSelectedStatus).toHaveBeenCalled();
  });
});

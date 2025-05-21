import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { TagTypeEnum, TagsAutocomplete } from './TagsAutocomplete';
import { TagOptionsQuery } from './TagsAutocomplete.generated';

const accountListId = 'account-list-1';
const onChange = jest.fn();
const mutationSpy = jest.fn();

interface TestComponentProps {
  type?: TagTypeEnum;
  value?: string[];
  allPhaseTags?: Set<string>;
  contactTagList?: string[];
  taskTagList?: string[];
}

const TestComponent: React.FC<TestComponentProps> = ({
  type = TagTypeEnum.Contact,
  value = [],
  allPhaseTags = new Set(),
  contactTagList = ['ct-1', 'ct-2', 'ct-3'],
  taskTagList = ['tt-1', 'tt-2', 'tt-3'],
}) => (
  <GqlMockedProvider<{ TagOptions: TagOptionsQuery }>
    mocks={{
      TagOptions: {
        accountList: {
          contactTagList,
          taskTagList,
        },
      },
    }}
    onCall={mutationSpy}
  >
    <TagsAutocomplete
      accountListId={accountListId}
      type={type}
      value={value}
      onChange={onChange}
      allPhaseTags={allPhaseTags}
    />
  </GqlMockedProvider>
);

describe('TagsAutocomplete', () => {
  it('loads contact tags', async () => {
    const { findByRole, getByRole } = render(
      <TestComponent type={TagTypeEnum.Contact} />,
    );

    userEvent.click(getByRole('combobox', { name: 'Tags' }));
    expect(await findByRole('option', { name: 'ct-1' })).toBeInTheDocument();
    expect(mutationSpy.mock.calls[0][0].operation).toMatchObject({
      operationName: 'TagOptions',
      variables: {
        accountListId,
        contact: true,
      },
    });
  });

  it('loads task tags', async () => {
    const { findByRole, getByRole } = render(
      <TestComponent type={TagTypeEnum.Tag} />,
    );

    userEvent.click(getByRole('combobox', { name: 'Tags' }));
    expect(await findByRole('option', { name: 'tt-1' })).toBeInTheDocument();
    expect(mutationSpy.mock.calls[0][0].operation).toMatchObject({
      operationName: 'TagOptions',
      variables: {
        accountListId,
        contact: false,
      },
    });
  });

  it('adds the highlighted tag when the user tabs away', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('combobox', { name: 'Tags' }));
    userEvent.hover(await findByRole('option', { name: 'ct-1' }));
    userEvent.tab();

    expect(onChange).toHaveBeenCalledWith(['ct-1']);
  });

  it('does not remove the highlighted tag when the user tabs away', async () => {
    const { findByRole, getByRole } = render(
      <TestComponent value={['ct-1']} />,
    );

    userEvent.click(getByRole('combobox', { name: 'Tags' }));
    userEvent.hover(await findByRole('option', { name: 'ct-1' }));
    userEvent.tab();

    expect(onChange).not.toHaveBeenCalled();
  });

  it('should not have any phaseTags in the list', async () => {
    const { queryByRole, getByRole } = render(
      <TestComponent
        value={['ct-1']}
        type={TagTypeEnum.Tag}
        allPhaseTags={new Set(['tt-2', 'tt-3'])}
        contactTagList={[]}
      />,
    );

    userEvent.click(getByRole('combobox', { name: 'Tags' }));
    await waitFor(() => {
      expect(queryByRole('option', { name: 'tt-1' })).toBeInTheDocument();
      expect(queryByRole('option', { name: 'tt-2' })).not.toBeInTheDocument();
      expect(queryByRole('option', { name: 'tt-3' })).not.toBeInTheDocument();
    });
  });

  it('should default to an empty array of options', async () => {
    const { getByRole, queryByRole } = render(
      <TestComponent
        type={TagTypeEnum.Tag}
        value={[]}
        contactTagList={[]}
        taskTagList={[]}
      />,
    );

    userEvent.click(getByRole('combobox', { name: 'Tags' }));
    expect(
      await queryByRole('option', { name: 'tt-1' }),
    ).not.toBeInTheDocument();
    expect(
      await queryByRole('option', { name: 'ct-1' }),
    ).not.toBeInTheDocument();
  });
});

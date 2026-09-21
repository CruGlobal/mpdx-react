import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { GetContactsForAddingTagsQuery } from './ContactsAddTags.generated';
import { MassActionsAddTagsModal } from './MassActionsAddTagsModal';

const mockEnqueue = jest.fn();
jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue,
    };
  },
}));

const selectedIds = ['abc', 'def'];
const accountListId = '123456789';

const duplicateTagError: [string, { variant: string }] = [
  'All selected contacts already have this tag',
  { variant: 'error' },
];

interface TestComponentProps {
  mutationSpy?: jest.Mock;
  handleClose?: () => void;
  contacts: GetContactsForAddingTagsQuery['contacts']['nodes'];
}

const TestComponent: React.FC<TestComponentProps> = ({
  mutationSpy,
  handleClose = jest.fn(),
  contacts,
}) => (
  <ThemeProvider theme={theme}>
    <GqlMockedProvider<{
      GetContactsForAddingTags: GetContactsForAddingTagsQuery;
    }>
      onCall={mutationSpy}
      mocks={{
        GetContactsForAddingTags: { contacts: { nodes: contacts } },
      }}
    >
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <SnackbarProvider>
          <MassActionsAddTagsModal
            accountListId={accountListId}
            ids={selectedIds}
            handleClose={handleClose}
          />
        </SnackbarProvider>
      </LocalizationProvider>
    </GqlMockedProvider>
  </ThemeProvider>
);

describe('MassActionsAddTags', () => {
  it('adds the tag to all of the selected contacts', async () => {
    const mutationSpy = jest.fn();
    const handleClose = jest.fn();

    const { getByRole, getByText } = render(
      <TestComponent
        mutationSpy={mutationSpy}
        handleClose={handleClose}
        contacts={[
          { id: 'abc', tagList: [] },
          { id: 'def', tagList: [] },
        ]}
      />,
    );

    const input = getByRole('combobox') as HTMLInputElement;
    userEvent.type(input, 'tag123');
    expect(input.value).toBe('tag123');
    userEvent.type(input, '{enter}');
    await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
    userEvent.click(getByText('Save'));
    await waitFor(() => expect(handleClose).toHaveBeenCalled());

    expect(mutationSpy).toHaveGraphqlOperation('ContactsAddTags', {
      accountListId,
      attributes: [
        { id: 'abc', tagList: ['tag123'] },
        { id: 'def', tagList: ['tag123'] },
      ],
    });
    expect(mockEnqueue).toHaveBeenCalledWith('Tags added to contacts!', {
      variant: 'success',
    });
  });

  it('removes a tag that every selected contact already has', async () => {
    const mutationSpy = jest.fn();
    const handleClose = jest.fn();

    const { getByRole, getByText } = render(
      <TestComponent
        mutationSpy={mutationSpy}
        handleClose={handleClose}
        contacts={[
          { id: 'abc', tagList: ['tag123'] },
          { id: 'def', tagList: ['tag123'] },
        ]}
      />,
    );

    const input = getByRole('combobox') as HTMLInputElement;
    userEvent.type(input, 'tag123{enter}');
    await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
    userEvent.click(getByText('Save'));

    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(...duplicateTagError),
    );
    await waitFor(() => expect(getByText('Save')).toBeDisabled());
    expect(handleClose).not.toHaveBeenCalled();
    expect(mutationSpy).not.toHaveGraphqlOperation('ContactsAddTags');
  });

  it('keeps a tag that only some of the selected contacts have', async () => {
    const mutationSpy = jest.fn();
    const handleClose = jest.fn();

    const { getByRole, getByText } = render(
      <TestComponent
        mutationSpy={mutationSpy}
        handleClose={handleClose}
        contacts={[
          { id: 'abc', tagList: ['tag123'] },
          { id: 'def', tagList: [] },
        ]}
      />,
    );

    const input = getByRole('combobox') as HTMLInputElement;
    userEvent.type(input, 'tag123{enter}');
    await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
    userEvent.click(getByText('Save'));
    await waitFor(() => expect(handleClose).toHaveBeenCalled());

    expect(mockEnqueue).not.toHaveBeenCalledWith(...duplicateTagError);
    expect(mutationSpy).toHaveGraphqlOperation('ContactsAddTags', {
      accountListId,
      attributes: [
        { id: 'abc', tagList: ['tag123'] },
        { id: 'def', tagList: ['tag123'] },
      ],
    });
  });

  it('keeps a new tag when the selected contacts share other tags', async () => {
    const mutationSpy = jest.fn();
    const handleClose = jest.fn();

    const { getByRole, getByText } = render(
      <TestComponent
        mutationSpy={mutationSpy}
        handleClose={handleClose}
        contacts={[
          { id: 'abc', tagList: ['tag1', 'tag2'] },
          { id: 'def', tagList: ['tag1', 'tag2'] },
        ]}
      />,
    );

    const input = getByRole('combobox') as HTMLInputElement;
    userEvent.type(input, 'tag3{enter}');
    await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
    userEvent.click(getByText('Save'));
    await waitFor(() => expect(handleClose).toHaveBeenCalled());

    expect(mockEnqueue).not.toHaveBeenCalledWith(...duplicateTagError);
    expect(mutationSpy).toHaveGraphqlOperation('ContactsAddTags', {
      accountListId,
      attributes: [
        { id: 'abc', tagList: ['tag3', 'tag1', 'tag2'] },
        { id: 'def', tagList: ['tag3', 'tag1', 'tag2'] },
      ],
    });
  });
});

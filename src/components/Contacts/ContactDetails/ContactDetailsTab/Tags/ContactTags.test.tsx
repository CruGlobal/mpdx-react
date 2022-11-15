import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '../../../../../../__tests__/util/graphqlMocking';
import {
  render,
  waitFor,
} from '../../../../../../__tests__/util/testingLibraryReactMock';
import theme from '../../../../../theme';
import { ContactTags } from './ContactTags';
import { UpdateContactTagsMutation } from './ContactTags.generated';

const accountListId = '123';
const contactId = 'abc';
const contactTags = ['tag1', 'tag2', 'tag3'];

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

describe('ContactTags', () => {
  it('should render with tags', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <GqlMockedProvider<UpdateContactTagsMutation>>
          <ThemeProvider theme={theme}>
            <ContactTags
              accountListId={accountListId}
              contactId={contactId}
              contactTags={contactTags}
            />
          </ThemeProvider>
        </GqlMockedProvider>
      </SnackbarProvider>,
    );
    expect(getByText('tag1')).toBeInTheDocument();
    expect(getByText('tag2')).toBeInTheDocument();
    expect(getByText('tag3')).toBeInTheDocument();
  });

  it('should add a tag', async () => {
    const { getByPlaceholderText } = render(
      <SnackbarProvider>
        <GqlMockedProvider<UpdateContactTagsMutation>
          mocks={{
            UpdateContactTags: {
              updateContact: {
                contact: {
                  id: contactId,
                  tagList: [...contactTags, 'tag4'],
                },
              },
            },
          }}
          addTypename={false}
        >
          <ThemeProvider theme={theme}>
            <ContactTags
              accountListId={accountListId}
              contactId={contactId}
              contactTags={contactTags}
            />
          </ThemeProvider>
        </GqlMockedProvider>
      </SnackbarProvider>,
    );
    userEvent.type(getByPlaceholderText('add tag'), 'tag4{enter}');
    await waitFor(() =>
      expect(getByPlaceholderText('add tag')).toHaveValue(''),
    );
    userEvent.type(getByPlaceholderText('add tag'), '{enter}');

    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Tag successfully added', {
        variant: 'success',
      }),
    );
  });

  it('should delete a tag', async () => {
    const mutationSpy = jest.fn();
    const { getAllByTitle } = render(
      <SnackbarProvider>
        <GqlMockedProvider<UpdateContactTagsMutation>
          mocks={{
            UpdateContactTags: {
              updateContact: {
                contact: {
                  id: contactId,
                  tagList: ['tag2', 'tag3'],
                },
              },
            },
          }}
          onCall={mutationSpy}
          addTypename={false}
        >
          <ThemeProvider theme={theme}>
            <ContactTags
              accountListId={accountListId}
              contactId={contactId}
              contactTags={contactTags}
            />
          </ThemeProvider>
        </GqlMockedProvider>
      </SnackbarProvider>,
    );
    const tag1DeleteIcon = getAllByTitle('Delete Icon')[0].querySelector(
      '.MuiChip-deleteIcon',
    );

    expect(tag1DeleteIcon).toBeInTheDocument();
    tag1DeleteIcon && userEvent.click(tag1DeleteIcon);
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Tag successfully removed', {
        variant: 'success',
      }),
    );
  });
});

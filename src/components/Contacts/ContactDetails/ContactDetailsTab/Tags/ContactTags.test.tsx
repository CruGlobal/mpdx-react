import React from 'react';
import { InMemoryCache } from '@apollo/client';
import { MuiThemeProvider } from '@material-ui/core';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { MockedProvider } from '@apollo/client/testing';
import { GqlMockedProvider } from '../../../../../../__tests__/util/graphqlMocking';
import {
  render,
  waitFor,
} from '../../../../../../__tests__/util/testingLibraryReactMock';
import theme from '../../../../../theme';
import {
  ContactDetailsTabDocument,
  ContactDetailsTabQuery,
} from '../ContactDetailsTab.generated';
import { ContactTags } from './ContactTags';
import { UpdateContactTagsMutation } from './ContactTags.generated';
import { createContactTagMutationMock } from './ContactTags.mock';

const accountListId = '123';
const contactId = 'abc';
const contactTags = ['tag1', 'tag2', 'tag3'];

describe('ContactTags', () => {
  it('should render with tags', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <GqlMockedProvider<UpdateContactTagsMutation>>
          <MuiThemeProvider theme={theme}>
            <ContactTags
              accountListId={accountListId}
              contactId={contactId}
              contactTags={contactTags}
            />
          </MuiThemeProvider>
        </GqlMockedProvider>
      </SnackbarProvider>,
    );
    expect(getByText('tag1')).toBeInTheDocument();
    expect(getByText('tag2')).toBeInTheDocument();
    expect(getByText('tag3')).toBeInTheDocument();
  });

  it('should add a tag', async () => {
    const cache = new InMemoryCache({ addTypename: false });
    jest.spyOn(cache, 'writeQuery');
    const data: ContactDetailsTabQuery = {
      contact: {
        id: contactId,
        tagList: contactTags,
        people: {
          nodes: [],
        },
        name: 'Lname, Fname',
      },
    };
    const query = {
      query: ContactDetailsTabDocument,
      variables: {
        accountListId,
        contactId,
      },
      data,
    };
    cache.writeQuery(query);
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider
          mocks={[createContactTagMutationMock()]}
          cache={cache}
          addTypename={false}
        >
          <MuiThemeProvider theme={theme}>
            <ContactTags
              accountListId={accountListId}
              contactId={contactId}
              contactTags={contactTags}
            />
          </MuiThemeProvider>
        </MockedProvider>
      </SnackbarProvider>,
    );
    userEvent.type(getByRole('textbox', { name: 'Tag' }), 'tag4{enter}');
    await waitFor(() =>
      expect(getByRole('textbox', { name: 'Tag' })).toHaveValue(''),
    );

    // TODO: Figure out why readQuery value is always null
    // await waitFor(() =>
    //   expect(cache.writeQuery).toHaveBeenCalledWith({
    //     query: ContactDetailsTabDocument,
    //     variables: {
    //       accountListId,
    //       contactId,
    //     },
    //     data: {
    //       contact: {
    //         id: contactId,
    //         tagList: [...contactTags, 'tag4'],
    //         people: {
    //           nodes: [],
    //         },
    //         name: 'Lname, Fname',
    //       },
    //     },
    //   }),
    // );
  });

  it('should delete a tag', async () => {
    const mutationSpy = jest.fn();
    const { getAllByRole } = render(
      <SnackbarProvider>
        <GqlMockedProvider<UpdateContactTagsMutation>
          mocks={{
            ContactDetailsTab: {
              contact: {
                id: contactId,
                tagList: contactTags,
                people: {
                  nodes: [],
                },
                name: 'Lname, Fname',
              },
            },
          }}
          onCall={mutationSpy}
          addTypename={false}
        >
          <MuiThemeProvider theme={theme}>
            <ContactTags
              accountListId={accountListId}
              contactId={contactId}
              contactTags={contactTags}
            />
          </MuiThemeProvider>
        </GqlMockedProvider>
      </SnackbarProvider>,
    );
    const tag1DeleteIcon = getAllByRole('button', {
      name: 'Delete Icon',
    })[0].querySelector('.MuiChip-deleteIcon');

    expect(tag1DeleteIcon).toBeInTheDocument();
    tag1DeleteIcon && userEvent.click(tag1DeleteIcon);
  });
});

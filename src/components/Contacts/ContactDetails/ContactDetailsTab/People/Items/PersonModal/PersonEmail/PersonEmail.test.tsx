import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { Formik } from 'formik';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { getPersonSchema } from '../personModalHelper';
import { PersonEmail } from './PersonEmail';

jest.mock('next-auth/react');

const accountListId = 'account-list-1';
const router = {
  query: { accountListId },
  isReady: true,
};

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

const mutationSpy = jest.fn();

const formikProps = {
  values: {
    emailAddresses: [],
    optoutEnewsletter: false,
  },
  setFieldValue: jest.fn(),
  errors: {},
  validateOnChange: false,
};
const personEmailAddressSources = [
  {
    id: '0',
    source: 'MPDX',
  },
  {
    id: '1',
    source: 'MPDX',
  },
];

interface ComponentsProps {
  showOptOutENewsletter?: boolean;
}

const Components: React.FC<ComponentsProps> = ({ showOptOutENewsletter }) => {
  const { personSchema, initialPerson } = getPersonSchema(
    () => '',
    'contact-1',
  );

  return (
    <SnackbarProvider>
      <TestRouter router={router}>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider onCall={mutationSpy}>
            <Formik
              initialValues={initialPerson}
              validationSchema={personSchema}
              onSubmit={() => {}}
            >
              <PersonEmail
                formikProps={formikProps}
                sources={personEmailAddressSources}
                showOptOutENewsletter={showOptOutENewsletter || false}
              />
            </Formik>
          </GqlMockedProvider>
        </ThemeProvider>
      </TestRouter>
    </SnackbarProvider>
  );
};

describe('PersonEmail', () => {
  afterEach(() => {
    mutationSpy.mockClear();
  });

  it('Hides the Opt-out of Email Newsletter checkbox', async () => {
    const { queryByRole } = render(
      <Components showOptOutENewsletter={false} />,
    );

    expect(
      queryByRole('checkbox', { name: 'Opt-out of Email Newsletter' }),
    ).not.toBeInTheDocument();
  });
});

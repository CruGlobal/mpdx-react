import { ApolloError } from '@apollo/client';
import { GraphQLError } from 'graphql';
import { reportGraphQLError, reportNetworkError } from 'src/lib/dataDog';
import { suppressedErrorPatterns } from 'src/lib/error';
import { beforeSendSource, dataDogRumScript } from './_document.page';

interface RumEvent {
  type: string;
  error?: {
    message?: string;
  };
}

interface RumEventContext {
  error?: unknown;
}

const operation = { operationName: 'ContactDetails' };

describe('dataDogRumScript', () => {
  it('is syntactically valid JavaScript', () => {
    // Function parses the script without executing it
    expect(() => new Function(dataDogRumScript)).not.toThrow();
  });
});

describe('beforeSendSource', () => {
  // The RUM SDK receives source text, so evaluate it the way the browser will
  const beforeSend: (event: RumEvent, context?: RumEventContext) => boolean =
    new Function(`return ${beforeSendSource}`)();

  const errorEvent = (message: string): RumEvent => ({
    type: 'error',
    error: { message },
  });

  it.each(suppressedErrorPatterns)(
    'drops errors containing "%s"',
    (pattern) => {
      expect(
        beforeSend(errorEvent(`${pattern}; visit https://react.dev`)),
      ).toBe(false);
    },
  );

  it('keeps other errors', () => {
    expect(
      beforeSend(
        errorEvent("Cannot read properties of undefined (reading 'name')"),
      ),
    ).toBe(true);
  });

  it('keeps non-error events even when they match', () => {
    expect(
      beforeSend({
        type: 'view',
        error: { message: suppressedErrorPatterns[0] },
      }),
    ).toBe(true);
  });

  it('keeps error events with a missing error or message', () => {
    expect(beforeSend({ type: 'error' })).toBe(true);
    expect(beforeSend({ type: 'error', error: {} })).toBe(true);
  });

  it('drops GraphQL errors the error link already reported', () => {
    const graphQLError = new GraphQLError('SAA Error');
    reportGraphQLError(graphQLError, operation);

    expect(
      beforeSend(errorEvent('SAA Error'), {
        error: new ApolloError({ graphQLErrors: [graphQLError] }),
      }),
    ).toBe(false);
  });

  it('drops network errors the error link already reported', () => {
    const networkError = new Error('Failed to fetch');
    reportNetworkError(networkError, operation);

    expect(
      beforeSend(errorEvent('Failed to fetch'), {
        error: new ApolloError({ networkError }),
      }),
    ).toBe(false);
  });

  it('keeps GraphQL errors the error link did not report', () => {
    expect(
      beforeSend(errorEvent('Boom'), {
        error: new ApolloError({ graphQLErrors: [new GraphQLError('Boom')] }),
      }),
    ).toBe(true);
  });

  it('keeps unreported errors and errors without a context', () => {
    expect(
      beforeSend(errorEvent('Boom'), { error: new TypeError('Boom') }),
    ).toBe(true);
    expect(beforeSend(errorEvent('Boom'), {})).toBe(true);
    expect(beforeSend(errorEvent('Boom'))).toBe(true);
  });

  it('keeps errors whose graphQLErrors is not an array', () => {
    expect(
      beforeSend(errorEvent('Boom'), { error: { graphQLErrors: 'Boom' } }),
    ).toBe(true);
  });
});

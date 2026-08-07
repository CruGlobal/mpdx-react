import { suppressedErrorPatterns } from 'src/lib/error';
import { beforeSendSource, dataDogRumScript } from './_document.page';

interface RumEvent {
  type: string;
  error?: {
    message?: string;
  };
}

interface RumEventContext {
  error?: {
    name?: string;
  };
}

const apolloContext: RumEventContext = { error: { name: 'ApolloError' } };

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

  it('drops Apollo errors, which the error link already reported', () => {
    expect(beforeSend(errorEvent('SAA Error'), apolloContext)).toBe(false);
  });

  it('keeps non-Apollo errors and errors without a context', () => {
    expect(
      beforeSend(errorEvent('Boom'), { error: { name: 'TypeError' } }),
    ).toBe(true);
    expect(beforeSend(errorEvent('Boom'), {})).toBe(true);
    expect(beforeSend(errorEvent('Boom'))).toBe(true);
  });
});

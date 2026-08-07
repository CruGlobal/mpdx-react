import { suppressedErrorPatterns } from 'src/lib/error';
import { beforeSendSource, dataDogRumScript } from './_document.page';

interface RumEvent {
  type: string;
  error?: { message?: string };
}

describe('dataDogRumScript', () => {
  // Guards against JSON.stringify silently dropping the beforeSend function
  it('contains the beforeSend function source', () => {
    expect(dataDogRumScript).toContain(`beforeSend:${beforeSendSource}`);
  });

  it('is syntactically valid JavaScript', () => {
    // Function parses the script without executing it
    expect(() => new Function(dataDogRumScript)).not.toThrow();
  });
});

describe('beforeSendSource', () => {
  // The RUM SDK receives source text, so evaluate it the way the browser will
  const beforeSend: (event: RumEvent) => boolean = new Function(
    `return ${beforeSendSource}`,
  )();

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
});

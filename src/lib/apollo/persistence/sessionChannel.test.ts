import { broadcastSessionEnded, onSessionEnded } from './sessionChannel';

class FakeBroadcastChannel {
  static instances: FakeBroadcastChannel[] = [];

  onmessage: ((event: { data: unknown }) => void) | null = null;
  postMessage = jest.fn();
  close = jest.fn();

  constructor(public name: string) {
    FakeBroadcastChannel.instances.push(this);
  }
}

const originalDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  'BroadcastChannel',
);

const restore = () => {
  if (originalDescriptor) {
    Object.defineProperty(globalThis, 'BroadcastChannel', originalDescriptor);
  } else {
    Reflect.deleteProperty(globalThis, 'BroadcastChannel');
  }
};

describe('sessionChannel', () => {
  beforeEach(() => {
    FakeBroadcastChannel.instances = [];
  });

  afterEach(restore);

  describe('with BroadcastChannel', () => {
    beforeEach(() => {
      Object.defineProperty(globalThis, 'BroadcastChannel', {
        value: FakeBroadcastChannel,
        configurable: true,
        writable: true,
      });
    });

    it('posts session-ended on the mpdx-session channel and closes it', () => {
      broadcastSessionEnded();

      const [channel] = FakeBroadcastChannel.instances;
      expect(FakeBroadcastChannel.instances).toHaveLength(1);
      expect(channel.name).toBe('mpdx-session');
      expect(channel.postMessage).toHaveBeenCalledWith('session-ended');
      expect(channel.close).toHaveBeenCalled();
    });

    it('runs the listener for session-ended only', () => {
      const listener = jest.fn();
      onSessionEnded(listener);

      const [channel] = FakeBroadcastChannel.instances;
      expect(channel.name).toBe('mpdx-session');

      channel.onmessage?.({ data: 'something-else' });
      expect(listener).not.toHaveBeenCalled();

      channel.onmessage?.({ data: 'session-ended' });
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('closes the channel when unsubscribed', () => {
      const unsubscribe = onSessionEnded(jest.fn());
      const [channel] = FakeBroadcastChannel.instances;
      expect(channel.close).not.toHaveBeenCalled();

      unsubscribe();

      expect(channel.close).toHaveBeenCalled();
    });
  });

  describe('without BroadcastChannel', () => {
    beforeEach(() => {
      Reflect.deleteProperty(globalThis, 'BroadcastChannel');
    });

    it('does nothing', () => {
      expect(() => broadcastSessionEnded()).not.toThrow();

      const listener = jest.fn();
      const unsubscribe = onSessionEnded(listener);
      expect(() => unsubscribe()).not.toThrow();
      expect(listener).not.toHaveBeenCalled();
    });
  });
});

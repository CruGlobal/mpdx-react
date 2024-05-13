import { NextRouter } from 'next/router';
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import Loading from '.';

describe('Loading', () => {
  let events: { [key: string]: () => void } = {};

  const router: Pick<NextRouter, 'events'> = {
    events: {
      on: jest
        .fn()
        .mockImplementation((key, eventFn) => (events[key] = eventFn)),
      off: jest.fn().mockImplementation((key, _eventFn) => delete events[key]),
      emit: (key): void => events[key](),
    },
  };

  beforeEach(() => {
    events = {};
  });

  it('has correct overrides', () => {
    const { getByTestId } = render(
      <TestRouter router={router}>
        <Loading loading={true} />
      </TestRouter>,
    );
    expect(getByTestId('Loading')).toBeInTheDocument();
  });

  it('adds and removes event handlers', () => {
    const { unmount } = render(
      <TestRouter router={router}>
        <Loading />
      </TestRouter>,
    );
    expect(router.events.on).toHaveBeenCalledWith(
      'routeChangeStart',
      expect.any(Function),
    );
    expect(router.events.on).toHaveBeenCalledWith(
      'routeChangeComplete',
      expect.any(Function),
    );
    expect(router.events.on).toHaveBeenCalledWith(
      'routeChangeError',
      expect.any(Function),
    );
    unmount();
    expect(router.events.off).toHaveBeenCalledWith(
      'routeChangeStart',
      expect.any(Function),
    );
    expect(router.events.off).toHaveBeenCalledWith(
      'routeChangeComplete',
      expect.any(Function),
    );
    expect(router.events.off).toHaveBeenCalledWith(
      'routeChangeError',
      expect.any(Function),
    );
  });

  it('changes loading state', async () => {
    const { getByTestId } = render(
      <TestRouter router={router}>
        <Loading />
      </TestRouter>,
    );
    const spinner = getByTestId('Loading');
    await waitFor(() => expect(spinner).not.toHaveClass('visible'));

    router.events.emit('routeChangeStart');
    await waitFor(() => expect(spinner).toHaveClass('visible'));

    router.events.emit('routeChangeComplete');
    await waitFor(() => expect(spinner).not.toHaveClass('visible'));

    router.events.emit('routeChangeStart');
    await waitFor(() => expect(spinner).toHaveClass('visible'));

    router.events.emit('routeChangeError');
    await waitFor(() => expect(spinner).not.toHaveClass('visible'));
  });
});

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import TestRouter from '../../../tests/TestRouter';
import Loading from '.';

describe(Loading.name, () => {
    let router, events: { [key: string]: () => void };
    beforeEach(() => {
        events = {};
        router = {
            events: {
                on: jest.fn().mockImplementation((key, eventFn) => (events[key] = eventFn)),
                off: jest.fn().mockImplementation((key, _eventFn) => delete events[key]),
                emit: (key): void => events[key](),
            },
        };
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
        expect(router.events.on).toHaveBeenCalledWith('routeChangeStart', expect.any(Function));
        expect(router.events.on).toHaveBeenCalledWith('routeChangeComplete', expect.any(Function));
        expect(router.events.on).toHaveBeenCalledWith('routeChangeError', expect.any(Function));
        unmount();
        expect(router.events.off).toHaveBeenCalledWith('routeChangeStart', expect.any(Function));
        expect(router.events.off).toHaveBeenCalledWith('routeChangeComplete', expect.any(Function));
        expect(router.events.off).toHaveBeenCalledWith('routeChangeError', expect.any(Function));
    });

    it('changes loading state', async () => {
        const { queryByTestId } = render(
            <TestRouter router={router}>
                <Loading />
            </TestRouter>,
        );
        await waitFor(() => {
            expect(queryByTestId('Loading')).not.toBeInTheDocument();
        });
        router.events.emit('routeChangeStart');
        await waitFor(() => {
            expect(queryByTestId('Loading')).toBeInTheDocument();
        });
        router.events.emit('routeChangeComplete');
        await waitFor(() => {
            expect(queryByTestId('Loading')).not.toBeInTheDocument();
        });
        router.events.emit('routeChangeStart');
        await waitFor(() => {
            expect(queryByTestId('Loading')).toBeInTheDocument();
        });
        router.events.emit('routeChangeError');
        await waitFor(() => {
            expect(queryByTestId('Loading')).not.toBeInTheDocument();
        });
    });
});

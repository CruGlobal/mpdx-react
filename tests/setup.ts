import '@testing-library/jest-dom';

window.document.createRange = (): Range =>
    (({
        setStart: jest.fn(),
        setEnd: jest.fn(),
        commonAncestorContainer: ({
            nodeName: 'BODY',
            ownerDocument: document,
        } as unknown) as Node,
    } as unknown) as Range);

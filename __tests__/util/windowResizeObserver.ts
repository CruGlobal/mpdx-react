const { ResizeObserver } = window;

export const beforeTestResizeObserver = () => {
  window.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
};

export const afterTestResizeObserver = () => {
  window.ResizeObserver = ResizeObserver;
  jest.restoreAllMocks();
};

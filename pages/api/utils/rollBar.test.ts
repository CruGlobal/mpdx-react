describe('RollBar', () => {
  beforeEach(() => {
    jest.resetModules();
  });
  it('should not enable rollBar', () => {
    process.env.ROLLBAR_SERVER_ACCESS_TOKEN = '';
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const rollbar = require('./rollBar').default;
    expect(rollbar.options.enabled).toEqual(false);
  });

  it('should enable rollBar', () => {
    process.env.ROLLBAR_SERVER_ACCESS_TOKEN = 'TOKEN';
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const rollbar = require('./rollBar').default;
    expect(rollbar.options.enabled).toEqual(true);
  });

  it('should set enviroment to development', () => {
    (process.env as any).NODE_ENV = 'development';
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const rollbar = require('./rollBar').default;
    expect(rollbar.options.environment).toEqual('react_development_server');
  });

  it('should set enviroment to production', () => {
    (process.env as any).NODE_ENV = 'production';
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const rollbar = require('./rollBar').default;
    expect(rollbar.options.environment).toEqual('react_production_server');
  });
});

// Added so Lint thinks it's a module
// eslint-disable-next-line jest/no-export
export {};

import { ReactElement, useEffect } from 'react';

const HelpscoutBeacon = (): ReactElement => {
  const addToQueue = (method: any, options: any, data: any) => {
    (window as any).Beacon.readyQueue.push({ method, options, data });
  };

  useEffect(() => {
    const load = () => {
      const firstScriptTag = document.getElementsByTagName('script')[0];
      const scriptTag = document.createElement('script');
      scriptTag.type = 'text/javascript';
      scriptTag.async = !0;
      scriptTag.src = 'https://beacon-v2.helpscout.net';
      firstScriptTag.parentNode?.insertBefore(scriptTag, firstScriptTag);
      (window as any).Beacon = addToQueue;
      (window as any).Beacon.readyQueue = [];
      callBeaconFunction('init', process.env.BEACON_TOKEN);
    };

    const callBeaconFunction = (
      name: string,
      options: string | null = null,
    ) => {
      (process.env.NODE_ENV === 'test'
        ? // eslint-disable-next-line @typescript-eslint/no-empty-function
          (_method: any, _options: any) => {}
        : (window as any).Beacon)(name, options);
    };

    if (document.readyState === 'complete') {
      load();
    } else {
      window.addEventListener('load', load, false);
    }
  }, []);

  return <></>;
};

export default HelpscoutBeacon;

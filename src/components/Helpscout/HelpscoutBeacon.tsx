import Script from 'next/script';
import { useEffect } from 'react';
import { callBeacon, identifyUser, initBeacon } from 'src/lib/helpScout';
import { useUser } from '../../hooks/useUser';

const HelpscoutBeacon: React.FC = () => {
  const user = useUser();

  useEffect(() => {
    initBeacon();

    return () => {
      callBeacon('destroy');
    };
  }, []);

  useEffect(() => {
    if (user) {
      identifyUser(
        user.id,
        user.keyAccounts[0]?.email ?? '',
        [user.firstName, user.lastName].filter((name) => name).join(' '),
      );
    }
  }, [user]);

  return <Script src="https://beacon-v2.helpscout.net" strategy="lazyOnload" />;
};

export default HelpscoutBeacon;

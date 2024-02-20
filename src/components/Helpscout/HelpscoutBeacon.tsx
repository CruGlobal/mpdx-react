import Script from 'next/script';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { callBeacon, identifyUser, initBeacon } from 'src/lib/helpScout';

const HelpscoutBeacon: React.FC = () => {
  const { data: session } = useSession();

  useEffect(() => {
    initBeacon();

    return () => {
      callBeacon('destroy');
    };
  }, []);

  const user = session?.user;
  useEffect(() => {
    if (user) {
      identifyUser(user.userID, user.email, user.name);
    }
  }, [user]);

  return <Script src="https://beacon-v2.helpscout.net" strategy="lazyOnload" />;
};

export default HelpscoutBeacon;

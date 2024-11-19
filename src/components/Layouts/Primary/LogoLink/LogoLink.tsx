import NextLink from 'next/link';
import { useSetupContext } from 'src/components/Setup/SetupProvider';

export const LogoLink: React.FC = () => {
  const { onSetupTour } = useSetupContext();

  const logo = <img src={process.env.NEXT_PUBLIC_MEDIA_LOGO} alt="logo" />;

  return onSetupTour ? logo : <NextLink href="/">{logo}</NextLink>;
};

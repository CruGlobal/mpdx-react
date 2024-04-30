/* eslint-disable import/export */
import React, { ReactElement } from 'react';
import { RenderOptions, RenderResult, render } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from 'src/lib/i18n';
import translation from '../../public/locales/en/translation.json';

i18n.addResourceBundle('en', 'translation', translation);

interface Props {
  children?: React.ReactNode;
}

const Wrapper: React.FC<Props> = ({ children }) => {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'queries'>,
): RenderResult => render(ui, { wrapper: Wrapper, ...options });

export * from '@testing-library/react';

export { customRender as render };

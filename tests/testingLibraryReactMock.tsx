import React, { ReactNode, ReactElement } from 'react';
import { render, RenderResult, RenderOptions } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../src/lib/i18n';
import translation from '../public/locales/en/translation.json';

interface Props {
    children: ReactNode;
}

i18n.addResourceBundle('en', 'translation', translation);

const Wrapper = ({ children }: Props): ReactElement => {
    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'queries'>): RenderResult =>
    render(ui, { wrapper: Wrapper, ...options });

export * from '@testing-library/react';

export { customRender as render };

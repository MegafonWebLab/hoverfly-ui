// eslint-disable-next-line import/prefer-default-export
import type { AutoHighlightResult } from 'highlight.js';
import hljs from 'highlight.js/lib/core';
import 'highlight.js/styles/github.css';
import jsonLang from 'highlight.js/lib/languages/json';
import xmlLang from 'highlight.js/lib/languages/xml';

hljs.registerLanguage('xml', xmlLang);
hljs.registerLanguage('json', jsonLang);

export type MirrorBodyType = 'xml' | 'json' | 'html' | 'text' | '';

export const setCookie = (name: string, value: string, days = 1): void => {
    let expires = '';
    if (days) {
        const date = new Date();
        // eslint-disable-next-line no-magic-numbers
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = `; expires=${date.toUTCString()}`;
    }
    document.cookie = `${name}=${value || ''}${expires}; path=/`;
};
export const getCookie = (name: string): string | null => {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }

    return null;
};

export const onlyDigits = (string: string): string => string.replace(/\D/g, '');

export const omitKey = <T extends Record<string, unknown>>(object: T, key: string): T => {
    delete object[key];

    return object;
};

export const getDigits = (string: string): string => string.replace(/[^0-9]/g, '');

export const convertStringToInteger = (string: string): number => parseInt(string, 10);

export const showNotification = (title: string, message?: string, isError = true): void => {
    setTimeout(() => {
        document.dispatchEvent(
            new CustomEvent('alert', {
                detail: {
                    title,
                    message,
                    isError,
                },
            }),
        );
    });
};

export const hightlightHtml = (code: string): AutoHighlightResult => hljs.highlightAuto(code, ['json', 'html', 'xml']);

export const downloadFile = (data: BlobPart, filename: string, type = 'application/json'): void => {
    const file = new Blob([data], { type });
    const a = document.createElement('a');
    const url = URL.createObjectURL(file);

    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => {
        window.URL.revokeObjectURL(url);
    }, 0);
};

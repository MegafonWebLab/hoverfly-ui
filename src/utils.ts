// eslint-disable-next-line import/prefer-default-export
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

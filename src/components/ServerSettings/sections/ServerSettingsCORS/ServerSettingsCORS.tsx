import React from 'react';
import { Header } from '@megafon/ui-core';
import { cnCreate } from '@megafon/ui-helpers';
import AccordionWrapper from 'components/AccordionWrapper/AccordionWrapper';
import { useSelector } from 'store/hooks';
import './ServerSettingsCORS.pcss';

enum CORS {
    enabled = 'Enabled',
    allowOrigin = 'Allow Origin',
    allowMethods = 'Allow Methods',
    allowHeaders = 'Allow Headers',
    preflightMaxAge = 'Preflight Max Age',
    allowCredentials = 'Allow Credentials',
}

const cn = cnCreate('server-settings-cors');
const ServerSettingsCORS: React.FC = () => {
    const main = useSelector(state => state.main);

    const corsList =
        main.type === 'success'
            ? Object.entries(main.value.cors).map(([key, value]) => ({ title: CORS[key], value: String(value) }))
            : [];

    return (
        <div className={cn()}>
            <AccordionWrapper title="CORS">
                <div className={cn('list')}>
                    {corsList.map(({ title, value }) => (
                        <div className={cn('item')} key={title}>
                            <Header className={cn('title')} as="h5">
                                {title}
                            </Header>
                            <span>{value}</span>
                        </div>
                    ))}
                </div>
            </AccordionWrapper>
        </div>
    );
};

export default ServerSettingsCORS;

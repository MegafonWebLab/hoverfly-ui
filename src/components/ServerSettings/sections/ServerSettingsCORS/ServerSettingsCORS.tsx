import React from 'react';
import { cnCreate } from '@megafon/ui-helpers';
import CollapseWrapper from 'components/CollapseWrapper/CollapseWrapper';
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
            <CollapseWrapper title="CORS">
                <div className={cn('list')}>
                    {corsList.map(({ title, value }) => (
                        <div className={cn('item')} key={title}>
                            <span className={cn('title')}>{title}</span>
                            <span className={cn('value')}>{value}</span>
                        </div>
                    ))}
                </div>
            </CollapseWrapper>
        </div>
    );
};

export default ServerSettingsCORS;

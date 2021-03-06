import React from 'react';
import { cnCreate } from '@megafon/ui-helpers';
import { MainInfo } from 'api/types';
import CollapseWrapper from 'components/CollapseWrapper/CollapseWrapper';
import { useSelector } from 'store/hooks';
import './ServerSettingsCORS.pcss';

const CORS: Record<keyof MainInfo['cors'], string> = {
    enabled: 'Enabled',
    allowOrigin: 'Allow Origin',
    allowMethods: 'Allow Methods',
    allowHeaders: 'Allow Headers',
    preflightMaxAge: 'Preflight Max Age',
    allowCredentials: 'Allow Credentials',
};

const cn = cnCreate('server-settings-cors');
const ServerSettingsCORS: React.FC = () => {
    const main = useSelector(state => state.main);

    function createCorsList() {
        if (main.type !== 'success') {
            return [];
        }

        return Object.entries(main.value.cors).map(([key, value]) => {
            const convertedValue = String(value).replace(/,/g, ', ');

            return { title: CORS[key], value: convertedValue };
        });
    }

    return (
        <div className={cn()}>
            <CollapseWrapper title="CORS">
                <ul className={cn('list')}>
                    {createCorsList().map(({ title, value }) => (
                        <li className={cn('item')} key={title}>
                            <span className={cn('td', { title: true })}>{title}</span>
                            <span className={cn('td', { value: true })}>{value}</span>
                        </li>
                    ))}
                </ul>
            </CollapseWrapper>
        </div>
    );
};

export default ServerSettingsCORS;

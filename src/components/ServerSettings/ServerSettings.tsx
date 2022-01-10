import React, { useState } from 'react';
import { Header, TextField } from '@megafon/ui-core';
import { cnCreate } from '@megafon/ui-helpers';
import ServerSettingsCORS from './sections/ServerSettingsCORS/ServerSettingsCORS';
import ServerSettingsMiddleware from './sections/ServerSettingsMiddleware/ServerSettingsMiddleware';
import ServerSettingsMode from './sections/ServerSettingsMode/ServerSettingsMode';
import ServerSettingsPAC from './sections/ServerSettingsPAC/ServerSettingsPAC';
import ServerSettingsProxy from './sections/ServerSettingsProxy/ServerSettingsProxy';
import './ServerSettings.pcss';

const cn = cnCreate('server-settings');
const ServerSettings: React.FC = () => {
    const [globalDelay, setGlobalDelay] = useState('');

    function getDigits(string: string): string {
        return string.replace(/[^0-9]/g, '');
    }

    function handleDelayInputChange(e: React.ChangeEvent<HTMLInputElement>): void {
        setGlobalDelay(getDigits(e.target.value));
    }

    return (
        <div className={cn()}>
            <Header className={cn('header')} as="h1">
                Server settings
            </Header>
            <div className={cn('content-wrap')}>
                <div className={cn('global-delay')}>
                    <TextField
                        isControlled
                        value={globalDelay}
                        placeholder="Global Delay"
                        classes={{ input: cn('global-delay-input') }}
                        onChange={handleDelayInputChange}
                    />
                </div>
                <div className={cn('sections')}>
                    <ServerSettingsMiddleware />
                    <ServerSettingsMode />
                    <ServerSettingsPAC />
                    <ServerSettingsCORS />
                    <ServerSettingsProxy />
                </div>
            </div>
        </div>
    );
};

export default ServerSettings;

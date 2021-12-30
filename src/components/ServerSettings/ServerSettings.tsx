import React from 'react';
import { Grid, GridColumn, Header, TextField } from '@megafon/ui-core';
import { cnCreate } from '@megafon/ui-helpers';
import ServerSettingsCORS from './sections/ServerSettingsCORS/ServerSettingsCORS';
import ServerSettingsMiddleware from './sections/ServerSettingsMiddleware/ServerSettingsMiddleware';
import ServerSettingsMode from './sections/ServerSettingsMode/ServerSettingsMode';
import ServerSettingsPAC from './sections/ServerSettingsPAC/ServerSettingsPAC';
import ServerSettingsProxy from './sections/ServerSettingsProxy/ServerSettingsProxy';
import './ServerSettings.pcss';

const cn = cnCreate('server-settings');
const ServerSettings: React.FC = () => (
    <div className={cn()}>
        <Header className={cn('header')} as="h1">
            Server settings
        </Header>
        <Grid className={cn('content-wrap')} hAlign="between">
            <GridColumn all="3">
                <TextField classes={{ input: cn('global-delay-input') }} placeholder="Global Delay" />
            </GridColumn>
            <GridColumn className={cn('sections')} all="9">
                <ServerSettingsMiddleware />
                <ServerSettingsMode />
                <ServerSettingsPAC />
                <ServerSettingsCORS />
                <ServerSettingsProxy />
            </GridColumn>
        </Grid>
    </div>
);

export default ServerSettings;

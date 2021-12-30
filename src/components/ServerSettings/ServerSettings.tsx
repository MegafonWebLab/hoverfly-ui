import React from 'react';
import { Grid, GridColumn, Header, TextField } from '@megafon/ui-core';
import { cnCreate } from '@megafon/ui-helpers';
import CorsInfo from './sections/CorsInfo/CorsInfo';
import PacInfo from './sections/PacInfo/PacInfo';
import ProxyInfo from './sections/ProxyInfo/ProxyInfo';
import ServerSettingsMiddleware from './sections/ServerSettingsMiddleware/ServerSettingsMiddleware';
import ServerSettingsMode from './sections/ServerSettingsMode/ServerSettingsMode';
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
                <PacInfo />
                <CorsInfo />
                <ProxyInfo />
            </GridColumn>
        </Grid>
    </div>
);

export default ServerSettings;

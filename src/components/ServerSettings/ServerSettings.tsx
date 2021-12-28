import React from 'react';
import { Grid, GridColumn, Header, TextField } from '@megafon/ui-core';
import { cnCreate } from '@megafon/ui-helpers';
import CorsInfo from '../CorsInfo/CorsInfo';
import Middleware from '../Middleware/Middleware';
import ModeInfo from '../ModeInfo/ModeInfo';
import PacInfo from '../PacInfo/PacInfo';
import ProxyInfo from '../ProxyInfo/ProxyInfo';
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
                <Middleware />
                <ModeInfo />
                <PacInfo />
                <CorsInfo />
                <ProxyInfo />
            </GridColumn>
        </Grid>
    </div>
);

export default ServerSettings;

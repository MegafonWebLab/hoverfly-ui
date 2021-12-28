import React from 'react';
import { cnCreate } from '@megafon/ui-helpers';
import CorsInfo from '../CorsInfo/CorsInfo';
import Middleware from '../Middleware/Middleware';
import ModeInfo from '../ModeInfo/ModeInfo';
import PacInfo from '../PacInfo/PacInfo';
import ProxyInfo from '../ProxyInfo/ProxyInfo';
import StateManagement from '../StateManagement/StateManagement';
import './ServerSettings.pcss';

const cn = cnCreate('server-settings');
const ServerSettings: React.FC = () => (
    <div className={cn()}>
        <CorsInfo />
        <hr />
        <ModeInfo />
        <hr />
        <StateManagement />
        <hr />
        <Middleware />
        <hr />
        <ProxyInfo />
        <hr />
        <PacInfo />
    </div>
);

export default ServerSettings;

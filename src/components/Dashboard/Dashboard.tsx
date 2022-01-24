import React from 'react';
import { Header, Tabs, Tab } from '@megafon/ui-core';
import { cnCreate } from '@megafon/ui-helpers';
import Journal from 'components/Journal/Journal';
import Logs from 'components/Logs/Logs';

const cn = cnCreate('dashboard');
const Dashboard: React.FC = () => (
    <div className={cn()}>
        <Header as="h2">Dashboard</Header>
        <Tabs>
            <Tab title="Journal">
                <Journal />
            </Tab>
            <Tab title="Logs">
                <Logs />
            </Tab>
        </Tabs>
    </div>
);

export default Dashboard;

import React from 'react';
import { Header, Tabs, Tab } from '@megafon/ui-core';
import { cnCreate } from '@megafon/ui-helpers';
import Journal from 'components/Journal/Journal';
import Logs from 'components/Logs/Logs';

const cn = cnCreate('dashboard');
const Dashboard: React.FC = () => {
    const [activeIndex, setActiveIndex] = React.useState<number>(0);

    function handleTabClick(index: number) {
        setActiveIndex(index);
    }

    return (
        <div className={cn()}>
            <Header as="h2">Dashboard</Header>
            <Tabs onTabClick={handleTabClick}>
                <Tab title="Journal">
                    <Journal isActive={activeIndex === 0} />
                </Tab>
                <Tab title="Logs">
                    <Logs isActive={activeIndex === 1} />
                </Tab>
            </Tabs>
        </div>
    );
};

export default Dashboard;

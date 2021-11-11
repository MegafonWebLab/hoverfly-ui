import React from 'react';
import './App.pcss';
import { Grid, GridColumn } from '@megafon/ui-core';
import { cnCreate } from '@megafon/ui-helpers';
import Layout from 'components/Layout/Layout';
import TopBar from 'components/TopBar/TopBar';
import { useDispatch } from 'store/hooks';
import { fetchStatusAsync } from 'store/status/statusSlice';
import AuthModal from '../AuthModal/AuthModal';
import CorsInfo from '../CorsInfo/CorsInfo';
import Journal from '../Journal/Journal';
import Logs from '../Logs/Logs';
import Middleware from '../Middleware/Middleware';
import ModeInfo from '../ModeInfo/ModeInfo';
import PacInfo from '../PacInfo/PacInfo';
import ProxyInfo from '../ProxyInfo/ProxyInfo';
import Simulations from '../Simulations/Simulations';
import StateManagement from '../StateManagement/StateManagement';

const cn = cnCreate('app');
function App(): JSX.Element {
    const dispatch = useDispatch();

    React.useEffect(() => {
        dispatch(fetchStatusAsync());
    }, [dispatch]);

    return (
        <>
            <Layout>
                <TopBar />
                <div>
                    <Grid>
                        <GridColumn className={cn('left-column')} all="3">
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
                        </GridColumn>
                        <GridColumn all="9" className={cn('right-column')}>
                            <Simulations />
                            <hr />
                            <Journal />
                            <hr />
                            <Logs />
                        </GridColumn>
                    </Grid>
                </div>
            </Layout>
            <AuthModal />
        </>
    );
}

export default App;

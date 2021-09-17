import React from 'react';
import './App.pcss';
import { Grid, GridColumn } from '@megafon/ui-core';
import { cnCreate } from '@megafon/ui-helpers';
import Layout from 'components/Layout/Layout';
import TopBar from 'components/TopBar/TopBar';
import { useDispatch } from 'store/hooks';
import { fetchStatusAsync } from 'store/status/statusSlice';
import CorsInfo from '../CorsInfo/CorsInfo';
import ModeInfo from '../ModeInfo/ModeInfo';
import StateManagement from '../StateManagement/StateManagement';

const cn = cnCreate('app');
function App(): JSX.Element {
    const dispatch = useDispatch();

    React.useEffect(() => {
        dispatch(fetchStatusAsync());
    }, [dispatch]);

    return (
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
                    </GridColumn>
                    <GridColumn all="9">content</GridColumn>
                </Grid>
            </div>
        </Layout>
    );
}

export default App;

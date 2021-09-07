import React from 'react';
import './TopBar.pcss';
import { Button, Grid, GridColumn, Header } from '@megafon/ui-core';
import { cnCreate } from '@megafon/ui-helpers';
import { deleteCacheAsync } from 'store/cache/cacheSlicet';
import { useDispatch, useSelector } from 'store/hooks';
import { deleteShutdownAsync } from 'store/shutdown/shutdownSlice';

const cn = cnCreate('topbar');
const TopBar: React.FC = () => {
    const dispatch = useDispatch();
    const mainInfo = useSelector(state => state.main);
    const cacheState = useSelector(state => state.cache);
    const shutdownState = useSelector(state => state.shutdown);
    const server = mainInfo.type === 'success' ? mainInfo.value.version : '';
    const hasCachePending = cacheState.type === 'pending';
    const hasShutdownPending = shutdownState.type === 'pending';

    function handleClickCache(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        dispatch(deleteCacheAsync());
    }

    function handleClickShutdown(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        dispatch(deleteShutdownAsync());
    }

    return (
        <Grid className={cn()} vAlign="center">
            <GridColumn all="6">
                <Header as="h2">Hoverfly-ui</Header>
                <div className={cn('version')}>Server: {server}</div>
                <div className={cn('version')}>UI: v1.0.0</div>
            </GridColumn>
            <GridColumn all="6">
                <div className={cn('buttons')}>
                    <Button
                        className={cn('button')}
                        sizeAll="small"
                        type="outline"
                        theme="purple"
                        showLoader={hasCachePending}
                        onClick={handleClickCache}
                    >
                        Clear cache
                    </Button>
                    <Button
                        className={cn('button')}
                        sizeAll="small"
                        type="outline"
                        theme="black"
                        showLoader={hasShutdownPending}
                        onClick={handleClickShutdown}
                    >
                        Shutdown
                    </Button>
                </div>
            </GridColumn>
        </Grid>
    );
};

export default TopBar;

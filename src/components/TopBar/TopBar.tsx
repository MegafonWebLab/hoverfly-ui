import React, { useEffect } from 'react';
import { Grid, GridColumn, Header, Preloader } from '@megafon/ui-core';
import { cnCreate } from '@megafon/ui-helpers';
import { ReactComponent as ProfileIcon } from '@megafon/ui-icons/basic-16-profile_16.svg';
import { ReactComponent as ClearIcon } from '@megafon/ui-icons/system-16-refresh_16.svg';
import disabledDownIcon from 'static/favicon/disabled_shut_down.svg';
import hoverflyLeftIcon from 'static/favicon/hoverfly-img.png';
import hoverflyIcon from 'static/favicon/hoverfly.png';
import shutDownIcon from 'static/favicon/shut_down.svg';
import { setUserName } from 'store/auth/authSlice';
import { deleteCacheAsync } from 'store/cache/cacheSlice';
import { useDispatch, useSelector } from 'store/hooks';
import { deleteShutdownAsync } from 'store/shutdown/shutdownSlice';
import './TopBar.pcss';

const cn = cnCreate('topbar');
const TopBar: React.FC<{ isLogin?: boolean }> = ({ isLogin }) => {
    const dispatch = useDispatch();
    const mainInfo = useSelector(state => state.main);
    const cacheState = useSelector(state => state.cache);
    const shutdownState = useSelector(state => state.shutdown);
    const authState = useSelector(state => state.auth);

    const { username } = authState;
    const versionServer = mainInfo.type === 'success' ? mainInfo.value.version : 'v*.*.*';

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

    useEffect(() => {
        if (mainInfo.type === 'success') {
            dispatch(setUserName());
        }
    }, [mainInfo.type]);

    const preloader = <Preloader sizeAll="small" color="black" className={cn('button-preloader')} />;

    if (isLogin) {
        return (
            <Grid className={cn()} vAlign="center" hAlign="between">
                <GridColumn all="2" tablet="3" mobile="5" className={cn('logo-wrapper')}>
                    <img src={hoverflyLeftIcon} alt="Hoverfly" width="75" height="75" className={cn('fly')} />
                    <div className={cn('logo-text')}>
                        <img src={hoverflyIcon} alt="Hoverfly" width="130" height="25" />
                    </div>
                </GridColumn>
            </Grid>
        );
    }

    return (
        <Grid className={cn()} vAlign="center" hAlign="between">
            <GridColumn all="7" tablet="7" mobile="12" className={cn('logo-wrapper')}>
                <img src={hoverflyLeftIcon} alt="Hoverfly" width="75" height="75" className={cn('fly')} />
                <div className={cn('logo-text')}>
                    <img src={hoverflyIcon} alt="Hoverfly" width="130" height="25" />
                    <div className={cn('versions')}>
                        <span className={cn('version')}>Server {versionServer}</span>
                        <span className={cn('version')}>UI v{VERSION}</span>
                    </div>
                </div>
            </GridColumn>
            <GridColumn all="5" tablet="5" mobile="12" className={cn('right')}>
                <div className={cn('buttons')}>
                    <div className={cn('button-wrap')}>
                        <button
                            type="button"
                            className={cn('button')}
                            onClick={handleClickCache}
                            disabled={hasCachePending}
                        >
                            <ClearIcon className={cn('clear-icon', { disabled: hasCachePending })} />
                            <span>Clear cache</span>
                        </button>
                        {hasCachePending && preloader}
                    </div>
                    <div className={cn('button-wrap')}>
                        <button
                            type="button"
                            className={cn('button')}
                            onClick={handleClickShutdown}
                            disabled={hasShutdownPending}
                        >
                            <img
                                src={hasShutdownPending ? disabledDownIcon : shutDownIcon}
                                alt="shut down"
                                className={cn('shut-down-icon')}
                            />
                            Shut down
                        </button>
                        {hasShutdownPending && preloader}
                    </div>
                </div>
                <>
                    {username && (
                        <>
                            <div className={cn('divider')} />
                            <Header as="h2" className={cn('profile-username')}>
                                {username}
                            </Header>
                            <ProfileIcon className={cn('profile-icon')} />
                        </>
                    )}
                </>
            </GridColumn>
        </Grid>
    );
};

export default TopBar;

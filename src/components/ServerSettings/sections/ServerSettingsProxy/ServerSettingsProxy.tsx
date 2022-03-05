import React, { useEffect, useState } from 'react';
import { Button, Header, TextField } from '@megafon/ui-core';
import { cnCreate } from '@megafon/ui-helpers';
import CollapseWrapper from 'components/CollapseWrapper/CollapseWrapper';
import { useDispatch, useSelector } from 'store/hooks';
import { getDestinationAsync, updateDestinationAsync } from 'store/proxy/destinationSlice';
import { getUpstreamProxyAsync } from 'store/proxy/upstreamProxySlice';
import './ServerSettingsProxy.pcss';

const cn = cnCreate('server-settings-proxy');
const ServerSettingsProxy: React.FC = () => {
    const dispatch = useDispatch();

    const statusState = !!useSelector(state => state.status.value);
    const destinationStore = useSelector(state => state.destination);
    const upstreamStore = useSelector(state => state.upstreamProxy);

    const [destination, setDestination] = useState<string>('-');
    const [upstream, setUpstream] = useState<string>('');

    function handleDestinationEditFormChange(_e: React.ChangeEvent<HTMLInputElement>): void {
        setDestination(_e.target.value);
    }

    function handleSaveDestination(e: React.FormEvent<HTMLFormElement>): void {
        e.preventDefault();
        dispatch(updateDestinationAsync({ destination }));
    }

    useEffect(() => {
        if (statusState) {
            dispatch(getDestinationAsync());
            dispatch(getUpstreamProxyAsync());
        }
    }, [statusState, dispatch]);

    useEffect(() => {
        if (destinationStore.type === 'success') {
            setDestination(destinationStore.value.destination);
        }
    }, [destinationStore]);

    useEffect(() => {
        if (upstreamStore.type === 'success') {
            setUpstream(upstreamStore.value.upstreamProxy);
        }
    }, [upstreamStore]);

    const renderDestinationTextField = (): JSX.Element => (
        <form className={cn('destination-form')} onSubmit={handleSaveDestination}>
            <TextField
                className={cn('field')}
                classes={{ input: cn('field-input') }}
                value={destination}
                onChange={handleDestinationEditFormChange}
            />

            <Button disabled={!statusState} sizeAll="small" type="outline" actionType="submit">
                Save destination
            </Button>
        </form>
    );

    return (
        <div className={cn()}>
            <CollapseWrapper title="Proxy settings">
                <div className={cn('wrapper')}>
                    <div className={cn('destination-wrap')}>
                        <Header className={cn('title')} as="h5">
                            Destination
                        </Header>
                        <div className={cn('destination-edit-block')}>{renderDestinationTextField()}</div>
                    </div>
                    <div className={cn('upstream-wrap')}>
                        <Header className={cn('title')} as="h5">
                            Upstream proxy
                        </Header>
                        <span>{upstream}</span>
                    </div>
                </div>
            </CollapseWrapper>
        </div>
    );
};

export default ServerSettingsProxy;

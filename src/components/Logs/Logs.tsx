import React, { useCallback, useEffect, useMemo } from 'react';
import { Tile, TextField, Button, Preloader } from '@megafon/ui-core';
import { cnCreate } from '@megafon/ui-helpers';
import { ReactComponent as Refresh } from '@megafon/ui-icons/system-16-refresh_16.svg';
import debounce from 'lodash.debounce';
import type { LogsItem, LogsResponse } from 'api/types';
import { TIMESTAMP_DIVIDER } from 'constants/date';
import { useDispatch, useSelector } from 'store/hooks';
import { getLogsAsync } from 'store/logs/logsSlice';
import './Logs.pcss';
import CalendarField from '../CalendarFIeld/CalendarField';

const getNumber = (str: string): number | undefined => {
    const value = str.replace(/\D/g, '');

    return value ? Number(value) : undefined;
};

const DEBOUNCE_MILLISECONDS = 500;

const LOG_MAX_CHARACTER = 10000;
const cn = cnCreate('logs');
const Logs: React.FC<{ isActive: boolean }> = ({ isActive }) => {
    const dispatch = useDispatch();
    const statusState = !!useSelector(state => state.status.value);
    const logsStore = useSelector(state => state.logs);

    const [state, setState] = React.useState<LogsResponse['logs']>([]);
    const [time, setTime] = React.useState<Date | undefined>(undefined);
    const [fieldLimit, setFieldLimit] = React.useState<number | undefined>(undefined);
    const [limit, setLimit] = React.useState<number | undefined>(undefined);
    const [isChanged, setIsChanged] = React.useState<boolean>(false);
    const tmpDiv = React.useRef<HTMLDivElement>(document.createElement('div'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleChangeLimit = React.useCallback(
        debounce((value: number | undefined) => {
            setIsChanged(true);
            setLimit(value);
        }, DEBOUNCE_MILLISECONDS),
        [],
    );

    const handleChangeFieldLimit = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = getNumber(e.target.value);
        setFieldLimit(value);
        setIsChanged(true);
        handleChangeLimit(value);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = useCallback(() => {
        setIsChanged(false);
        dispatch(getLogsAsync(time ? { from: time.getTime() / TIMESTAMP_DIVIDER, limit } : { limit }));
    }, [dispatch, limit, time]);

    function handleChangeTime(value: Date) {
        setTime(value);
    }

    useEffect(() => {
        if (!isActive || logsStore.type !== 'idle') {
            return;
        }
        if (statusState) {
            dispatch(getLogsAsync(time ? { from: time.getTime() / TIMESTAMP_DIVIDER, limit } : { limit }));
        }
    }, [statusState, time, limit, isActive, dispatch, logsStore.type]);

    useEffect(() => {
        if (logsStore.type === 'success') {
            setState(logsStore.value.logs || []);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [logsStore.type]);

    const renderAdditional = (log: LogsItem) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { time: logTime, level, msg, ...other } = log;
        const fieldList = Object.entries(other);

        return fieldList.map(([key, value], index) => {
            // default value can crash react render
            tmpDiv.current.innerHTML = value.toString().replace(/<img[^>]*>/g, '');
            let b = tmpDiv.current.textContent || tmpDiv.current.innerText || '';
            b = b.length > LOG_MAX_CHARACTER ? `${b.slice(0, LOG_MAX_CHARACTER)}...` : b;

            return (
                // eslint-disable-next-line react/no-array-index-key
                <div className={cn('item-additional')} key={index}>
                    {key}={b}
                </div>
            );
        });
    };

    const header = React.useMemo(
        () => (
            <div className={cn('header-wrapper')}>
                <div className={cn('fields-wrapper')}>
                    <CalendarField className={cn('calendar')} value={time} onChange={handleChangeTime} />
                    <TextField
                        className={cn('limit-wrapper')}
                        disabled={!statusState}
                        classes={{ input: cn('limit') }}
                        placeholder="Limit"
                        isControlled
                        value={fieldLimit}
                        onChange={handleChangeFieldLimit}
                    />
                    <Button
                        className={cn('submit')}
                        actionType="button"
                        disabled={!statusState || !isChanged}
                        onClick={handleSubmit}
                    >
                        Submit
                    </Button>
                </div>
                <Button
                    disabled={!statusState}
                    className={cn('refresh', { disabled: !statusState })}
                    theme="black"
                    icon={<Refresh />}
                    type="outline"
                    onClick={handleSubmit}
                />
            </div>
        ),
        [time, statusState, fieldLimit, isChanged, handleChangeFieldLimit, handleSubmit],
    );

    const renderLogs = useMemo(
        () =>
            state.map((log, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <div className={cn('item')} key={index}>
                    {log.time} [{log.level}] {log.msg}
                    {renderAdditional(log)}
                </div>
            )),
        [state],
    );

    if (logsStore.type === 'failed') {
        return null;
    }

    return (
        <div className={cn()}>
            <div className={cn('loader', { show: logsStore.type === 'pending' })}>
                <Preloader />
            </div>
            {header}
            <Tile className={cn('info')} shadowLevel="high" theme="light">
                {renderLogs}
            </Tile>
        </div>
    );
};

export default Logs;

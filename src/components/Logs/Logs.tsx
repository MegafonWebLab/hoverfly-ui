import React from 'react';
import { Tile, TextField } from '@megafon/ui-core';
import { cnCreate } from '@megafon/ui-helpers';
import debounce from 'lodash.debounce';
import type { LogsItem, LogsResponse } from 'api/types';
import { TIMESTAMP_DIVIDER } from 'constants/date';
import { REQUEST_TIMER_SECONDS } from 'constants/timers';
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
    const tmpDiv = React.useRef<HTMLDivElement>(document.createElement('div'));
    const handleChangeLimit = React.useCallback(
        debounce((value: number | undefined) => {
            setLimit(value);
        }, DEBOUNCE_MILLISECONDS),
        [],
    );

    const handleChangeFieldLimit = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = getNumber(e.target.value);
        setFieldLimit(value);
        handleChangeLimit(value);
    }, []);

    function handleChangeTime(value: Date) {
        setTime(value);
    }

    React.useEffect(() => {
        if (!isActive) {
            return;
        }
        if (statusState) {
            dispatch(getLogsAsync(time ? { from: time.getTime() / TIMESTAMP_DIVIDER, limit } : { limit }));
        }

        const timer = statusState
            ? setInterval(() => {
                  const formData = time ? { from: time.getTime() / TIMESTAMP_DIVIDER, limit } : { limit };
                  if (statusState) {
                      dispatch(getLogsAsync(formData));
                  }
              }, REQUEST_TIMER_SECONDS)
            : undefined;

        // eslint-disable-next-line consistent-return
        return () => {
            clearInterval(timer as undefined);
        };
    }, [statusState, time, limit, isActive]);

    React.useEffect(() => {
        if (logsStore.type === 'success') {
            setState(logsStore.value.logs || []);
        }
    }, [logsStore]);

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
                <CalendarField className={cn('calendar')} value={time} onChange={handleChangeTime} />
                <TextField
                    disabled={!statusState}
                    classes={{ input: cn('limit') }}
                    placeholder="Limit"
                    isControlled
                    value={fieldLimit}
                    onChange={handleChangeFieldLimit}
                />
            </div>
        ),
        [time, fieldLimit, statusState],
    );

    if (logsStore.type === 'failed') {
        return null;
    }

    return (
        <div className={cn()}>
            {header}
            <Tile className={cn('info')} shadowLevel="high" theme="light">
                {state.map((log, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <div className={cn('item')} key={index}>
                        {log.time} [{log.level}] {log.msg}
                        {renderAdditional(log)}
                    </div>
                ))}
            </Tile>
        </div>
    );
};

export default Logs;

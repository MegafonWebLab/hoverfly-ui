import React from 'react';
import { Header, Select, Button, Checkbox } from '@megafon/ui-core';
import type { ISelectItem } from '@megafon/ui-core/dist/lib/components/Select/Select';
import { cnCreate } from '@megafon/ui-helpers';
import { ReactComponent as ClockIcon } from '@megafon/ui-icons/basic-16-clock_16.svg';
import { ReactComponent as StatisticIcon } from '@megafon/ui-icons/basic-16-statistics_16.svg';
import { ReactComponent as RefreshIcon } from '@megafon/ui-icons/system-16-refresh_16.svg';
import type { ChartType } from 'chart.js';
import equal from 'fast-deep-equal';
import type { JournalResponse } from 'api/types';
import { REQUEST_TIMER_SECONDS } from 'constants/timers';
import { useDispatch, useSelector } from 'store/hooks';
import { getJournalAsync } from 'store/journal/journalSlice';
import drawChart, { DrawChartOptions, FromType, getDates, getDatesDataset, getFromUnix, getLabels } from './utils';
import './Journal.pcss';

const SUCCESS_STATUS_CODE = 200;
const INITIAL_STATE: JournalResponse = {
    journal: [],
    offset: 0,
    limit: 0,
    total: 0,
};

const INITIAL_FILTER_STATE: IJournalFilterState = {
    status: undefined,
    mode: '',
    isAllErrors: false,
    format: 'line',
};

const STATUSES: string[] = ['default', '200', '404', '502'];
const MODES: string[] = ['default', 'simulate', 'synthesize', 'modify', 'capture', 'spy', 'diff'];
const TIMES: FromType[] = ['all', 'day', 'hour'];
const FORMATS: ChartType[] = ['line', 'bar', 'pie', 'doughnut', 'polarArea', 'radar'];

interface IJournalFilterState {
    status?: string;
    mode: string;
    isAllErrors: boolean;
    format: ChartType;
}

const cn = cnCreate('journal');
const Journal: React.FC = () => {
    const dispatch = useDispatch();
    const statusState = !!useSelector(state => state.status.value);
    const journalStore = useSelector(state => state.journal);

    const [state, setState] = React.useState<JournalResponse>(INITIAL_STATE);
    const [filterState, setFilterState] = React.useState<IJournalFilterState>(INITIAL_FILTER_STATE);
    const [time, setTime] = React.useState<FromType>('all');
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

    function handleChangeFilter(name: keyof IJournalFilterState) {
        return (
            _e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement> | null,
            dataItem?: ISelectItem<string>,
        ) => {
            setFilterState(prev => ({ ...prev, [name]: dataItem?.value === 'default' ? '' : dataItem?.value }));

            if (name === 'status') {
                setFilterState(prev => ({ ...prev, isAllErrors: false }));
            }
        };
    }

    function handleChangeAllErrors() {
        setFilterState(prev => ({ ...prev, isAllErrors: !prev.isAllErrors, status: undefined }));
    }

    function handleChangeTime(
        _e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement> | null,
        dataItem?: ISelectItem<FromType>,
    ) {
        setTime(dataItem?.value || 'all');
    }

    // eslint-disable-next-line consistent-return
    React.useEffect(() => {
        if (canvasRef.current) {
            const [firstJournal] = state.journal;
            const dates = getDates(firstJournal?.timeStarted);
            const filteredJournal = state.journal.filter(item =>
                filterState.mode ? item.mode === filterState.mode : true,
            );

            const data: DrawChartOptions = {
                type: filterState.format,
                labels: getLabels(dates),
                datasets: [],
            };

            if (filterState.status) {
                const statusDates = filteredJournal
                    .filter(item => item.response.status === Number(filterState.status))
                    .map(item => new Date(item.timeStarted));

                data.datasets.push({
                    label: filterState.status.toString(),
                    data: getDatesDataset(statusDates, dates),
                    // eslint-disable-next-line no-magic-numbers
                    borderColor: Number(filterState.status) < 300 ? '#00B956' : '#ff0000',
                });
            } else {
                const successDates = filteredJournal
                    .filter(item => item.response.status === SUCCESS_STATUS_CODE)
                    .map(item => new Date(item.timeStarted));

                const errorDates = filteredJournal
                    .filter(item => item.response.status !== SUCCESS_STATUS_CODE)
                    .map(item => new Date(item.timeStarted));

                if (!filterState.isAllErrors) {
                    data.datasets.push({
                        label: 'success',
                        data: getDatesDataset(successDates, dates),
                        borderColor: '#00B956',
                    });
                }
                data.datasets.push({
                    label: 'error',
                    data: getDatesDataset(errorDates, dates),
                    borderColor: '#ff0000',
                });
            }

            const chart = drawChart(data, canvasRef.current);

            return () => {
                chart.destroy();
            };
        }
    }, [state.journal, filterState]);

    React.useEffect(() => {
        if (journalStore.type === 'success' && !equal(journalStore.value, state)) {
            setState(journalStore.value || {});
        }
    }, [journalStore, state]);

    React.useEffect(() => {
        const filter = { from: getFromUnix(time) };
        if (statusState) {
            dispatch(getJournalAsync(filter));
        }

        const timer = statusState
            ? setInterval(() => {
                  dispatch(getJournalAsync(filter));
              }, REQUEST_TIMER_SECONDS)
            : undefined;

        return () => {
            clearInterval(timer as undefined);
        };
    }, [statusState, time]);

    return (
        <div>
            <Header as="h2">Journal</Header>
            <div className={cn('content')}>
                <canvas ref={canvasRef} className={cn('canvas')} />
            </div>
            <div className={cn('filter')}>
                <div className={cn('filter-left')}>
                    <Select
                        classes={{
                            root: cn('filter-item', { status: true }),
                        }}
                        placeholder="Status code"
                        currentValue={filterState.status}
                        items={STATUSES.map(item => ({
                            title: item,
                            value: item,
                        }))}
                        onSelect={handleChangeFilter('status')}
                    />
                    <Select
                        classes={{
                            root: cn('filter-item', { mode: true }),
                        }}
                        placeholder="Mode"
                        currentValue={filterState.mode}
                        items={MODES.map(item => ({
                            title: item,
                            value: item,
                        }))}
                        onSelect={handleChangeFilter('mode')}
                    />
                    <Checkbox checked={filterState.isAllErrors} onChange={handleChangeAllErrors} fontSize="small">
                        Show only errors
                    </Checkbox>
                </div>
                <div className={cn('filter-right')}>
                    <Button className={cn('refresh')} theme="purple" icon={<RefreshIcon />} sizeAll="small" />
                    <Select
                        classes={{
                            root: cn('filter-item', { time: true }),
                            titleInner: cn('time-title-inner'),
                            listItem: cn('time-list-item'),
                        }}
                        currentValue={time}
                        items={TIMES.map(item => ({
                            title: item,
                            value: item,
                            view: (
                                <>
                                    <ClockIcon className={cn('select-icon')} /> {item}
                                </>
                            ),
                            selectedView: (
                                <>
                                    <ClockIcon className={cn('select-icon')} /> {item}
                                </>
                            ),
                        }))}
                        onSelect={handleChangeTime}
                    />
                    <Select
                        classes={{
                            root: cn('filter-item', { format: true }),
                            titleInner: cn('time-title-inner'),
                            listItem: cn('time-list-item'),
                        }}
                        currentValue={filterState.format}
                        items={FORMATS.map(item => ({
                            title: item === 'line' ? 'Default' : item.charAt(0).toUpperCase() + item.slice(1),
                            value: item,
                            selectedView: (
                                <>
                                    <StatisticIcon className={cn('select-icon')} />{' '}
                                    {item === 'line' ? 'Default' : item.charAt(0).toUpperCase() + item.slice(1)}
                                </>
                            ),
                        }))}
                        onSelect={handleChangeFilter('format')}
                    />
                </div>
            </div>
        </div>
    );
};

export default Journal;

/* eslint-disable jsx-a11y/control-has-associated-label */
import React from 'react';
import { Select, Button, Checkbox, Tooltip } from '@megafon/ui-core';
import type { ISelectItem } from '@megafon/ui-core/dist/lib/components/Select/Select';
import { cnCreate } from '@megafon/ui-helpers';
import { ReactComponent as DeleteIcon } from '@megafon/ui-icons/basic-16-delete_16.svg';
import type { ChartType } from 'chart.js';
import equal from 'fast-deep-equal';
import type { JournalResponse, JournalItem } from 'api/types';
import { REQUEST_TIMER_SECONDS } from 'constants/timers';
import { useDispatch, useSelector } from 'store/hooks';
import { getJournalAsync, deleteJournalAsync } from 'store/journal/journalSlice';
import JournalRow from './JournalRow';
import type { DrawChartOptions, IJournalFilterState } from './types';
import drawChart, {
    filterJournal,
    FromType,
    getDates,
    getDatesDataset,
    getFromUnix,
    getLabels,
    capFirstLetter,
    SUCCESS_STATUS_CODE,
} from './utils';
import './Journal.pcss';

const WIDTH_MILLISECONDS = 300;
const BODY_PADDING = 100;
const NEUTRAL_STATUS = 300;
const GREEN_COLOR = '#00B956';
const RED_COLOR = '#ff0000';

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

const MODES: string[] = ['default', 'simulate', 'synthesize', 'modify', 'capture', 'spy', 'diff'];
const TIMES: FromType[] = ['all', 'day', 'hour'];
const FORMATS: ChartType[] = ['line', 'bar', 'pie', 'doughnut', 'polarArea', 'radar'];

const cn = cnCreate('journal');
const Journal: React.FC<{ isActive: boolean }> = ({ isActive }) => {
    const dispatch = useDispatch();
    const statusState = !!useSelector(state => state.status.value);
    const journalStore = useSelector(state => state.journal);

    const [state, setState] = React.useState<JournalResponse>(INITIAL_STATE);
    const [filterState, setFilterState] = React.useState<IJournalFilterState>(INITIAL_FILTER_STATE);
    const [time, setTime] = React.useState<FromType>('all');
    const [bodyWidth, setBodyWidth] = React.useState<string>('0');
    const [filteredJournal, setFilterJournal] = React.useState<JournalItem[]>([]);
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
    const tableRef = React.useRef<HTMLTableElement | null>(null);
    const deleteRef = React.useRef<HTMLButtonElement | null>(null);
    const statuses = React.useMemo(() => {
        const statusList = Array.from(new Set<string>(state.journal.map(j => String(j.response.status))));
        statusList.sort((a, b) => Number(a) - Number(b));

        return ['default', ...statusList];
    }, [state]);

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

    function handleRemoveJournal() {
        dispatch(deleteJournalAsync());
    }

    React.useEffect(() => {
        setTimeout(() => setFilterJournal(filterJournal(state.journal, filterState)));
    }, [filterState, state.journal]);

    React.useEffect(() => {
        function changeBodyWidth() {
            if (tableRef.current) {
                const { current } = tableRef;
                setBodyWidth('0');

                setTimeout(() => {
                    setBodyWidth(`${current.offsetWidth - BODY_PADDING}px`);
                }, WIDTH_MILLISECONDS);
            }
        }

        changeBodyWidth();

        window.addEventListener('resize', changeBodyWidth);

        return () => {
            window.removeEventListener('resize', changeBodyWidth);
        };
    }, []);

    // eslint-disable-next-line consistent-return
    React.useEffect(() => {
        if (canvasRef.current) {
            const [firstJournal] = state.journal;
            const { dates, type: dateType } = getDates(firstJournal?.timeStarted);
            const journal = state.journal.filter(item => (filterState.mode ? item.mode === filterState.mode : true));

            const data: DrawChartOptions = {
                type: filterState.format,
                labels: dateType === 'day' ? getLabels(dates, 'E dd') : getLabels(dates),
                datasets: [],
            };

            if (filterState.status) {
                const statusDates = journal
                    .filter(item => item.response.status === Number(filterState.status))
                    .map(item => new Date(item.timeStarted));

                data.datasets.push({
                    label: filterState.status.toString(),
                    data: getDatesDataset(statusDates, dates),
                    borderColor: Number(filterState.status) < NEUTRAL_STATUS ? GREEN_COLOR : RED_COLOR,
                });
            } else {
                const successDates = journal
                    .filter(item => item.response.status === SUCCESS_STATUS_CODE)
                    .map(item => new Date(item.timeStarted));

                const errorDates = journal
                    .filter(item => item.response.status !== SUCCESS_STATUS_CODE)
                    .map(item => new Date(item.timeStarted));

                data.datasets.push({
                    label: 'Fail',
                    data: getDatesDataset(errorDates, dates),
                    borderColor: '#F62434',
                });

                if (!filterState.isAllErrors) {
                    data.datasets.push({
                        label: 'Success',
                        data: getDatesDataset(successDates, dates),
                        borderColor: '#00B956',
                    });
                }
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
        if (!isActive || !statusState) {
            return;
        }
        const filter = { from: getFromUnix(time) };

        dispatch(getJournalAsync(filter));

        const timer = statusState
            ? setInterval(() => {
                  dispatch(getJournalAsync(filter));
              }, REQUEST_TIMER_SECONDS)
            : undefined;

        // eslint-disable-next-line consistent-return
        return () => {
            clearInterval(timer as undefined);
        };
    }, [statusState, time, isActive, dispatch]);

    return (
        <div className={cn()}>
            <div className={cn('content')}>
                <canvas ref={canvasRef} className={cn('canvas')} />
            </div>
            <div className={cn('filter')}>
                <div className={cn('filter-left')}>
                    <Select
                        disabled={!statusState}
                        classes={{
                            root: cn('filter-item', { status: true }),
                            control: cn('filter-control'),
                        }}
                        placeholder="Status code"
                        currentValue={filterState.status}
                        items={statuses.map(item => ({
                            title: item,
                            value: item,
                        }))}
                        onSelect={handleChangeFilter('status')}
                    />
                    <Select
                        disabled={!statusState}
                        classes={{
                            root: cn('filter-item', { mode: true }),
                            control: cn('filter-control'),
                        }}
                        placeholder="Simulate"
                        currentValue={filterState.mode}
                        items={MODES.map(item => ({
                            title: capFirstLetter(item),
                            value: item,
                        }))}
                        onSelect={handleChangeFilter('mode')}
                    />
                    <Checkbox
                        disabled={!statusState}
                        classes={{ icon: cn('checkbox'), inner: cn('checkbox-inner') }}
                        checked={filterState.isAllErrors}
                        onChange={handleChangeAllErrors}
                        fontSize="regular"
                    >
                        Show only errors
                    </Checkbox>
                </div>
                <div className={cn('filter-right')}>
                    <Button
                        disabled={!statusState}
                        className={cn('delete', { disabled: !statusState })}
                        theme="black"
                        icon={<DeleteIcon />}
                        type="outline"
                        buttonRef={deleteRef}
                        onClick={handleRemoveJournal}
                    />
                    <Tooltip paddings="small" triggerElement={deleteRef}>
                        Clear dashboard
                    </Tooltip>
                    <Select
                        disabled={!statusState}
                        classes={{
                            root: cn('filter-item', { time: true }),
                            control: cn('filter-control'),
                        }}
                        currentValue={time}
                        items={TIMES.map(item => ({
                            title: capFirstLetter(item),
                            value: item,
                        }))}
                        onSelect={handleChangeTime}
                    />
                    <Select
                        disabled={!statusState}
                        classes={{
                            root: cn('filter-item', { format: true }),
                            control: cn('filter-control'),
                        }}
                        currentValue={filterState.format}
                        items={FORMATS.map(item => ({
                            title: item === 'line' ? 'Default' : item.charAt(0).toUpperCase() + item.slice(1),
                            value: item,
                        }))}
                        onSelect={handleChangeFilter('format')}
                    />
                </div>
            </div>
            <table className={cn('table')} ref={tableRef}>
                <thead className={cn('table-head')}>
                    <tr className={cn('head-row')}>
                        <th className={cn('th')} />
                        <th className={cn('th')}>Method</th>
                        <th className={cn('th')}>Route</th>
                        <th className={cn('th')} />
                        <th className={cn('th')}>Status</th>
                        <th className={cn('th')}>Mode</th>
                        <th className={cn('th')}>Last seen</th>
                        <th className={cn('th')}>Latency</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredJournal.length > 0 ? (
                        filteredJournal.map((item, index) => (
                            <JournalRow
                                /* eslint-disable-next-line react/no-array-index-key */
                                key={item.timeStarted + index}
                                request={item.request}
                                response={item.response}
                                mode={item.mode}
                                timeStarted={item.timeStarted}
                                latency={item.latency}
                                bodyWidth={bodyWidth}
                            />
                        ))
                    ) : (
                        <tr>
                            <td colSpan={8} className={cn('td-empty')}>
                                Journal empty
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Journal;

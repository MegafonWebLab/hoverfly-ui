import React, { useCallback, useEffect, useState } from 'react';
import { Header, TextField, Select, Tile, Pagination, Preloader, Button, Paragraph } from '@megafon/ui-core';
import type { ISelectItem } from '@megafon/ui-core/dist/lib/components/Select/Select';
import { cnCreate } from '@megafon/ui-helpers';
import { ReactComponent as DeleteIcon } from '@megafon/ui-icons/basic-16-delete_16.svg';
import Skeleton from 'react-loading-skeleton';
import { ReactComponent as PlusIcon } from 'static/favicon/plus.svg';
import { useSelector } from 'store/hooks';
import Popup from '../Popup/Popup';
import type { RouteItem } from './types';
import { getRouteList } from './utils';
import './Simulations.pcss';

const MAX_SIMULATIONS_ON_PAGE = 16;
const sortTypeItems = [{ title: 'By require', value: 'By require' }];
// eslint-disable-next-line no-magic-numbers
const SKELETON_LIST = [80, 120, 60, 80, 120, 80, 120, 60, 80, 120, 80, 120, 60, 80, 120];
const WIDTH_MULTIPLIER = 3;

interface ISimulationsProps {
    onChange: (index: number | undefined, type: 'edit' | 'delete' | 'new') => void;
}

const cn = cnCreate('simulations');
const Simulations: React.FC<ISimulationsProps> = ({ onChange }) => {
    const simulationStore = useSelector(state => state.simulation);
    const statusState = !!useSelector(state => state.status.value);

    const [pathValue, setPathValue] = useState<string>('');
    const [search, setSearch] = useState<string>('');
    const [sortType, setSortType] = useState<ISelectItem<string>>(sortTypeItems[0]);
    const [activePage, setActivePage] = useState<number>(1);
    const [simulations, setSimulations] = useState<RouteItem[]>([]);
    const [deleteIndex, setDeleteIndex] = useState<number | undefined>(undefined);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const searchSimulations = React.useMemo(
        () => simulations.filter(({ name }) => name.search(search) !== -1),
        [search, simulations],
    );

    const firstSimulationOnPageIndex = (activePage - 1) * MAX_SIMULATIONS_ON_PAGE;
    const lastSimulationOnPageIndex = firstSimulationOnPageIndex + MAX_SIMULATIONS_ON_PAGE;
    const simulationListOnPage = searchSimulations.slice(firstSimulationOnPageIndex, lastSimulationOnPageIndex);
    const totalSimulationPages = Math.ceil(searchSimulations.length / MAX_SIMULATIONS_ON_PAGE);

    const handleOpen = useCallback(() => setIsOpen(true), []);
    const handleClose = useCallback(() => {
        setDeleteIndex(undefined);
        setIsOpen(false);
    }, []);

    function handleSimulationEditButtonClick(index: number) {
        return () => onChange(index, 'edit');
    }

    function handleSimulationDeleteButtonClick(index: number) {
        return (e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            if (deleteIndex === undefined && simulationStore.type === 'success') {
                const pair = simulationStore.value.data.pairs[index];

                setPathValue(`${pair.request?.method?.[0].value} ${pair.request?.path?.[0].value}`);
                setDeleteIndex(index);
                handleOpen();
            }
        };
    }

    function handleAdd() {
        onChange(undefined, 'new');
    }

    function handleDelete() {
        setIsOpen(false);
        deleteIndex !== undefined && onChange(deleteIndex, 'delete');
    }

    function handlePaginationChange(currentPage: number) {
        setActivePage(currentPage);
    }

    function handleSortTypeSelect(
        _e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement> | null,
        item: ISelectItem<string> | undefined,
    ) {
        item && setSortType(item);
    }

    function handleChangeSearch(e: React.ChangeEvent<HTMLInputElement>) {
        if (activePage !== 1) {
            setActivePage(1);
        }

        setSearch(e.target.value);
    }

    useEffect(() => {
        if (simulationStore.type === 'success') {
            setSimulations(getRouteList(simulationStore.value.data.pairs));
            setDeleteIndex(undefined);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [simulationStore.type]);

    const renderPreloader = () =>
        SKELETON_LIST.map(width => (
            <div className={cn('preloader-item')}>
                <Skeleton width={width * WIDTH_MULTIPLIER} height={22} />
                <Skeleton className={cn('preloader-circle')} circle width={22} height={22} />
            </div>
        ));

    const renderSimulationList = () =>
        simulationListOnPage.map(({ name, index }) => (
            <li
                className={cn('item')}
                key={`${index + name}`}
                onClick={handleSimulationEditButtonClick(index)}
                aria-hidden
            >
                <div className={cn('item-text')}>
                    <span>{name}</span>
                    {!isOpen && index === deleteIndex && (
                        <div className={cn('delete-loader')}>
                            <Preloader color="black" />
                        </div>
                    )}
                </div>
                <div className={cn('item-buttons')}>
                    <button
                        className={cn('delete-btn', { disabled: (!isOpen && index === deleteIndex) || !statusState })}
                        type="button"
                        disabled={index === deleteIndex || !statusState}
                        onClick={handleSimulationDeleteButtonClick(index)}
                    >
                        <DeleteIcon />
                    </button>
                </div>
            </li>
        ));

    return (
        <div className={cn()}>
            <Header className={cn('header')} as="h2">
                Simulations
            </Header>
            <div className={cn('menu')}>
                <div className={cn('active-simulations')}>
                    <Header className={cn('active-simulations-header')} as="h3">
                        Active simulations
                    </Header>
                    <button
                        className={cn('nav-link', { disabled: !statusState })}
                        type="button"
                        onClick={handleAdd}
                        disabled={!statusState}
                    >
                        <PlusIcon />
                    </button>
                </div>
                <div className={cn('fields')}>
                    <TextField
                        classes={{
                            input: cn('input'),
                        }}
                        onChange={handleChangeSearch}
                        placeholder="Search simulation"
                    />
                    <Select<string>
                        classes={{
                            control: cn('input'),
                        }}
                        items={sortTypeItems}
                        currentValue={sortType.value}
                        onSelect={handleSortTypeSelect}
                    />
                </div>
            </div>
            <Tile className={cn('tile')} radius="rounded" shadowLevel="high">
                <ul className={cn('list')}>
                    {simulationStore.type === 'pending' ? renderPreloader() : renderSimulationList()}
                </ul>
            </Tile>
            {simulations.length > MAX_SIMULATIONS_ON_PAGE && (
                <div className={cn('pagination-wrap')}>
                    <Pagination
                        totalPages={totalSimulationPages}
                        activePage={activePage}
                        onChange={handlePaginationChange}
                    />
                </div>
            )}
            <Popup open={isOpen} onClose={handleClose}>
                <Paragraph align="center">Delete {pathValue}?</Paragraph>
                <div className={cn('popup-buttons')}>
                    <Button
                        className={cn('popup-button')}
                        sizeAll="small"
                        type="outline"
                        actionType="button"
                        onClick={handleDelete}
                    >
                        Delete
                    </Button>
                    <Button sizeAll="small" actionType="button" onClick={handleClose}>
                        Cancel
                    </Button>
                </div>
            </Popup>
        </div>
    );
};

export default Simulations;

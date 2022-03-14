import React, { useCallback, useEffect, useState } from 'react';
import { Header, TextField, Select, Pagination, Button, Paragraph } from '@megafon/ui-core';
import type { ISelectItem } from '@megafon/ui-core/dist/lib/components/Select/Select';
import { cnCreate } from '@megafon/ui-helpers';
import { ReactComponent as DeleteIcon } from '@megafon/ui-icons/basic-16-delete_16.svg';
import { ReactComponent as AttensionIcon } from '@megafon/ui-icons/system-24-attention_24.svg';
import { ReactComponent as GagIcon } from '@megafon/ui-icons/system-24-gag_24.svg';
import Skeleton from 'react-loading-skeleton';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ReactComponent as PlusIcon } from 'static/favicon/plus.svg';
import { useSelector } from 'store/hooks';
import Popup from '../Popup/Popup';
import type { RouteItem } from './types';
import { getRouteList } from './utils';
import './Simulations.pcss';

const MAX_SIMULATIONS_ON_PAGE = 50;
const sortTypeItems = [{ title: 'By require', value: 'By require' }];
// eslint-disable-next-line no-magic-numbers
const SKELETON_LIST = [80, 120, 60, 80, 120, 80, 120, 60, 80, 120, 80, 120, 60, 80, 120];
const WIDTH_MULTIPLIER = 3;
const BADGE_ICON = {
    require: GagIcon,
    new: AttensionIcon,
} as const;

interface ISimulationsProps {
    onChange: (index: number | undefined, type: 'edit' | 'delete' | 'new') => void;
}

const cn = cnCreate('simulations');
const Simulations: React.FC<ISimulationsProps> = ({ onChange }) => {
    const simulationStore = useSelector(state => state.simulation);
    const statusState = !!useSelector(state => state.status.value);
    const nav = useNavigate();
    const [searchParams] = useSearchParams();
    const page = searchParams.get('page') || '1';

    const [pathValue, setPathValue] = useState<string>('');
    const [search, setSearch] = useState<string>('');
    const [sortType, setSortType] = useState<ISelectItem<string>>(sortTypeItems[0]);
    const [activePage, setActivePage] = useState<number>(Number(page));
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

                setPathValue(`${pair.request?.method?.[0].value || ''} ${pair.request?.path?.[0].value}`);
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
        nav(`/simulations?page=${currentPage}`);
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
            nav(`/simulations`);
        }

        setSearch(e.target.value);
    }

    useEffect(() => {
        if (Number(page) !== activePage) {
            setActivePage(Number(page));
        }
    }, [page, activePage]);

    useEffect(() => {
        if (simulationStore.type === 'success') {
            setSimulations(getRouteList(simulationStore.value.data.pairs));
            setDeleteIndex(undefined);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [simulationStore.type]);

    const renderPreloader = () =>
        SKELETON_LIST.map((width, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <div className={cn('preloader-item')} key={index}>
                <Skeleton width={width * WIDTH_MULTIPLIER} height={24} />
                <Skeleton className={cn('preloader-circle')} circle width={22} height={22} />
            </div>
        ));

    const renderBadge = (text: string, type: 'require' | 'new', method: string) => {
        const Icon = BADGE_ICON[type];

        return (
            <div className={cn('badge', { method, type })}>
                <Icon className={cn('badge-icon')} />
                {text}
            </div>
        );
    };

    const renderSimulationList = () =>
        simulationListOnPage.map(({ method, name, index, isNewState, isRequiresState }) => (
            <li
                className={cn('item', { method })}
                key={`${index + name}`}
                onClick={handleSimulationEditButtonClick(index)}
                aria-hidden
            >
                <div className={cn('item-text')}>
                    <span className={cn('item-method', { method })}>{method}</span>
                    <span className={cn('item-route')}>{name}</span>
                </div>
                <div className={cn('item-buttons')}>
                    {(isRequiresState || isNewState) && (
                        <div className={cn('badges')}>
                            {isRequiresState && renderBadge('require state', 'require', method)}
                            {isNewState && renderBadge('new state', 'new', method)}
                        </div>
                    )}
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
            <ul className={cn('list')}>
                {simulationStore.type === 'pending' ? renderPreloader() : renderSimulationList()}
            </ul>
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
                <Paragraph className={cn('popup-text')} align="center">
                    Delete {pathValue}?
                </Paragraph>
                <div className={cn('popup-buttons')}>
                    <Button
                        className={cn('popup-button', { delete: true })}
                        sizeAll="small"
                        type="outline"
                        actionType="button"
                        onClick={handleDelete}
                    >
                        Delete
                    </Button>
                    <Button sizeAll="small" type="outline" actionType="button" onClick={handleClose}>
                        Cancel
                    </Button>
                </div>
            </Popup>
        </div>
    );
};

export default Simulations;

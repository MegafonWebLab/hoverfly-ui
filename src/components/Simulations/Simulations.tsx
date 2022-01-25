import React, { useState } from 'react';
import { Header, TextField, Select, Tile, Pagination } from '@megafon/ui-core';
import { ISelectItem } from '@megafon/ui-core/dist/lib/components/Select/Select';
import { cnCreate } from '@megafon/ui-helpers';
import { ReactComponent as DeleteIcon } from '@megafon/ui-icons/basic-16-delete_16.svg';
import { NavLink } from 'react-router-dom';
import editIcon from 'static/favicon/edit-icon.svg';
import plusIcon from 'static/favicon/plus.svg';
import { useSelector } from 'store/hooks';
import { getRouteList } from './utils';
import './Simulations.pcss';

const MAX_SIMULATIONS_ON_PAGE = 16;
const sortTypeItems = [{ title: 'By require', value: 'By require' }];

const cn = cnCreate('simulations');
const Simulations: React.FC = () => {
    const simulationStore = useSelector(state => state.simulation);

    const [sortType, setSortType] = useState<ISelectItem<string>>(sortTypeItems[0]);
    const [activePage, setActivePage] = useState<number>(1);

    const simulationList: string[] =
        simulationStore.type === 'success' ? getRouteList(simulationStore.value.data.pairs) : [];
    const firstSimulationOnPageIndex = (activePage - 1) * MAX_SIMULATIONS_ON_PAGE;
    const lastSimulationOnPageIndex = firstSimulationOnPageIndex + MAX_SIMULATIONS_ON_PAGE;
    const simulationListOnPage = simulationList.slice(firstSimulationOnPageIndex, lastSimulationOnPageIndex);
    const totalSimulationPages = Math.ceil(simulationList.length / MAX_SIMULATIONS_ON_PAGE);

    function handleSimulationEditButtonClick(id: number) {
        id;

        return () => {};
    }

    function handleSimulationDeleteButtonClick(id: number) {
        id;

        return () => {};
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

    const rendeSimulationList = () =>
        simulationListOnPage.map((request, id) => (
            <li className={cn('item')}>
                <div className={cn('item-buttons')}>
                    <button type="button" className={cn('edit-btn')} onClick={handleSimulationEditButtonClick(id)}>
                        <img className={cn('edit-btn')} src={editIcon} alt="edit-icon" />
                    </button>
                    <button type="button" className={cn('delete-btn')} onClick={handleSimulationDeleteButtonClick(id)}>
                        <DeleteIcon />
                    </button>
                </div>
                <span>{request}</span>
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
                    <NavLink className={cn('nav-link')} to="/simulations/new">
                        <span className={cn('button-content')}>
                            <img className={cn('plus-icon')} src={plusIcon} alt="plus-icon" />
                            ADD NEW
                        </span>
                    </NavLink>
                </div>
                <div className={cn('fields')}>
                    <TextField
                        classes={{
                            input: cn('input'),
                        }}
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
                <ul className={cn('list')}>{rendeSimulationList()}</ul>
            </Tile>
            {simulationList.length > MAX_SIMULATIONS_ON_PAGE && (
                <div className={cn('pagination-wrap')}>
                    <Pagination
                        totalPages={totalSimulationPages}
                        activePage={activePage}
                        onChange={handlePaginationChange}
                    />
                </div>
            )}
        </div>
    );
};

export default Simulations;

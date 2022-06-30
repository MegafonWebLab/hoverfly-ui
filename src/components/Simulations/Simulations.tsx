/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from 'react';
import { Header, TextField, Select, Pagination, Button } from '@megafon/ui-core';
import type { ISelectItem } from '@megafon/ui-core/dist/lib/components/Select/Select';
import { cnCreate } from '@megafon/ui-helpers';
import { ReactComponent as DeleteIcon } from '@megafon/ui-icons/basic-16-delete_16.svg';
import { ReactComponent as AttensionIcon } from '@megafon/ui-icons/system-24-attention_24.svg';
import { ReactComponent as GagIcon } from '@megafon/ui-icons/system-24-gag_24.svg';
import cloneDeep from 'clone-deep';
import { useDropzone } from 'react-dropzone';
import Skeleton from 'react-loading-skeleton';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { SimulationItem, SimulationResponse } from 'api/types';
import { ReactComponent as PlusIcon } from 'static/favicon/plus.svg';
import { useSelector } from 'store/hooks';
import { downloadFile } from 'utils';
import Popup from '../Popup/Popup';
import exampleData from './exampleData';
import type { RouteItem } from './types';
import { getRouteList, validateImport } from './utils';
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
    onDelete: (index: number) => void;
    onImport: (state: SimulationResponse) => void;
    onChange: (index: number | undefined, type: 'edit' | 'delete' | 'new') => void;
}

interface ISimulationsImportState {
    file: File | undefined;
    pairs: SimulationItem[];
    errors: string;
}

const cn = cnCreate('simulations');
const Simulations: React.FC<ISimulationsProps> = ({ onChange, onDelete, onImport }) => {
    const simulationStore = useSelector(state => state.simulation);
    const statusState = !!useSelector(state => state.status.value);
    const nav = useNavigate();
    const [searchParams] = useSearchParams();
    const page = searchParams.get('page') || '1';

    const [search, setSearch] = useState<string>('');
    const [sortType, setSortType] = useState<ISelectItem<string>>(sortTypeItems[0]);
    const [activePage, setActivePage] = useState<number>(Number(page));
    const [simulations, setSimulations] = useState<RouteItem[]>([]);
    const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
    const [importData, setImportData] = useState<ISimulationsImportState>({ file: undefined, pairs: [], errors: '' });
    const { getRootProps, getInputProps } = useDropzone({
        accept: 'application/json',
        onDrop: acceptedFiles => {
            acceptedFiles.forEach(file => {
                const reader = new FileReader();
                reader.readAsText(file);
                reader.onload = (ev: ProgressEvent<FileReader>) => {
                    if (ev.target && typeof ev.target.result === 'string') {
                        const val = JSON.parse(ev.target.result);
                        const result = validateImport(JSON.parse(ev.target.result));

                        if (result.type === 'success') {
                            setImportData({ file: file || undefined, pairs: val, errors: '' });
                        } else {
                            setImportData({ file: file || undefined, pairs: [], errors: result.message });
                        }
                    }
                };
            });
        },
        multiple: false,
    });

    const searchSimulations = React.useMemo(
        () => simulations.filter(({ name }) => name.search(search) !== -1),
        [search, simulations],
    );

    const firstSimulationOnPageIndex = (activePage - 1) * MAX_SIMULATIONS_ON_PAGE;
    const lastSimulationOnPageIndex = firstSimulationOnPageIndex + MAX_SIMULATIONS_ON_PAGE;
    const simulationListOnPage = searchSimulations.slice(firstSimulationOnPageIndex, lastSimulationOnPageIndex);
    const totalSimulationPages = Math.ceil(searchSimulations.length / MAX_SIMULATIONS_ON_PAGE);

    function handleImportPairs(type: 'add' | 'replace') {
        return (_e: React.MouseEvent<HTMLButtonElement>) => {
            if (simulationStore.type === 'success') {
                const newState = cloneDeep(simulationStore.value);

                setActivePage(1);
                if (type === 'add') {
                    newState.data.pairs = newState.data.pairs.concat(importData.pairs);
                    onImport(newState);
                } else if (type === 'replace') {
                    newState.data.pairs = importData.pairs;
                    onImport(newState);
                }
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                handleCloseImport();
            }
        };
    }

    function handleOpenImport() {
        setIsImportOpen(true);
    }

    function handleCloseImport() {
        setIsImportOpen(false);
        setImportData({ file: undefined, pairs: [], errors: '' });
    }

    function handleExport() {
        if (simulationStore.type === 'success') {
            const exportSimulations = searchSimulations.map(({ index }) => simulationStore.value.data.pairs[index]);

            downloadFile(JSON.stringify(exportSimulations, null, 2), 'test.json');
        }
    }

    function handleExample() {
        downloadFile(JSON.stringify(exampleData, null, 2), 'example.json');
    }

    function handleSimulationEditButtonClick(index: number) {
        return () => onChange(index, 'edit');
    }

    function handleSimulationDeleteButtonClick(index: number) {
        return (e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            onDelete(index);
        };
    }

    function handleAdd() {
        onChange(undefined, 'new');
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
                        className={cn('delete-btn', { disabled: !statusState })}
                        type="button"
                        disabled={!statusState}
                        onClick={handleSimulationDeleteButtonClick(index)}
                    >
                        <DeleteIcon />
                    </button>
                </div>
            </li>
        ));

    return (
        <>
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
                        <Button
                            className={cn('menu-button')}
                            sizeAll="small"
                            type="outline"
                            actionType="button"
                            onClick={handleExport}
                            disabled={!searchSimulations.length}
                        >
                            Export
                        </Button>
                        <Button
                            className={cn('menu-button')}
                            sizeAll="small"
                            type="outline"
                            actionType="button"
                            onClick={handleOpenImport}
                        >
                            Import
                        </Button>
                        <Button
                            className={cn('menu-button', { example: true })}
                            sizeAll="small"
                            type="outline"
                            theme="black"
                            actionType="button"
                            onClick={handleExample}
                        >
                            Example
                        </Button>
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
            </div>
            <Popup
                classes={{ root: cn('import-popup'), wrapper: cn('import-popup-wrapper') }}
                open={isImportOpen}
                onClose={handleCloseImport}
            >
                <div className={cn('import-wrapper')}>
                    <Header className={cn('import-title')} as="h2">
                        Import
                    </Header>
                    <section className="container">
                        <div {...getRootProps({ className: cn('import-dropzone') })}>
                            <input {...getInputProps()} />
                            <p>Drag &apos;n&apos; drop json file here, or click to select file</p>
                        </div>
                    </section>
                    {importData.errors && (
                        <div className={cn('import-errors')} dangerouslySetInnerHTML={{ __html: importData.errors }} />
                    )}
                    {importData.pairs.length !== 0 && (
                        <div className={cn('import-pairs')}>File have {importData.pairs.length} valid simulations</div>
                    )}
                    <div className={cn('import-buttons')}>
                        <Button
                            disabled={importData.pairs.length === 0}
                            actionType="button"
                            onClick={handleImportPairs('replace')}
                        >
                            Import
                        </Button>
                    </div>
                </div>
            </Popup>
        </>
    );
};

export default Simulations;

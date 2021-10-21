import React from 'react';
import { Collapse, Header } from '@megafon/ui-core';
import { cnCreate } from '@megafon/ui-helpers';
import { ReactComponent as ArrowDown } from '@megafon/ui-icons/system-16-arrow-list_down_16.svg';
import { ReactComponent as ArrowUp } from '@megafon/ui-icons/system-16-arrow-list_up_16.svg';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import type { JournalItem } from 'api/types';
import './JournalRow.pcss';

const cn = cnCreate('journal-row');
const JournalRow: React.FC<JournalItem> = props => {
    const { request, response, latency, mode, timeStarted } = props;

    const [isOpen, setIsOpen] = React.useState<boolean>(false);

    function handleClick() {
        setIsOpen(prev => !prev);
    }

    return (
        <>
            <tr className={cn('row')} onClick={handleClick}>
                <td className={cn('td')} width={20}>
                    {isOpen ? <ArrowUp /> : <ArrowDown />}
                </td>
                <td className={cn('td')}>{request.method}</td>
                <td className={cn('td')}>{request.path}</td>
                <td className={cn('td')} />
                <td className={cn('td')}>{response.status}</td>
                <td className={cn('td')}>{mode}</td>
                <td className={cn('td')}>{formatDistanceToNow(new Date(timeStarted), { addSuffix: true })}</td>
                <td className={cn('td')}>{latency.toFixed(2)} ms</td>
            </tr>
            <tr className={cn('row-content')}>
                <td colSpan={8}>
                    <Collapse className="" classNameContainer="" isOpened={isOpen}>
                        <div className={cn('content')}>
                            <div className={cn('content-row')}>
                                <div className={cn('param')}>
                                    <div className={cn('param-name')}>Timesamp</div> [some content]
                                </div>
                            </div>
                            <div className={cn('content-row')}>
                                <Header className={cn('row-header')} as="h3">
                                    Request
                                </Header>
                                <div className={cn('param')}>
                                    <div className={cn('param-name')}>Method</div> {request.method}
                                </div>
                                <div className={cn('param')}>
                                    <div className={cn('param-name')}>Path</div> {request.path}
                                </div>
                                <div className={cn('param')}>
                                    <div className={cn('param-name')}>Query</div> {request.query}
                                </div>
                                <div className={cn('param')}>
                                    <div className={cn('param-name')}>Headers</div> {JSON.stringify(request.headers)}
                                </div>
                            </div>
                            <div className={cn('content-row')}>
                                <Header className={cn('row-header')} as="h3">
                                    Response
                                </Header>
                                <div className={cn('param')}>
                                    <div className={cn('param-name')}>Status code</div> {response.status}
                                </div>
                                <div className={cn('param')}>
                                    <div className={cn('param-name')}>Headers</div> {JSON.stringify(response.headers)}
                                </div>
                                <div className={cn('param')}>
                                    <div className={cn('param-name')}>Encoded body</div> {response.encodedBody}
                                </div>
                                <div>
                                    <div className={cn('param-name')}>Body</div>
                                    <div className={cn('param-body')}>{response.body}</div>
                                </div>
                            </div>
                        </div>
                    </Collapse>
                </td>
            </tr>
        </>
    );
};

export default JournalRow;

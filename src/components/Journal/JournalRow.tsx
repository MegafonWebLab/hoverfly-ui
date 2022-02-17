import React from 'react';
import { Collapse } from '@megafon/ui-core';
import { cnCreate } from '@megafon/ui-helpers';
import { ReactComponent as ArrowDown } from '@megafon/ui-icons/system-16-arrow-list_down_16.svg';
import { ReactComponent as ArrowRight } from '@megafon/ui-icons/system-16-arrow-list_right_16.svg';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { Controlled as CodeMirror } from 'react-codemirror2';
import type { JournalItem } from 'api/types';
import './JournalRow.pcss';
import 'codemirror/lib/codemirror.css';
import { MirrorBodyType, hightlightHtml } from 'utils';
import { getCodeMirrorConfig } from '../Simulations/utils';
import { getDate, getTimestamp } from './utils';

require('codemirror/mode/xml/xml');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/htmlmixed/htmlmixed');

const cn = cnCreate('journal-row');
const JournalRow: React.FC<JournalItem & { bodyWidth: string }> = props => {
    const { request, response, latency, mode, timeStarted, bodyWidth } = props;
    const isGet = request.method === 'GET';

    const [isOpen, setIsOpen] = React.useState<boolean>(false);
    const [bodyType, setBodyType] = React.useState<MirrorBodyType>('json');

    function handleClick() {
        setIsOpen(prev => !prev);
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    function handleChange() {}

    React.useEffect(() => {
        setBodyType(hightlightHtml(response.body).language as MirrorBodyType);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <tr className={cn('row')} onClick={handleClick}>
                <td className={cn('td', { icon: true })} width={40}>
                    <div className={cn('icon-wrapper')}>
                        {isOpen ? <ArrowDown className={cn('icon')} /> : <ArrowRight className={cn('icon')} />}
                    </div>
                </td>
                <td className={cn('td', { method: true, green: isGet, orange: !isGet })}>{request.method}</td>
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
                                    <div className={cn('param-name')}>Timesamp</div>{' '}
                                    {getTimestamp(getDate(timeStarted))}
                                </div>
                                <div className={cn('param')}>
                                    <div className={cn('param-name')}>Status</div> {response.status}
                                </div>
                                <div className={cn('param')}>
                                    <div className={cn('param-name')}>Method</div> {request.method}
                                </div>
                                <div className={cn('param')}>
                                    <div className={cn('param-name')}>Route</div> {request.path}
                                </div>
                                {request.query && (
                                    <div className={cn('param')}>
                                        <div className={cn('param-name')}>Query</div> {request.query}
                                    </div>
                                )}
                                <div className={cn('param')}>
                                    <div className={cn('param-name')}>Request headers</div>{' '}
                                    {JSON.stringify(request.headers)}
                                </div>
                                <div className={cn('param')}>
                                    <div className={cn('param-name')}>Response Headers</div>{' '}
                                    {JSON.stringify(response.headers)}
                                </div>
                                <div>
                                    <div className={cn('param-body')} style={{ width: bodyWidth || '0' }}>
                                        <CodeMirror
                                            value={response.body}
                                            options={{
                                                ...getCodeMirrorConfig(bodyType),
                                                lineNumbers: false,
                                            }}
                                            onBeforeChange={handleChange}
                                        />
                                    </div>
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

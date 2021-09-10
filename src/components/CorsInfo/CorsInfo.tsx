import React from 'react';
import { Header } from '@megafon/ui-core';
import { cnCreate } from '@megafon/ui-helpers';
import { useSelector } from 'store/hooks';
import './CorsInfo.pcss';

const cn = cnCreate('cors-info');
const CorsInfo: React.FC = () => {
    const main = useSelector(state => state.main);
    const corsList =
        main.type === 'success' ? Object.entries(main.value.cors).map(([key, value]) => ({ key, value })) : [];

    return (
        <div className={cn()}>
            <Header className={cn('title')} as="h3">
                Cors
            </Header>
            <table className={cn('table')}>
                {corsList.map(({ key, value }) => (
                    <tr key={key}>
                        <td className={cn('cell')} width="35%">
                            {key}:
                        </td>
                        <td className={cn('cell')}>{String(value)}</td>
                    </tr>
                ))}
            </table>
        </div>
    );
};

export default CorsInfo;

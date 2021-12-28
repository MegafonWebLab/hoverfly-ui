import React from 'react';
import { cnCreate } from '@megafon/ui-helpers';
import { useSelector } from 'store/hooks';
import './CorsInfo.pcss';
import AccordionWrapper from 'components/AccordionWrapper/AccordionWrapper';

const cn = cnCreate('cors-info');
const CorsInfo: React.FC = () => {
    const main = useSelector(state => state.main);
    const corsList =
        main.type === 'success' ? Object.entries(main.value.cors).map(([key, value]) => ({ key, value })) : [];

    return (
        <div className={cn()}>
            <AccordionWrapper title="CORS">
                <table className={cn('table')}>
                    <tbody>
                        {corsList.map(({ key, value }) => (
                            <tr key={key}>
                                <td className={cn('cell')} width="35%">
                                    {key}:
                                </td>
                                <td className={cn('cell')}>{String(value)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </AccordionWrapper>
        </div>
    );
};

export default CorsInfo;

import './TopBar.pcss';
import { Grid, GridColumn } from '@megafon/ui-core';
import { cnCreate } from '@megafon/ui-helpers';
import { useSelector } from '../../store/hooks';

const cn = cnCreate('topbar');
const TopBar: React.FC = () => {
    const mainInfo = useSelector(state => state.main);
    if (mainInfo.type === 'success') {
        // eslint-disable-next-line no-console
        console.log(mainInfo.value);
    }

    return (
        <Grid className={cn()}>
            <GridColumn>logo version server, version ui</GridColumn>
            <GridColumn>clear cache button, shutdown button</GridColumn>
        </Grid>
    );
};

export default TopBar;

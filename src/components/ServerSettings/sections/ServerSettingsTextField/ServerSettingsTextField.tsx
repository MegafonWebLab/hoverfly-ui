import React from 'react';
import { Grid, GridColumn, Header, TextField } from '@megafon/ui-core';
import { TGridSizeValues } from '@megafon/ui-core/dist/lib/components/Grid/GridColumn';
import { cnCreate } from '@megafon/ui-helpers';
import './ServerSettingsTextField.pcss';

type Props = {
    title: string;
    value: string;
    placeholder?: string;
    fieldSize?: TGridSizeValues;
    headerSize?: TGridSizeValues;
    textarea?: boolean;
    onChange: (e: React.ChangeEvent) => void;
};

const cn = cnCreate('server-settings-text-field');
const ServerSettingsTextField: React.FC<Props> = ({
    title,
    value,
    placeholder,
    onChange,
    fieldSize = '10',
    headerSize = '2',
    textarea,
}): JSX.Element => (
    <Grid className={cn('mode', { textarea })} hAlign="between" vAlign={textarea ? 'top' : 'center'}>
        <GridColumn all={headerSize}>
            <Header className={cn('mode-title')} as="h5">
                {title}
            </Header>
        </GridColumn>
        <GridColumn all={fieldSize} mobile="9">
            <TextField
                className={cn('field')}
                classes={{ input: cn('input', { textarea }) }}
                value={value}
                placeholder={placeholder}
                textarea={textarea && 'fixed'}
                onChange={onChange}
            />
        </GridColumn>
    </Grid>
);

export default ServerSettingsTextField;

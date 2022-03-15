import React from 'react';
import { TextLink } from '@megafon/ui-core';
import { cnCreate } from '@megafon/ui-helpers';
import './Footer.pcss';

const GITHUB_LINK = 'https://github.com/MegafonWebLab';
const SPECTOLAB_LINK = 'https://specto.io';
const cn = cnCreate('footer');
const Footer: React.FC = () => (
    <footer className={cn()}>
        <span>
            UI Developed with ❤️ by{' '}
            <TextLink color="blue" href={SPECTOLAB_LINK} target="_blank" rel="noopener noreferrer">
                SpectoLabs
            </TextLink>
            , UI by{' '}
            <TextLink color="blue" href={GITHUB_LINK} target="_blank" rel="noopener noreferrer">
                MegaFon
            </TextLink>
        </span>
    </footer>
);

export default Footer;

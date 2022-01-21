/* eslint-disable react/jsx-no-bind */
import React from 'react';
import { cnCreate } from '@megafon/ui-helpers';
import { ReactComponent as HomeIcon } from '@megafon/ui-icons/basic-16-home_16.svg';
import { ReactComponent as SettingsIcon } from '@megafon/ui-icons/basic-16-settings_16.svg';
import { ReactComponent as SocialIcon } from '@megafon/ui-icons/basic-16-social_16.svg';
import { NavLink } from 'react-router-dom';
import './Navigation.pcss';

const cn = cnCreate('navigation');
const setActiveLink = ({ isActive }: any) => (isActive ? cn('link', { active: true }) : cn('link'));

const Navigation: React.FC = () => (
    <nav className={cn()}>
        <NavLink className={setActiveLink} to="/">
            <HomeIcon className={cn('icon')} />
        </NavLink>
        <NavLink className={setActiveLink} to="/simulations">
            <SocialIcon className={cn('icon')} />
        </NavLink>
        <NavLink className={setActiveLink} to="/settings">
            <SettingsIcon className={cn('icon')} />
        </NavLink>
    </nav>
);

export default Navigation;

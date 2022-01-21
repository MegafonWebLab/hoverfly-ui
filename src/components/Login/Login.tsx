import React from 'react';
import { Button, Header, TextField } from '@megafon/ui-core';
import { cnCreate } from '@megafon/ui-helpers';
import type { AuthRequest } from 'api/types';
import { getAuthorizeAsync } from 'store/auth/authSlice';
import { useDispatch } from 'store/hooks';
import './Login.pcss';

const cn = cnCreate('login');
const Login: React.FC = () => {
    const dispatch = useDispatch();

    const [formState, setFormState] = React.useState<AuthRequest>({ username: '', password: '' });

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        dispatch(getAuthorizeAsync(formState));
    }

    function handleChange(name: keyof AuthRequest) {
        return (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormState(prev => ({ ...prev, [name]: e.target.value }));
        };
    }

    return (
        <div className={cn()}>
            <div className={cn('wrapper')}>
                <Header className={cn('title')} as="h1">
                    Welcome to Hoverfly MF Edition
                </Header>
                <Header className={cn('title')} as="h2">
                    Login
                </Header>
                <form className={cn('form')} onSubmit={handleSubmit}>
                    <div className={cn('fields')}>
                        <TextField
                            classes={{
                                input: cn('input'),
                            }}
                            className={cn('field')}
                            value={formState.username}
                            onChange={handleChange('username')}
                            placeholder="Email or username"
                        />
                        <TextField
                            classes={{
                                input: cn('input'),
                            }}
                            className={cn('field')}
                            type="password"
                            value={formState.password}
                            onChange={handleChange('password')}
                            placeholder="Password"
                        />
                    </div>
                    <Button actionType="submit" fullWidth>
                        Login
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default Login;

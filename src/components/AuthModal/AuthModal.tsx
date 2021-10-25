import React from 'react';
import { Button, Header, TextField } from '@megafon/ui-core';
import { cnCreate } from '@megafon/ui-helpers';
import Modal from 'react-modal';
import type { AuthRequest } from 'api/types';
import { getAuthorizeAsync } from 'store/auth/authSlice';
import { useDispatch, useSelector } from 'store/hooks';
import './AuthModal.pcss';

const HEIGHT_DELIMETER = 3;

const cn = cnCreate('auth-modal');
const AuthModal: React.FC = () => {
    const isNeedAuth = useSelector(state => state.auth.isNeedAuth);
    const dispatch = useDispatch();

    const [formState, setFormState] = React.useState<AuthRequest>({ username: '', password: '' });
    const [offsetTop, setOffsetTop] = React.useState<number>(0);
    const nodeWrapperRef = React.useRef<HTMLDivElement | null>(null);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        dispatch(getAuthorizeAsync(formState));
    }

    function handleChange(name: keyof AuthRequest) {
        return (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormState(prev => ({ ...prev, [name]: e.target.value }));
        };
    }

    React.useEffect(() => {
        const gutter = 20;
        let heightWrapper = 0;
        const screenHeight = window.innerHeight;
        const scrollValue = window.pageYOffset;

        if (nodeWrapperRef.current) {
            heightWrapper = nodeWrapperRef.current.offsetHeight;
        }

        if (heightWrapper > screenHeight && gutter) {
            setOffsetTop(scrollValue + gutter);

            return;
        }

        setOffsetTop(scrollValue + (screenHeight - heightWrapper) / HEIGHT_DELIMETER);
    }, [isNeedAuth]);

    return (
        <Modal
            isOpen={isNeedAuth}
            className={cn('content')}
            portalClassName={cn()}
            overlayClassName={cn('overlay')}
            bodyOpenClassName="popup-open"
            style={{
                content: { marginTop: `${offsetTop}px` },
            }}
            ariaHideApp={false}
        >
            <div className={cn('wrapper')}>
                <Header as="h2">Authorize</Header>
                <form onSubmit={handleSubmit}>
                    <div className={cn('fields')}>
                        <TextField label="Name" value={formState.username} onChange={handleChange('username')} />
                        <TextField
                            label="Password"
                            type="password"
                            value={formState.password}
                            onChange={handleChange('password')}
                        />
                    </div>
                    <Button actionType="submit" fullWidth>
                        Submit
                    </Button>
                </form>
            </div>
            <div className={cn('background')} />
        </Modal>
    );
};

export default AuthModal;

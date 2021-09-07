import React from 'react';
import './App.css';
import { useDispatch } from '../../store/hooks';
import { loadMainAsync } from '../../store/main/mainSlice';
import TopBar from '../TopBar/TopBar';

function App(): JSX.Element {
    const dispatch = useDispatch();

    React.useEffect(() => {
        dispatch(loadMainAsync());
    }, [dispatch]);

    return (
        <div>
            <TopBar />
            <div>Hoverfly-ui</div>
        </div>
    );
}

export default App;

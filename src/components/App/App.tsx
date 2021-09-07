import React from 'react';
import './App.css';
import TopBar from 'components/TopBar/TopBar';
import { useDispatch } from 'store/hooks';
import { loadMainAsync } from 'store/main/mainSlice';

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

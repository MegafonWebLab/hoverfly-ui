import React from 'react';
import './App.pcss';
import Footer from 'components/Footer/Footer';
import ContentLayout from 'components/layouts/ContentLayout/ContentLayout';
import Layout from 'components/layouts/Layout/Layout';
import ServerSettings from 'components/ServerSettings/ServerSettings';
import TopBar from 'components/TopBar/TopBar';
import { useDispatch } from 'store/hooks';
import { fetchStatusAsync } from 'store/status/statusSlice';
import AuthModal from '../AuthModal/AuthModal';

function App(): JSX.Element {
    const dispatch = useDispatch();

    React.useEffect(() => {
        dispatch(fetchStatusAsync());
    }, [dispatch]);

    return (
        <>
            <Layout>
                <TopBar />
                <ContentLayout>
                    <ServerSettings />
                </ContentLayout>
                <Footer />
            </Layout>
            <AuthModal />
        </>
    );
}

export default App;

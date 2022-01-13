import React from 'react';
import './App.pcss';
import { positions, Provider as AlertProvider } from 'react-alert';
import Footer from 'components/Footer/Footer';
import AlertLayout from 'components/layouts/AlertLayout/AlertLayout';
import ContentLayout from 'components/layouts/ContentLayout/ContentLayout';
import Layout from 'components/layouts/Layout/Layout';
import Notification from 'components/Notification/Notification';
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
        <AlertProvider template={Notification} timeout={5000} position={positions.TOP_RIGHT} offset="5px">
            <AlertLayout>
                <Layout>
                    <TopBar />
                    <ContentLayout>
                        <ServerSettings />
                    </ContentLayout>
                    <Footer />
                </Layout>
                <AuthModal />
            </AlertLayout>
        </AlertProvider>
    );
}

export default App;

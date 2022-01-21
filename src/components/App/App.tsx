import React from 'react';
import './App.pcss';
import { cnCreate } from '@megafon/ui-helpers';
import { positions, Provider as AlertProvider } from 'react-alert';
import { Routes, Route } from 'react-router-dom';
import Dashboard from 'components/Dashboard/Dashboard';
import Footer from 'components/Footer/Footer';
import AlertLayout from 'components/layouts/AlertLayout/AlertLayout';
import ContentLayout from 'components/layouts/ContentLayout/ContentLayout';
import Layout from 'components/layouts/Layout/Layout';
import Login from 'components/Login/Login';
import Navigation from 'components/Navigation/Navigation';
import Notification from 'components/Notification/Notification';
import ServerSettings from 'components/ServerSettings/ServerSettings';
import Simulations from 'components/Simulations/Simulations';
import TopBar from 'components/TopBar/TopBar';
import { useDispatch } from 'store/hooks';
import { fetchStatusAsync } from 'store/status/statusSlice';

const cn = cnCreate('app');
function App(): JSX.Element {
    const dispatch = useDispatch();

    React.useEffect(() => {
        dispatch(fetchStatusAsync());
    }, [dispatch]);

    return (
        <div className={cn()}>
            <AlertProvider template={Notification} timeout={5000} position={positions.TOP_RIGHT} offset="5px">
                <AlertLayout>
                    <Layout>
                        <TopBar />
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route
                                path="*"
                                element={
                                    <div className={cn('middle')}>
                                        <aside className={cn('aside')}>
                                            <Navigation />
                                        </aside>
                                        <main className={cn('main')}>
                                            <ContentLayout>
                                                <Routes>
                                                    <Route path="/" element={<Dashboard />} />
                                                    <Route path="/simulations" element={<Simulations />} />
                                                    <Route path="/settings" element={<ServerSettings />} />
                                                </Routes>
                                            </ContentLayout>
                                        </main>
                                    </div>
                                }
                            />
                        </Routes>
                        <Footer />
                    </Layout>
                </AlertLayout>
            </AlertProvider>
        </div>
    );
}

export default App;

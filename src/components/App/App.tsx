import React from 'react';
import './App.pcss';
import { cnCreate } from '@megafon/ui-helpers';
import { positions, Provider as AlertProvider } from 'react-alert';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Dashboard from 'components/Dashboard/Dashboard';
import Footer from 'components/Footer/Footer';
import AlertLayout from 'components/layouts/AlertLayout/AlertLayout';
import ContentLayout from 'components/layouts/ContentLayout/ContentLayout';
import Layout from 'components/layouts/Layout/Layout';
import Login from 'components/Login/Login';
import Navigation from 'components/Navigation/Navigation';
import Notification from 'components/Notification/Notification';
import ServerOffline from 'components/ServerOffline/ServerOffline';
import ServerSettings from 'components/ServerSettings/ServerSettings';
import SimulationsWrapper from 'components/Simulations/SimulationsWrapper';
import TopBar from 'components/TopBar/TopBar';
import { useDispatch, useSelector } from 'store/hooks';
import { loadMainAsync } from 'store/main/mainSlice';
import { fetchStatusAsync } from 'store/status/statusSlice';

type LocationState = {
    referrer?: string;
};

const cn = cnCreate('app');
function App(): JSX.Element {
    const dispatch = useDispatch();
    const nav = useNavigate();
    const location = useLocation();
    const isNeedAuth = useSelector(state => state.auth.isNeedAuth);

    React.useEffect(() => {
        dispatch(fetchStatusAsync());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        if (location.state && (location?.state as LocationState).referrer === '/login') {
            dispatch(loadMainAsync());
        }
    }, [location.state, dispatch]);

    React.useEffect(() => {
        if (isNeedAuth) {
            nav('/login');

            return;
        }
        if (window.location.pathname === '/login') {
            nav('/', { state: { referrer: location.pathname } });
        }
    }, [isNeedAuth, nav, location.pathname]);

    return (
        <div className={cn()}>
            <AlertProvider template={Notification} timeout={5000} position={positions.TOP_RIGHT} offset="5px">
                <AlertLayout>
                    <Layout>
                        <Routes>
                            <Route
                                path="/login"
                                element={
                                    <>
                                        <TopBar isLogin />
                                        <Login />
                                    </>
                                }
                            />
                            <Route
                                path="*"
                                element={
                                    <>
                                        <TopBar />
                                        <div className={cn('middle')}>
                                            <aside className={cn('aside')}>
                                                <Navigation />
                                            </aside>
                                            <main className={cn('main')}>
                                                <ContentLayout>
                                                    <ServerOffline />
                                                    <Routes>
                                                        <Route path="/" element={<Dashboard />} />
                                                        <Route path="/simulations/*" element={<SimulationsWrapper />} />
                                                        <Route path="/settings" element={<ServerSettings />} />
                                                        <Route path="/*" element={<Navigate to="/" />} />
                                                    </Routes>
                                                </ContentLayout>
                                            </main>
                                        </div>
                                    </>
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

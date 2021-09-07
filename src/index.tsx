import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import './styles/normalize.pcss';
import './styles/variables.pcss';
import './styles/media.pcss';
import App from './components/App/App';
import { store } from './store';

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <App />
        </Provider>
    </React.StrictMode>,
    document.getElementById('root'),
);

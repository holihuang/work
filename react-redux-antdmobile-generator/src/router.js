import React from 'react';
import ReactDom from 'react-dom';
import { Router } from 'react-router';

import routes from './routes.jsx';

const AppRouter = props => (<Router routes={routes} history={props.history}/>)

export default AppRouter



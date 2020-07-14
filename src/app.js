import React, { useEffect, useReducer } from 'react';
import { Router, Switch, Route, Redirect } from 'react-router-dom';
import createPersistedReducer from 'use-persisted-reducer';
import LogRocket from 'logrocket';

import history from './helper/history';
import Context from './helper/context';
import generalReducer from './utils/generalReducer';
import {
  Dashboard,
  Group,
  SubGroup,
  Bookmark,
  LandingPage,
  AdminPanel,
  Test,
} from './components';
import Notification from './components/shared/Notification';
import checkAuth from './helper/redirections';
require('./assets/images/favicon.ico');

LogRocket.init('6vridg/test');

function App(props) {
  const usePersistedReducer = createPersistedReducer('state');
  const [store, dispatch] = usePersistedReducer(generalReducer, {});

  useEffect(() => {}, []);

  // console.log('store', store);
  return (
    <Context.Provider value={{ dispatch, store }}>
      <Router history={history}>
        <Switch>
          <Route
            path="/user/:id/group/:group/subgroup/:subgroup/bookmark/:bookmark"
            render={() =>
              checkAuth() ? <Redirect to="/bookmark" /> : <Bookmark />
            }
          />
          <Route
            path="/user/:id/group/:group/subgroup/:subgroup"
            render={() =>
              checkAuth() ? <Redirect to="/bookmark" /> : <SubGroup />
            }
          />
          <Route
            path="/user/:id/group/:group"
            render={() =>
              checkAuth() ? <Redirect to="/bookmark" /> : <Group />
            }
          />
          <Route
            path="/user/:id/admin"
            render={() =>
              !store.isAdmin || checkAuth() ? (
                <Redirect to="/bookmark" />
              ) : (
                <AdminPanel />
              )
            }
          />
          <Route
            path="/user/:id"
            render={() =>
              checkAuth() ? <Redirect to="/bookmark" /> : <Dashboard />
            }
          />
          <Route
            path="/test"
            render={() =>
              checkAuth() ? <Redirect to="/bookmark" /> : <Test />
            }
          />
          <Route path="/bookmark" component={LandingPage} />
          <Redirect from="/" to="/bookmark" />
        </Switch>
      </Router>
      <Notification />
    </Context.Provider>
  );
}

export default App;

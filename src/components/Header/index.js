import React, { useState, useEffect } from 'react';
import { Grid, Link, Typography } from '@material-ui/core';
import { withRouter } from 'react-router-dom';
import { get } from 'lodash';

import checkAuth from './../../helper/redirections';
import SVG from './../../helper/customizeIcon';

import imageLogo from './../../assets/images/logo.svg';
import imageAvatar from './../../assets/images/avatar.svg';

import './header.sass';

function Head(props) {
  const links = {
    signUp: {
      title: 'Sign Up',
      route: '/bookmark/sign-up',
    },
    logOut: {
      title: 'Log Out',
      route: '/bookmark',
    },
  };

  const handleLogOut = () => localStorage.setItem('login', null);

  const resolveLink = () => (checkAuth() ? links.signUp : links.logOut);

  const history = get(props, 'history');

  const [title, setTitle] = useState('Sign Up');
  const [route, setRoute] = useState('/bookmark/sign-up');
  const [login, setLogin] = useState(
    get(JSON.parse(localStorage.getItem('login')), 'token')
  );

  useEffect(() => {
    if (login) {
      const { title, route } = resolveLink();
      setTitle(title);
      setRoute(route);
    }
  });

  const resolveOnClickLink = () => {
    switch (title) {
      case 'Log Out':
        handleLogOut();
        break;
      case 'Sign Up':
        history.push(route);
        break;
      default:
        handleLogOut();
    }
  };

  //console.log('props Header', props);
  return (
    <div className="wrapper-header">
      <Grid container spacing={0} justify="center">
        <Grid item xs={10} sm={10} className="container-header">
          <Grid item xs={10} sm={10} className="container-info">
            <Grid item xs={2} sm={2} className="container-info-logo">
              <SVG
                className="info-logo"
                width="64px"
                height="64px"
                source={imageLogo}
              />
            </Grid>
            <Grid item xs={10} sm={10} className="container-info-title">
              <Typography className="info-title">Bookmark's</Typography>
            </Grid>
          </Grid>
          <Grid item xs={2} sm={2} className="container-link">
            {!checkAuth() && (
              <SVG
                className="link-avatar"
                width="48px"
                height="48px"
                source={imageAvatar}
              />
            )}
            <Link
              href={route}
              className="link-auth"
              onClick={resolveOnClickLink}
              style={{ color: '#470b2f' }}
            >
              <Typography className="link-title">{title}</Typography>
            </Link>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

export default withRouter(Head);

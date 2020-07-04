import React, { useState } from 'react';
import { Grid, Typography, TextField, Button } from '@material-ui/core';
import { LoginOutlined } from '@ant-design/icons';
import { withRouter, Link } from 'react-router-dom';
import axios from 'axios';
import { get } from 'lodash';

import { Head } from './../../components';
import { API } from '../../helper/constants';
import connect from './../../utils/connectFunction';
import action from './../../utils/actions';

import './landingPage.sass';

function LandingPage(props) {
  // console.log('props LandingPage', props);

  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  const userId = get(JSON.parse(localStorage.getItem('login')), 'user_id');

  const inputFields = [
    {
      label: 'email',
      type: 'email',
      placeholder: 'your@email.com',
    },
    {
      label: 'password',
      type: 'password',
      placeholder: 'your password',
    },
  ];

  const handleChange = (value, label) => {
    switch (label) {
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
    }
  };

  const handleSubmit = async event => {
    event.preventDefault();
    const payload = {
      email,
      password,
    };
    const loginUser = await axios({
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      url: `${API.URL[process.env.NODE_ENV]}/login`,
      mode: 'cors',
      cache: 'default',
      data: payload,
    }).catch(e => {
      const data = get(e, 'response.data');
      props.dispatchErrorNotifiction('errorNotification', data);
    });
    const data = get(loginUser, 'data');
    const user_id = get(loginUser, 'data.user_id');
    if (data) {
      localStorage.setItem('login', JSON.stringify(data));
      props.history.push(`/user/${user_id}`);
      props.dispatchSuccessNotifiction('successNotification', {
        message: data.message,
      });
    }
  };

  return (
    <div className="wrapper-landing-page">
      <Grid container spacing={0} justify="center">
        <Grid item xs={12} sm={12}>
          <div className="container-landing">
            <Head />
            <Grid container spacing={0} justify="center">
              <Grid item xs={6} sm={6}>
                <div className="landing-login">
                  {userId ? (
                    <div className="landing-go">
                      <Link to={`/user/${userId}`}>
                        <LoginOutlined
                          style={{ fontSize: '60px', color: 'green' }}
                        />
                        <Typography
                          variant="h4"
                          className="landing-go-title"
                          style={{ color: 'green' }}
                        >
                          Go
                        </Typography>
                      </Link>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      {inputFields.map((each, id) => (
                        <TextField
                          key={id}
                          id={each.label}
                          name={each.label}
                          label={each.label.toUpperCase()}
                          placeholder={each.placeholder}
                          inputProps={{
                            type: each.type,
                          }}
                          onChange={e =>
                            handleChange(e.target.value, each.label)
                          }
                          style={{
                            marginBottom: '5px',
                          }}
                          fullWidth
                        />
                      ))}
                      <Button type="submit" variant="contained" color="primary">
                        Log In / Sign Up
                      </Button>
                    </form>
                  )}
                </div>
              </Grid>
              <Grid item xs={6} sm={6}>
                <div className="landing-about">
                  <Typography className="landing-about-content">
                    Application allows efficient manage bookmarks of materials
                    which was chosen by you
                  </Typography>
                </div>
              </Grid>
            </Grid>
          </div>
        </Grid>
      </Grid>
    </div>
  );
}

const mapStateToProps = state => {
  return { store: state };
};

const mapDispatchToProps = dispatch => {
  const actionData = (name, payload) => dispatch(action(name, payload));
  return {
    dispatchErrorNotifiction: actionData,
    dispatchSuccessNotifiction: actionData,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(LandingPage));

import React, { useEffect } from 'react';
import { withRouter } from 'react-router-dom';

import connect from './../../utils/connectFunction';
import action from './../../utils/actions';

function Test(props) {
  // console.log('Test props', props);

  useEffect(() => {
    props.dispatchErrorNotifiction('errorNotification', { message: 'test' });
  }, []);

  return <h1>Test</h1>;
}

const mapStateToProps = state => {
  // console.log('Test state');
  return { store: state };
};

const mapDispatchToProps = dispatch => {
  const actionData = (name, payload) => dispatch(action(name, payload));
  return {
    dispatchFetchGroup: actionData,
    dispatchErrorNotifiction: actionData,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Test));

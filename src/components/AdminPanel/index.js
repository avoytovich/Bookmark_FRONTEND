import React, { useEffect, useState } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { Grid, Typography } from '@material-ui/core';
import { Table, Space, Button } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { get } from 'lodash';

import connect from './../../utils/connectFunction';
import action from './../../utils/actions';
import { wrapRequest } from './../../utils/api';
import { API } from './../../helper/constants';
import Head from './../Header';

import './adminPage.sass';

function AdminPage(props) {
  // console.log('AdminPage props', props);

  const [usersList, setUsersList] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [exec, setExec] = useState(false);

  const user_id = get(props, 'match.params.id');

  useEffect(() => {
    const fetchUser = async () => {
      const getUser = await wrapRequest({
        method: 'GET',
        url: `${API.URL[process.env.NODE_ENV]}/user/${user_id}/user_list`,
        mode: 'cors',
        cache: 'default',
      });
      const listUsers = get(getUser, 'data.users');
      setUsersList(listUsers);
    };
    fetchUser();
  }, [exec]);

  const columns = [
    {
      title: 'Users',
      dataIndex: 'email',
      render: text => text,
    },
    {
      title: 'isActivated',
      dataIndex: 'isActivated',
      render: text => text.toString(),
    },
    {
      title: 'Action',
      align: 'center',
      render: (text, record) => {
        return (
          <Space size="middle">
            <Button
              type="primary"
              style={{
                border: 'green',
                backgroundColor: 'green',
              }}
              onClick={() => sendAcceptUserRequest(text.id)}
            >
              Accept
            </Button>
            <Button
              type="primary"
              style={{
                border: 'orange',
                backgroundColor: 'orange',
              }}
              onClick={() => sendDeclineUserRequest(text.id)}
            >
              Decline
            </Button>
            <Button
              type="primary"
              style={{
                border: 'red',
                backgroundColor: 'red',
              }}
              onClick={() => sendDeleteUserRequest(text.id)}
            >
              Delete
            </Button>
          </Space>
        );
      },
    },
  ];

  const data =
    usersList && usersList.map((each, id) => ({ ...each, key: each.id }));

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      // const preDelSubGroups = selectedRows.filter(each => each !== undefined);
      // setDelSubGroups(preDelSubGroups);
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        'selectedRows: ',
        selectedRows
      );
    },
    getCheckboxProps: record => ({
      disabled: record.name === 'Disabled User',
      name: record.name,
    }),
  };

  const sendAcceptUserRequest = async activateUser_id => {
    if (isSending) return;
    setIsSending(true);
    await wrapRequest({
      method: 'POST',
      url: `${API.URL[process.env.NODE_ENV]}/user/${user_id}/user_activate`,
      data: { id: activateUser_id },
      mode: 'cors',
      cache: 'default',
    })
      .then(data => {
        [200, 201].includes(data.status) && setExec(!exec);
        props.dispatchSuccessNotifiction('successNotification', {
          message: data.data.message,
        });
      })
      .catch(e => props.dispatchErrorNotifiction('errorNotification', e));
    setIsSending(false);
  };

  const sendDeclineUserRequest = async declineUser_id => {
    if (isSending) return;
    setIsSending(true);
    await wrapRequest({
      method: 'POST',
      url: `${API.URL[process.env.NODE_ENV]}/user/${user_id}/user_deactivate`,
      data: { id: declineUser_id },
      mode: 'cors',
      cache: 'default',
    })
      .then(data => {
        [200, 201].includes(data.status) && setExec(!exec);
        props.dispatchSuccessNotifiction('successNotification', {
          message: data.data.message,
        });
      })
      .catch(e => props.dispatchErrorNotifiction('errorNotification', e));
    setIsSending(false);
  };

  const sendDeleteUserRequest = async deleteUser_id => {
    if (isSending) return;
    setIsSending(true);
    await wrapRequest({
      method: 'DELETE',
      url: `${API.URL[process.env.NODE_ENV]}/user/${user_id}/user_delete`,
      data: { id: deleteUser_id },
      mode: 'cors',
      cache: 'default',
    })
      .then(data => [200, 201].includes(data.status) && setExec(!exec))
      .catch(e => props.dispatchErrorNotifiction('errorNotification', e));
    setIsSending(false);
  };

  // console.log('usersList', usersList);
  return (
    <div className="wrapper-admin">
      <Grid container spacing={0} justify="center">
        <Grid item xs={12} sm={12}>
          <div className="container-admin">
            <Head />
            <Grid container spacing={8} justify="center">
              <Grid item xs={12} sm={12}>
                <div className="admin-pult">
                  <div className="admin-nav">
                    <Link to={`/user/${user_id}`}>
                      <LeftOutlined />
                      Back
                    </Link>
                    <Typography className="admin-title">Admin Panel</Typography>
                  </div>
                  <div className="admin-manage">
                    {data && (
                      <Table
                        rowSelection={{
                          type: 'checkbox',
                          ...rowSelection,
                        }}
                        columns={columns}
                        dataSource={data}
                      />
                    )}
                  </div>
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
  // console.log('AdminPage state');
  return { store: state };
};

const mapDispatchToProps = dispatch => {
  const actionData = (name, payload) => dispatch(action(name, payload));
  return {
    dispatchFetchGroup: actionData,
    dispatchSuccessNotifiction: actionData,
    dispatchErrorNotifiction: actionData,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(AdminPage));

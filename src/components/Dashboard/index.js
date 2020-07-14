import React, { useState, useEffect, useCallback } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { Grid } from '@material-ui/core';
import 'antd/dist/antd.css';
import { Table } from 'antd';
import { get } from 'lodash';

import Head from './../Header';
import Popover from './../shared/Popover';
import Delete_Confirmation from './../shared/Popover/Delete_Confirmation';
import Add_Group from './../shared/Popover/Add_Group';
import Search from './../shared/Search';
import connect from './../../utils/connectFunction';
import action from './../../utils/actions';
import { API } from './../../helper/constants';
import { wrapRequest } from './../../utils/api';

import './dashboard.sass';

function Dashboard(props) {
  // console.log('Dashboard props', props);

  const [isSending, setIsSending] = useState(false);
  const [execFetch, setExecFetch] = useState(false);
  const [close, setClose] = useState(true);
  const [newGroup, setNewGroup] = useState('');
  const [delGroups, setDelGroups] = useState([]);

  const user_id = get(props, 'match.params.id');

  useEffect(() => {
    const fetchGroup = async () => {
      const getGroup = await wrapRequest({
        method: 'GET',
        url: `${API.URL[process.env.NODE_ENV]}/user/${user_id}/group_list`,
        mode: 'cors',
        cache: 'default',
      });
      const listGroups = get(getGroup, 'data.groups');
      props.dispatchFetchGroup('fetchGroup', listGroups);
    };
    const group = get(JSON.parse(localStorage.getItem('state')), 'groups');
    if (!group || execFetch) {
      fetchGroup();
      setExecFetch(false);
    } else {
      props.dispatchFetchGroup('fetchGroup', group);
    }
  }, [execFetch]);

  useEffect(() => {
    const fetchUser = async () => {
      const getUser = await wrapRequest({
        method: 'GET',
        url: `${API.URL[process.env.NODE_ENV]}/user/${user_id}`,
        mode: 'cors',
        cache: 'default',
      });
      const user = get(getUser, 'data.user');
      user &&
        props.dispatchSetAdmin('setAdmin', user.email == 'levanwork@ukr.net');
    };
    if (!props.store.hasOwnProperty('isAdmin')) {
      fetchUser();
    }
  }, []);

  const groups = get(props, 'store.groups');

  const columns = [
    {
      title: 'Groups',
      dataIndex: 'id',
      render: text => (
        <Link to={`/user/${user_id}/group/${text}`}>
          {groups
            .filter(each => each.id === text)
            .map(each => each.name)
            .join()}
        </Link>
      ),
    },
  ];
  const data = groups && groups.map((each, id) => ({ ...each, key: each.id }));

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      const preDelGroups = selectedRows.filter(each => each !== undefined);
      setDelGroups(preDelGroups);
      // console.log(
      //   `selectedRowKeys: ${selectedRowKeys}`,
      //   'selectedRows: ',
      //   selectedRows
      // );
    },
    getCheckboxProps: record => ({
      disabled: record.name === 'Disabled User',
      name: record.name,
    }),
  };

  const sendAddGroupRequest = useCallback(async () => {
    if (isSending) return;
    setIsSending(true);
    await wrapRequest({
      method: 'POST',
      url: `${API.URL[process.env.NODE_ENV]}/user/${user_id}/group_create`,
      data: { name: newGroup },
      mode: 'cors',
      cache: 'default',
    })
      .then(data => {
        if ([200, 201].includes(data.status)) {
          setExecFetch(true);
          setClose(false);
          props.dispatchSuccessNotifiction('successNotification', {
            message: data.data.message,
          });
        }
      })
      .catch(e => props.dispatchErrorNotifiction('errorNotification', e));
    setIsSending(false);
  }, [newGroup]);

  const handleChangeAddGroup = value => setNewGroup(value);

  const sendDeleteGroupRequest = useCallback(async () => {
    if (isSending) return;
    setIsSending(true);
    await wrapRequest({
      method: 'DELETE',
      url: `${API.URL[process.env.NODE_ENV]}/user/${user_id}/groups_delete`,
      data: delGroups,
      mode: 'cors',
      cache: 'default',
    })
      .then(data => {
        setDelGroups([]);
        [200, 201].includes(data.status) && setExecFetch(true);
      })
      .catch(e => props.dispatchErrorNotifiction('errorNotification', e));
    setIsSending(false);
  }, [delGroups]);

  return (
    <div className="wrapper-dashboard">
      <Grid container spacing={0} justify="center">
        <Grid item xs={12} sm={12}>
          <div className="container-dashboard">
            <Head />
            <Grid container spacing={8} justify="center">
              <Grid item xs={4} sm={4}>
                <div className="dashboard-group">
                  <div className="group-links">
                    {data && (
                      <Table
                        rowSelection={{
                          type: 'checkbox',
                          ...rowSelection,
                        }}
                        columns={columns}
                        dataSource={data}
                        pagination={{ pageSize: 5 }}
                      />
                    )}
                  </div>
                  <div className="group-nav">
                    <Popover title="Delete" color="red">
                      {handleClose => (
                        <Delete_Confirmation
                          facilities={delGroups}
                          sendDeleteRequest={sendDeleteGroupRequest}
                          handleClose={handleClose}
                        />
                      )}
                    </Popover>
                    <Popover title="Add" color="green">
                      {handleClose => (
                        <Add_Group
                          handleChangeAddGroup={handleChangeAddGroup}
                          sendAddGroupRequest={sendAddGroupRequest}
                          close={close}
                          setClose={setClose}
                          handleClose={handleClose}
                        />
                      )}
                    </Popover>
                  </div>
                </div>
              </Grid>
              <Grid item xs={8} sm={8}>
                <Search />
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
    dispatchFetchGroup: actionData,
    dispatchSetAdmin: actionData,
    dispatchErrorNotifiction: actionData,
    dispatchSuccessNotifiction: actionData,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Dashboard));

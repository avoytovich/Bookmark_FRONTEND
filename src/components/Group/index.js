import React, { useEffect, useState, useCallback } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { Grid, Typography } from '@material-ui/core';
import { Table } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { get } from 'lodash';

import connect from './../../utils/connectFunction';
import action from './../../utils/actions';
import { wrapRequest } from './../../utils/api';
import { API } from './../../helper/constants';
import Head from './../Header';
import Popover from './../shared/Popover';
import Delete_Confirmation from './../shared/Popover/Delete_Confirmation';
import Add_SubGroup from './../shared/Popover/Add_SubGroup';
import Search from './../shared/Search';

import './group.sass';

function Group(props) {
  // console.log('Group props', props);

  const [isSending, setIsSending] = useState(false);
  const [execFetch, setExecFetch] = useState(false);
  const [close, setClose] = useState(true);
  const [newSubGroup, setNewSubGroup] = useState('');
  const [delSubGroups, setDelSubGroups] = useState([]);
  const [isSubGroups, setIsSubGroups] = useState(false);

  const user_id = get(props, 'match.params.id');
  const group_id = get(props, 'match.params.group');
  const groups = get(props, 'store.groups');

  useEffect(() => {
    const fetchSubGroup = async () => {
      const getSubGroup = await wrapRequest({
        method: 'GET',
        url: `${
          API.URL[process.env.NODE_ENV]
        }/user/${user_id}/group/${group_id}/subGroup_list`,
        mode: 'cors',
        cache: 'default',
      });
      const listSubGroups = get(getSubGroup, 'data.subGroups');
      props.dispatchFetchSubGroup('fetchSubGroup', listSubGroups, group_id);
      setIsSubGroups(true);
    };
    const subgroup = get(
      JSON.parse(localStorage.getItem('state')),
      `subGroups.${group_id}`
    );
    if (!subgroup || execFetch) {
      fetchSubGroup();
      setExecFetch(false);
    } else {
      props.dispatchFetchSubGroup('fetchSubGroup', subgroup, group_id);
    }
    setIsSubGroups(true);
  }, [execFetch]);

  const subGroups = get(props, `store.subGroups.${group_id}`);

  const columns = [
    {
      title: 'SubGroups',
      dataIndex: 'id',
      render: text => (
        <Link to={`/user/${user_id}/group/${group_id}/subgroup/${text}`}>
          {subGroups
            .filter(each => each.id === text)
            .map(each => each.name)
            .join()}
        </Link>
      ),
    },
  ];

  const data =
    subGroups && subGroups.map((each, id) => ({ ...each, key: each.id }));

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      const preDelSubGroups = selectedRows.filter(each => each !== undefined);
      setDelSubGroups(preDelSubGroups);
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

  const resolveTitle = () =>
    groups
      .filter(each => each.id == group_id)
      .map(each => each.name)
      .join()
      .toUpperCase();

  const sendAddSubGroupRequest = useCallback(async () => {
    if (isSending) return;
    setIsSending(true);
    await wrapRequest({
      method: 'POST',
      url: `${
        API.URL[process.env.NODE_ENV]
      }/user/${user_id}/group/${group_id}/subgroup_create`,
      data: { name: newSubGroup },
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
  }, [newSubGroup]);

  const handleChangeAddSubGroup = value => setNewSubGroup(value);

  const sendDeleteSubGroupRequest = useCallback(async () => {
    if (isSending) return;
    setIsSending(true);
    await wrapRequest({
      method: 'DELETE',
      url: `${
        API.URL[process.env.NODE_ENV]
      }/user/${user_id}/group/${group_id}/subgroup_delete`,
      data: delSubGroups,
      mode: 'cors',
      cache: 'default',
    })
      .then(data => {
        setDelSubGroups([]);
        [200, 201].includes(data.status) && setExecFetch(true);
      })
      .catch(e => props.dispatchErrorNotifiction('errorNotification', e));
    setIsSending(false);
  }, [delSubGroups]);

  return (
    <div className="wrapper-group">
      <Grid container spacing={0} justify="center">
        <Grid item xs={12} sm={12}>
          <div className="container-group">
            <Head />
            <Grid container spacing={8} justify="center">
              <Grid item xs={4} sm={4}>
                {isSubGroups && (
                  <div className="group-subgroup">
                    <div className="group-nav">
                      <Link to={`/user/${user_id}`}>
                        <LeftOutlined />
                        Back
                      </Link>
                      <Typography className="group-title">
                        {resolveTitle()}
                      </Typography>
                    </div>
                    <div className="subgroup-links">
                      <Table
                        rowSelection={{
                          type: 'checkbox',
                          ...rowSelection,
                        }}
                        columns={columns}
                        dataSource={data}
                        pagination={{ pageSize: 5 }}
                      />
                    </div>
                    <div className="group-nav">
                      <Popover title="Delete" color="red">
                        {handleClose => (
                          <Delete_Confirmation
                            facilities={delSubGroups}
                            sendDeleteRequest={sendDeleteSubGroupRequest}
                            handleClose={handleClose}
                          />
                        )}
                      </Popover>
                      <Popover title="Add" color="green">
                        {handleClose => (
                          <Add_SubGroup
                            handleChangeAddSubGroup={handleChangeAddSubGroup}
                            sendAddSubGroupRequest={sendAddSubGroupRequest}
                            close={close}
                            setClose={setClose}
                            handleClose={handleClose}
                          />
                        )}
                      </Popover>
                    </div>
                  </div>
                )}
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
  // console.log('group state', state);
  return { store: state };
};

const mapDispatchToProps = dispatch => {
  const actionData = (name, payload, id) => dispatch(action(name, payload, id));
  return {
    dispatchFetchSubGroup: actionData,
    dispatchErrorNotifiction: actionData,
    dispatchSuccessNotifiction: actionData,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Group));

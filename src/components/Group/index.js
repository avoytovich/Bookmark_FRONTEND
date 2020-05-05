import React, { useEffect, useState } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { Grid, Typography } from '@material-ui/core';
import { Button, Table } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { get } from 'lodash';

import connect from './../../utils/connectFunction';
import action from './../../utils/actions';
import { wrapRequest } from './../../utils/api';
import { API } from './../../helper/constants';
import Head from './../Header';
import Popover from './../shared/Popover';
import Add_Group from './../shared/Popover/Add_Group';
import Search from './../shared/Search';

import './group.sass';

function Group(props) {
  console.log('Group props', props);

  const [exec, setExec] = useState(false);
  const [delSubGroups, setDelSubGroups] = useState([]);

  const group_id = get(props, 'match.params.group');
  const user_id = get(props, 'match.params.id');
  const groups = get(props, 'store.groups');

  useEffect(() => {
    props.dispatchErrorNotifiction('errorNotification', 'haha');
  }, []);

  useEffect(() => {
    const fetchSubGroup = async () => {
      const getSubGroup = await wrapRequest({
        method: 'GET',
        url: `${API.URL}:${
          API.PORT
        }/user/${user_id}/group/${group_id}/subGroup_list`,
        mode: 'cors',
        cache: 'default',
      });
      const listSubGroups = get(getSubGroup, 'data.subGroups');
      props.dispatchFetchSubGroup('fetchSubGroup', listSubGroups);
    };
    fetchSubGroup();
  }, [exec]);

  const subGroups = get(props, 'store.subGroups');

  const columns = [
    {
      title: 'SubGroups',
      dataIndex: 'id',
      render: text => (
        <Link to={`/user/${user_id}/group/${text}`}>
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
      setDelSubGroups(selectedRows);
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

  const resolveTitle = () =>
    groups
      .filter(each => each.id == group_id)
      .map(each => each.name)
      .join()
      .toUpperCase();

  return (
    <div className="wrapper-group">
      <Grid container spacing={0} justify="center">
        <Grid item xs={12} sm={12}>
          <div className="container-group">
            <Head />
            <Grid container spacing={8} justify="center">
              <Grid item xs={4} sm={4}>
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
                  <div className="group-nav">
                    <Button
                      type="primary"
                      style={{
                        border: 'red',
                        backgroundColor: 'red',
                      }}
                      // onClick={sendDeleteGroupRequest}
                    >
                      Delete
                    </Button>
                    <Popover title="Add" color="green">
                      {handleClose => (
                        <Add_Group
                          // handleChangeAddGroup={handleChangeAddGroup}
                          // sendAddGroupRequest={sendAddGroupRequest}
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
  console.log('group state', state);
  return { store: state };
};

const mapDispatchToProps = dispatch => {
  const actionData = (name, payload) => dispatch(action(name, payload));
  return {
    dispatchFetchSubGroup: actionData,
    dispatchErrorNotifiction: actionData,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Group));

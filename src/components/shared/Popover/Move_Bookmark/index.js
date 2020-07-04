import React, { useEffect, useState, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import { Button, Form, Select } from 'antd';
import { get } from 'lodash';

import connect from './../../../../utils/connectFunction';
import action from './../../../../utils/actions';
import { wrapRequest } from './../../../../utils/api';
import { API } from './../../../../helper/constants';

import './move_bookmark.sass';

const { Option } = Select;

function Move_Bookmark(props) {
  // console.log('Move_Bookmark props', props);

  const user_id = get(props, 'match.params.id');
  const group_id = get(props, 'match.params.group');

  const [chosenGroup, setChosenGroup] = useState(group_id);
  const [isChosenGroup, setIsChosenGroup] = useState(false);

  const layout = {
    labelCol: {
      span: 8,
    },
    wrapperCol: {
      span: 16,
    },
  };
  const tailLayout = {
    wrapperCol: {
      offset: 8,
      span: 16,
    },
  };

  const onFinish = values => {
    console.log('Success:', values);
    let result = {};
    props.store.groups
      .filter(each => each.id === values.group)
      .forEach(one => {
        result.groupName = one.name;
      });
    props.store.subGroups[values.group]
      .filter(each => each.id === values.subGroup)
      .forEach(one => {
        result.subGroupName = one.name;
      });
    props.sendMoveBookmarkRequest(result);
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  useEffect(() => {
    if (!props.close) {
      props.handleClose();
      props.setClose(!props.close);
    }
  }, [props.close]);

  useEffect(() => {
    const fetchSubGroup = async () => {
      const getSubGroup = await wrapRequest({
        method: 'GET',
        url: `${
          API.URL[process.env.NODE_ENV]
        }/user/${user_id}/group/${chosenGroup}/subGroup_list`,
        mode: 'cors',
        cache: 'default',
      });
      const listSubGroups = get(getSubGroup, 'data.subGroups');
      props.dispatchFetchSubGroup('fetchSubGroup', listSubGroups, chosenGroup);
    };
    const subgroup = get(
      JSON.parse(localStorage.getItem('state')),
      `subGroups.${chosenGroup}`
    );
    if (!subgroup) {
      fetchSubGroup();
    } else {
      props.dispatchFetchSubGroup('fetchSubGroup', subgroup, chosenGroup);
    }
  }, [chosenGroup]);

  const resolve = useRef();

  return (
    <div className="wrapper-move-bookmark-popover">
      <Form
        {...layout}
        ref={resolve}
        name="basic"
        initialValues={{
          remember: true,
          ['group']: '',
          ['subGroup']: '',
        }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item
          label="group"
          name="group"
          rules={[
            {
              required: true,
              message: 'Please select group!',
            },
          ]}
        >
          <Select
            showAction={['focus']}
            style={{ width: 120, margin: '0px 50px' }}
            onClick={() => {
              if (isChosenGroup) {
                setIsChosenGroup(false);
                resolve.current.resetFields();
                setTimeout(
                  () => document.querySelector('.ant-select-selector').click(),
                  0
                );
              }
            }}
            onChange={value => {
              if (!isChosenGroup) {
                setIsChosenGroup(true);
              }
              setChosenGroup(value);
              props.handleChangeMoveBookmarkGroup(value);
            }}
            getPopupContainer={node => node.parentElement}
          >
            {props.store.groups.map(each => (
              <Option key={each.id} value={each.id}>
                {each.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="subGroup"
          name="subGroup"
          rules={[
            {
              required: true,
              message: 'Please select subGroup!',
            },
          ]}
        >
          <Select
            style={{ width: 120, margin: '0px 50px' }}
            onChange={value => props.handleChangeMoveBookmarkSubGroup(value)}
            getPopupContainer={node => node.parentElement}
          >
            {props.store.subGroups[chosenGroup] &&
              props.store.subGroups[chosenGroup].map((each, id) => (
                <Option key={id} value={each.id}>
                  {each.name}
                </Option>
              ))}
          </Select>
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Button
            type="primary"
            htmlType="submit"
            style={{
              margin: '10px',
              border: 'orange',
              backgroundColor: 'orange',
            }}
          >
            Move
          </Button>
          <Button
            type="primary"
            style={{
              margin: '10px',
              border: 'red',
              backgroundColor: 'red',
            }}
            onClick={props.handleClose}
          >
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

const mapStateToProps = state => {
  // console.log('Move_Bookmark state');
  return { store: state };
};

const mapDispatchToProps = dispatch => {
  const actionData = (name, payload, id) => dispatch(action(name, payload, id));
  return {
    dispatchFetchSubGroup: actionData,
    // dispatchErrorNotifiction: actionData,
    // dispatchSuccessNotifiction: actionData,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Move_Bookmark));

import React from 'react';
import { Button } from 'antd';
import { Typography } from '@material-ui/core';

import './delete_confirmation.sass';

function Delete_Confirmation(props) {
  const confirmed = () => {
    props.sendDeleteRequest();
    props.handleClose();
  };

  return (
    <div className="wrapper-delete-confirmation-popover">
      <Typography>
        {props.facilities.length} facilities will be deleted. Are you sure?
      </Typography>
      <div className="delete-confirmation-nav">
        <Button
          type="primary"
          style={{
            margin: '10px',
            border: 'green',
            backgroundColor: 'green',
          }}
          onClick={confirmed}
        >
          YES
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
          NO
        </Button>
      </div>
    </div>
  );
}

export default Delete_Confirmation;

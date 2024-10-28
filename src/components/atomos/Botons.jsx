import React from 'react';

const Botones = ({ onClick, actionLabel, variant }) => {
    return (
        <button className="button-atom" onClick={onClick}>
          {actionLabel}
        </button>
      );
      
};

export default Botones;

import React from 'react';
import './FeedbackMessage.css';

const FeedbackMessage = ({ message, type }) => {
  return (
    <div className={`feedback-message ${type}`}>
      {message}
    </div>
  );
};

export default FeedbackMessage;
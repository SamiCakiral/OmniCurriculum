import React, { useState, useEffect } from 'react';
import './Notifications.css';

const Notification = ({ message, type, onClose, id }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 10000);

    return () => clearTimeout(timer);
  }, [onClose, id]);

  return (
    <div className={`vscode-notification ${type}`}>
      <span className="notification-message">{message}</span>
      <button className="notification-close" onClick={() => onClose(id)}>×</button>
    </div>
  );
};

const Notifications = ({ notifications, removeNotification }) => {
  return (
    <div className="notifications-container">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          {...notification}
          onClose={removeNotification}
        />
      ))}
    </div>
  );
};

export default Notifications;
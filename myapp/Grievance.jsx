// GrievanceButton.jsx
import React from 'react';
import './GrievanceButton.css';

const GrievanceButton = () => {
  const handleClick = () => {
    window.location.href = "/user-grivence"; // Adjust route as needed
  };

  return (
    <button className="grievance-button" onClick={handleClick}>
      ✉️ Write to Management
    </button>
  );
};



export default GrievanceButton;
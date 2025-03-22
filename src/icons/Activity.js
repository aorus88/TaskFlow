import React from 'react';

const Activity = ({
  width = 28,
  height = 28,
  strokeWidth = 2,
  stroke = "white",
  ...props
}) => {
  return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>

  );
};

export { Activity };

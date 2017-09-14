import * as React from 'react';
import styled from 'styled-components';

interface ProgressProps {
  progress: number;
  className?: string;
}

const RADIUS = 22;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const Progress: React.SFC<ProgressProps> = ({ progress, className }) => {  
  const value = (progress || 0) / 100;
  const dashoffset = CIRCUMFERENCE * (1 - value);

  console.log(CIRCUMFERENCE, dashoffset);

  return (
    <svg width="48" height="48" viewBox="0 0 48 48" className={className}>
      <circle
        cx="24"
        cy="24"
        r={RADIUS}
        fill="none"
        stroke="#e6e6e6"
        strokeWidth="4"
      />
      <circle
        cx="24"
        cy="24"
        r={RADIUS}
        fill="none"
        stroke="#e6b73f"
        strokeLinecap="round"
        strokeWidth="4"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={dashoffset}
        className="meter"
      />
    </svg>
  );
};

const AnimatedProgress = styled(Progress)`
  transform: rotate(-90deg);
  .meter {
    transition: all 250ms ease;
  }
`;

export { AnimatedProgress as Progress };

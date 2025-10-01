import React from 'react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-background/80 backdrop-blur-sm border rounded-lg shadow-lg">
        <p className="label text-sm text-foreground font-semibold">{`${label}`}</p>
        {payload.map((p, index) => (
          <p key={index} style={{ color: p.color || p.payload.fill }} className="text-sm">
            {`${p.name}: ${p.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default CustomTooltip;
import React, { useState, useEffect, useRef } from 'react';

/**
 * Dual-handle Range Slider for price filtering
 * Shadcn-inspired styling with smooth interactions
 */
export default function RangeSlider({ 
  min = 0, 
  max = 1000, 
  step = 1,
  value = [0, 1000],
  onChange,
  formatLabel = (v) => `$${v}`
}) {
  const [localValue, setLocalValue] = useState(value);
  const trackRef = useRef(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const getPercent = (val) => ((val - min) / (max - min)) * 100;

  const handleMinChange = (e) => {
    const newMin = Math.min(Number(e.target.value), localValue[1] - step);
    const newValue = [newMin, localValue[1]];
    setLocalValue(newValue);
  };

  const handleMaxChange = (e) => {
    const newMax = Math.max(Number(e.target.value), localValue[0] + step);
    const newValue = [localValue[0], newMax];
    setLocalValue(newValue);
  };

  const handleMouseUp = () => {
    if (onChange) {
      onChange(localValue);
    }
  };

  const minPercent = getPercent(localValue[0]);
  const maxPercent = getPercent(localValue[1]);

  return (
    <div className="range-slider">
      {/* Value Labels */}
      <div className="range-slider-labels">
        <span className="range-slider-value">{formatLabel(localValue[0])}</span>
        <span className="range-slider-separator">—</span>
        <span className="range-slider-value">{formatLabel(localValue[1])}</span>
      </div>

      {/* Slider Track */}
      <div className="range-slider-track" ref={trackRef}>
        {/* Active Range */}
        <div 
          className="range-slider-range"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`
          }}
        />

        {/* Min Handle */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[0]}
          onChange={handleMinChange}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          className="range-slider-input range-slider-input-min"
        />

        {/* Max Handle */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[1]}
          onChange={handleMaxChange}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          className="range-slider-input range-slider-input-max"
        />
      </div>

      {/* Min/Max Labels */}
      <div className="range-slider-bounds">
        <span>{formatLabel(min)}</span>
        <span>{formatLabel(max)}</span>
      </div>
    </div>
  );
}

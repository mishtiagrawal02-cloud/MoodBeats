import RangeInput from './RangeInput';
import { motion } from 'framer-motion';

function Slider({ 
  label, 
  value, 
  onChange, 
  min = 1, 
  max = 10, 
  step = 1,
  showValue = true,
  description,
  id,
  ...props 
}) {
  const sliderId = id || `slider-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <div className="slider-container">
      <div className="slider-header">
        <label htmlFor={sliderId} className="slider-label" title={description}>
          {label}
        </label>
        {showValue && (
          <motion.output 
            className="slider-value" 
            htmlFor={sliderId}
            key={value}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
          >
            {value} / {max}
          </motion.output>
        )}
      </div>
      <RangeInput
        id={sliderId}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-describedby={description ? `${sliderId}-description` : undefined}
        {...props}
      />
      {description && (
        <p id={`${sliderId}-description`} className="slider-description">
          {description}
        </p>
      )}
    </div>
  );
}

export default Slider;

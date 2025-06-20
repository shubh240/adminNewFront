const Spinner = ({
  tag = 'div',
  type = 'bordered',
  className,
  color,
  size,
  children
}) => {
  const Tag = tag || 'div';
  return  <div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
        style={{
          // backdropFilter: 'blur(4px)',
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          zIndex: 1050,
        }}><Tag role="status" className={`${type === 'bordered' ? 'spinner-border' : type === 'grow' ? 'spinner-grow' : ''} ${color ? `text-${color}` : 'text-primary'} ${size ? 'avatar-' + size : ''} ${className}`}>
      {children}
    </Tag>
    </div>;
};
export default Spinner;
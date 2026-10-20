const Message = ({ variant = 'info', children }) => {
  const variantStyles = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    danger: 'bg-red-50 text-red-800 border-red-200',
  };

  return (
    <div
      role="alert"
      className={`mb-4 rounded-lg border px-4 py-3 ${variantStyles[variant] || variantStyles.info}`}
    >
      {children}
    </div>
  );
};

export default Message;
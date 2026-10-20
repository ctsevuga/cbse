const Button = ({
  children,

  type = "button",

  variant = "primary",

  size = "medium",

  loading = false,

  disabled = false,

  className = "",

  onClick,

  ...props

}) => {


  const buttonClass = [

    "app-button",

    `button-${variant}`,

    `button-${size}`,

    className,

  ]
    .filter(Boolean)
    .join(" ");



  return (

    <button

      type={type}

      className={buttonClass}

      disabled={
        disabled ||
        loading
      }

      onClick={onClick}

      {...props}

    >


      {
        loading
          ? "Loading..."
          : children
      }


    </button>

  );

};


export default Button;
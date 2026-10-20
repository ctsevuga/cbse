const Select = ({
  label,

  name,

  value = "",

  onChange,

  options = [],

  placeholder = "Select option",

  error = "",

  disabled = false,

  required = false,

  className = "",

  ...props

}) => {


  return (

    <div
      className={`form-group ${className}`}
    >


      {
        label && (

          <label htmlFor={name}>

            {label}

            {
              required && (
                <span>
                  {" "}*
                </span>
              )
            }

          </label>

        )
      }



      <select

        id={name}

        name={name}

        value={value}

        onChange={onChange}

        disabled={disabled}

        {...props}

      >


        <option value="">

          {placeholder}

        </option>



        {
          options.map(
            (option) => (

              <option

                key={
                  option._id ||
                  option.value
                }

                value={
                  option._id ||
                  option.value
                }

              >

                {
                  option.name ||
                  option.label
                }

              </option>

            )
          )
        }


      </select>




      {
        error && (

          <p className="error-message">

            {error}

          </p>

        )
      }


    </div>

  );

};


export default Select;
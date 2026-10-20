import { useEffect } from "react";


const Modal = ({
  isOpen,

  onClose,

  title,

  children,

  footer,

  size = "medium",

  closeOnOverlayClick = true,

}) => {



  useEffect(() => {


    const handleEscape = (event) => {

      if (
        event.key === "Escape"
      ) {

        onClose();

      }

    };



    if (isOpen) {

      document.addEventListener(
        "keydown",
        handleEscape
      );


      document.body.style.overflow =
        "hidden";


    }



    return () => {

      document.removeEventListener(
        "keydown",
        handleEscape
      );


      document.body.style.overflow =
        "auto";

    };


  }, [
    isOpen,
    onClose,
  ]);





  if (!isOpen) {

    return null;

  }





  const handleOverlayClick = () => {


    if (
      closeOnOverlayClick
    ) {

      onClose();

    }


  };





  return (

    <div

      className="modal-overlay"

      onClick={
        handleOverlayClick
      }

    >



      <div

        className={
          `modal-container modal-${size}`
        }

        onClick={
          (event) =>
            event.stopPropagation()
        }

      >



        <div className="modal-header">


          {
            title && (

              <h3>
                {title}
              </h3>

            )
          }



          <button

            type="button"

            className="modal-close"

            onClick={onClose}

          >

            ×

          </button>


        </div>





        <div className="modal-body">

          {children}

        </div>





        {
          footer && (

            <div className="modal-footer">

              {footer}

            </div>

          )
        }




      </div>



    </div>

  );

};


export default Modal;
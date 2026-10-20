import { NavLink, useNavigate } from "react-router-dom";

import { useDispatch } from "react-redux";

import {
  logout,
} from "../../slices/authSlice";


const Sidebar = () => {


  const dispatch = useDispatch();

  const navigate = useNavigate();



  const menuItems = [

    {
      name: "Dashboard",

      path: "/admin",

      end: true,

    },


    {
      name: "Excel Upload",

      path: "/admin/excel-upload",

    },


    {
      name: "Quizzes",

      path: "/admin/quizzes",

    },


    {
      name: "Subjects",

      path: "/admin/subjects",

    },


    {
      name: "Students",

      path: "/admin/students",

    },


    {
      name: "Reports",

      path: "/admin/reports",

    },


  ];




  const handleLogout = () => {

    dispatch(
      logout()
    );


    navigate(
      "/login"
    );

  };




  return (

    <aside className="admin-sidebar">


      <div className="admin-logo">

        <h2>
          Coaching SaaS
        </h2>

      </div>





      <nav className="admin-menu">


        {
          menuItems.map(
            (item) => (

              <NavLink

                key={
                  item.path
                }

                to={
                  item.path
                }

                end={
                  item.end
                }

                className={
                  ({
                    isActive
                  }) =>
                    isActive
                      ? "active"
                      : ""
                }

              >

                {item.name}

              </NavLink>

            )
          )
        }


      </nav>





      <button

        className="logout-button"

        onClick={
          handleLogout
        }

      >

        Logout

      </button>



    </aside>

  );

};


export default Sidebar;
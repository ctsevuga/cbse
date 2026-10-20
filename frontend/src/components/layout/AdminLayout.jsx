import { Outlet, NavLink, useNavigate } from "react-router-dom";

import {
  useDispatch,
} from "react-redux";

import {
  logout,
} from "../slices/authSlice";

import "./AdminLayout.css";


const AdminLayout = () => {


  const dispatch = useDispatch();

  const navigate = useNavigate();



  const handleLogout = () => {

    dispatch(
      logout()
    );


    navigate(
      "/login"
    );

  };



  const menuItems = [

    {
      name: "Dashboard",

      path: "/admin",
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



  return (

    <div className="admin-layout">


      {/* Sidebar */}

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





      {/* Main Area */}

      <div className="admin-main">


        <header className="admin-header">


          <h3>
            Admin Panel
          </h3>



          <div className="admin-profile">

            Coaching Admin

          </div>


        </header>





        <main className="admin-content">


          <Outlet />


        </main>



      </div>



    </div>

  );

};


export default AdminLayout;
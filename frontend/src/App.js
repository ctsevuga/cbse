import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import 'katex/dist/katex.min.css';
import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { logout } from './slices/authSlice';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const expirationTime = localStorage.getItem('expirationTime');

    if (expirationTime) {
      const currentTime = new Date().getTime();

      if (currentTime > expirationTime) {
        dispatch(logout());
      }
    }
  }, [dispatch]);

  return (
    <>
      <ToastContainer />

      <div className="min-h-screen flex flex-col bg-gray-50">

        <Header />

        <main className="flex-1 py-6 px-4 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>

        <Footer />

      </div>
    </>
  );
};

export default App;
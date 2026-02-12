import React from 'react';
import Camera from './pages/Camera';
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
    <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />
    <Camera />
    </>
  );
}

export default App;

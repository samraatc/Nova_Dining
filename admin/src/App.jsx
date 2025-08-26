import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import Add from './pages/Add/Add';
import List from './pages/List/List';
import Orders from './pages/Orders/Orders';
import AddCategory from './pages/category/AddCategory';
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Contact from './pages/Contact/Contact';
import Login from './pages/Login/Login';
import Settings from './pages/Settings/Settings';
import { url } from './util/Globalapi';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div>
        <ToastContainer/>
        <Routes>
          <Route path='/login' element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path='*' element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div>
      <ToastContainer/>
      <Navbar setIsAuthenticated={setIsAuthenticated} />
      <hr/>
      <div className="app-content">
        <Sidebar/>
        <Routes>
          <Route path='/' element={<Dashboard url={url} />} />
          <Route path='/dashboard' element={<Dashboard url={url} />} />
          <Route path='/add' element={<Add url={url} />} />
          <Route path='/list' element={<List url={url}/>} />
          <Route path='/orders' element={<Orders url={url}/>} />
          <Route path='/addCategory' element={<AddCategory url={url}/>} />
          <Route path='/Contact' element={<Contact url={url}/>} />
          <Route path='/settings' element={<Settings />} />
          <Route path='*' element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
//C:\react-js\my-app\src\App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css'
import Login from "./Components/login.jsx";
import SignUp from "./components/signup.jsx";
import {RequireToken} from './components/Auth.jsx'
import Dashboard from "./components/dashboard.jsx";
import Home from "./components/home.jsx";
import Employee from "./components/employee.jsx";
import Profile from "./components/profile.jsx";
import AddEmployee from "./components/addemployee.jsx";
import EditEmployee from './components/editemployee.jsx'
 
function App() {
  return (
    <div className="app">
        <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
               
              <Route path='/' element={
                  <RequireToken>
                    <Dashboard />
                  </RequireToken>
                  }>
                  <Route path='' element={<Home />}></Route>
                  <Route path='/employee' element={<Employee />}></Route>
                  <Route path='/profile' element={<Profile />}></Route>
                  <Route path='/create' element={<AddEmployee />}></Route>
                  <Route path='/employeeedit/:id' element={<EditEmployee />}></Route>
              </Route>
            </Routes>
        </BrowserRouter>
    </div>
  );
}
   
export default App;
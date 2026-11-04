import { Route, Routes } from "react-router-dom";
import { RegistrationPage } from "./pages/RegistrationPage";
import { LoginPage } from "./pages/Login";

function App() {

  return (
    <div>
     <h1>Outbid</h1>
      <Routes>
        <Route path="/auth/register" element={<RegistrationPage />} />    
        <Route path="/auth/login" element={<LoginPage />} />  
      </Routes> 
    </div>
  );
}

export default App;

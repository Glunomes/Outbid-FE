import { Route, Routes } from 'react-router-dom';
import SessionExpiryHandler from './components/SessionExpiryHandler';
import { RegistrationPage } from './pages/RegistrationPage';
import { LoginPage } from './pages/LoginPage';
import { LotsCatalogPage } from './pages/LotsCatalogPage';
import { LotPage } from './pages/LotPage';
import EditLotPage from './pages/EditLotPage';
import { MyLotsPage } from './pages/MyLotsPage';
import { CreateLotPage } from './pages/CreateLotPage';

function App() {
  return (
    <div>
      <h1>Outbid</h1>
      <SessionExpiryHandler />
      <Routes>
        <Route path="/auth/register" element={<RegistrationPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/my-lots" element={<MyLotsPage />} />
        <Route path="/lots" element={<LotsCatalogPage />} />
        <Route path="/lots/new" element={<CreateLotPage />} />
        <Route path="/lots/:id/edit" element={<EditLotPage />} />
        <Route path="/lots/:id" element={<LotPage />} />
      </Routes>
    </div>
  );
}

export default App;

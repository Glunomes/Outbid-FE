import { Navigate, Route, Routes } from 'react-router-dom';
import SessionExpiryHandler from './components/SessionExpiryHandler';
import { NavBar } from './components/NavBar';
import { RegistrationPage } from './pages/RegistrationPage';
import { LoginPage } from './pages/LoginPage';
import { LotsCatalogPage } from './pages/LotsCatalogPage';
import { LotPage } from './pages/LotPage';
import EditLotPage from './pages/EditLotPage';
import { MyLotsPage } from './pages/MyLotsPage';
import { CreateLotPage } from './pages/CreateLotPage';
import { WalletPage } from './pages/WalletPage';

function App() {
  return (
    <div>
      <NavBar />
      <SessionExpiryHandler />
      <Routes>
        <Route path="/" element={<Navigate to="/lots" replace />} />
        <Route path="/auth/register" element={<RegistrationPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/my-lots" element={<MyLotsPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/lots" element={<LotsCatalogPage />} />
        <Route path="/lots/new" element={<CreateLotPage />} />
        <Route path="/lots/:id/edit" element={<EditLotPage />} />
        <Route path="/lots/:id" element={<LotPage />} />
      </Routes>
    </div>
  );
}

export default App;

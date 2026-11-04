import { Route, Routes } from 'react-router';
import Layout from './components/Layout.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import MyRecipesPage from './pages/MyRecipesPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import RecipeFormPage from './pages/RecipeFormPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

const authorOnly = (page) => <RequireAuth roles={['AUTHOR']}>{page}</RequireAuth>;

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="prijava" element={<LoginPage />} />
        <Route path="registracija" element={<RegisterPage />} />
        <Route path="moji-recepti" element={authorOnly(<MyRecipesPage />)} />
        <Route path="recepti/nov" element={authorOnly(<RecipeFormPage />)} />
        <Route path="recepti/:id/uredi" element={authorOnly(<RecipeFormPage />)} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

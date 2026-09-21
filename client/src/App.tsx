import { Routes, Route, Navigate } from 'react-router';

import ProtectedArea from './features/auth/ProtectedArea';
import Login from './features/auth/Login';
import AllRecipesView from './views/AllRecipesView';
import NewRecipeView from './views/NewRecipeView';
import RecipeView from './views/RecipeView';
import Recipe from './features/recipes/Recipe';
import RecipeForm from './features/recipes/RecipeForm';
import { GlobalStateProvider } from './utils/GlobalState';
import Header from './components/Header';
import LoadingScreen from './components/LoadingScreen';
import SettingsView from './views/SettingsView';
import AccountSettings from './features/user/AccountSettings';
import AdminSettings from './features/user/AdminSettings';
import GeneralSettings from './features/user/GeneralSettings';

function App() {
    return (
        <GlobalStateProvider>
            <Header />
            <LoadingScreen />
            <Routes>
                <Route index element={<Navigate to="/login" replace />} />
                <Route path="login" element={<Login />} />

                <Route element={<ProtectedArea />}>
                    <Route path="overview" element={<AllRecipesView />} />

                    <Route path="recipe">
                        <Route path="new" element={<NewRecipeView />}>
                            <Route index element={<RecipeForm />} />
                        </Route>
                        <Route path=":recipeId" element={<RecipeView />}>
                            <Route path="edit" element={<RecipeForm />} />
                            <Route index element={<Recipe />} />
                        </Route>
                    </Route>

                    <Route path="settings" element={<SettingsView />}>
                        <Route path='account' element={<AccountSettings />} />
                        <Route path='admin' element={<AdminSettings />} />
                        <Route index element={<GeneralSettings />} />
                    </Route>
                </Route>
            </Routes>
        </GlobalStateProvider>
    )
}

export default App

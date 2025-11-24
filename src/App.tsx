import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/Layout';
import { CitySelectionPage } from './pages/CitySelectionPage';
import { OrganizationSelectionPage } from './pages/OrganizationSelectionPage';
import { BranchSelectionPage } from './pages/BranchSelectionPage';
import { StudentSchedulePage } from './pages/StudentSchedulePage';
import { OrganizationRegistrationPage } from './pages/OrganizationRegistrationPage';
import { BranchManagementPage } from './pages/BranchManagementPage';
import { ViewerPage } from './pages/ViewerPage';
import { AdminPage } from './pages/AdminPage';
import { DataPage } from './pages/DataPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Student Routes - без Layout */}
          <Route path="/" element={<CitySelectionPage />} />
          <Route path="/student/organization-selection" element={<OrganizationSelectionPage />} />
          <Route path="/student/branch-selection" element={<BranchSelectionPage />} />
          <Route path="/student/schedule" element={<StudentSchedulePage />} />

          {/* Organization Registration */}
          <Route path="/register" element={<OrganizationRegistrationPage />} />

          {/* Organization Admin Routes - с Layout */}
          <Route element={<Layout />}>
            <Route path="/org-admin/branches" element={<BranchManagementPage />} />
            <Route path="/viewer" element={<ViewerPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/data" element={<DataPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

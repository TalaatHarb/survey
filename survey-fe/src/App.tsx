import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Layout from './components/Layout';
import SurveyListPage from './pages/SurveyListPage';
import SurveyEditorPage from './pages/SurveyEditorPage';
import PublicSurveyPage from './pages/PublicSurveyPage';
import SubmissionViewerPage from './pages/SubmissionViewerPage';

function App() {
  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', bgcolor: 'background.default' }}>
      <Routes>
        {/* Admin routes with layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/surveys" replace />} />
          <Route path="surveys" element={<SurveyListPage />} />
          <Route path="editor/:surveyId?" element={<SurveyEditorPage />} />
          <Route path="surveys/:surveyId/submissions/:submissionId" element={<SubmissionViewerPage />} />
        </Route>
        
        {/* Public routes (no layout) */}
        <Route path="/public/:surveyId" element={<PublicSurveyPage />} />
      </Routes>
    </Box>
  );
}

export default App;

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Pages
import LandingPage from './pages/Landing';
import LoginPage from './pages/Login';
import DashboardLayout from './pages/dashboard/Layout';
import DashboardHome from './pages/dashboard/Home';
import LmsNotesPage from './pages/dashboard/LmsNotes';
import AiMentorPage from './pages/dashboard/learning/AiMentor';
import NotesCreatorPage from './pages/dashboard/learning/NotesCreator';
import VocabularyPage from './pages/dashboard/learning/Vocabulary';
import MnemonicPage from './pages/dashboard/learning/MnemonicGenerator';
import EssayGeneratorPage from './pages/dashboard/learning/EssayGenerator';
import McqGeneratorPage from './pages/dashboard/learning/McqGenerator';
import BedsideCompanionPage from './pages/dashboard/clinmaster/BedsideCompanion';
import CaseSimulatorPage from './pages/dashboard/clinmaster/CaseSimulator';
import ClinicalReasoningPage from './pages/dashboard/clinmaster/ClinicalReasoning';
import DrugCalculationsPage from './pages/dashboard/clinmaster/DrugCalculations';
import InterpretationLabPage from './pages/dashboard/clinmaster/InterpretationLab';
import PatientEducationPage from './pages/dashboard/clinmaster/PatientEducation';
import CommunicationTrainerPage from './pages/dashboard/proskill/CommunicationTrainer';
import AetcomSkillsPage from './pages/dashboard/proskill/AetcomSkills';
import ReflectionPage from './pages/dashboard/assignment/Reflection';
import SeminarPage from './pages/dashboard/assignment/Seminar';
import CasePresentationsPage from './pages/dashboard/assignment/CasePresentations';
import TopicSummaryPage from './pages/dashboard/assignment/TopicSummary';
import ResearchAssistantPage from './pages/dashboard/research/ResearchAssistant';
import StatisticsAssistantPage from './pages/dashboard/research/StatisticsAssistant';
import ScientificWritingPage from './pages/dashboard/research/ScientificWriting';
import EssayQuestionPage from './pages/dashboard/assessment/EssayQuestion';
import McqQuestionPage from './pages/dashboard/assessment/McqQuestion';
import VivaSimulatorPage from './pages/dashboard/assessment/VivaSimulator';
import PortfolioPage from './pages/dashboard/Portfolio';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminHome from './pages/admin/Home';
import AdminCreator from './pages/admin/Creator';
import AdminBlog from './pages/admin/Blog';
import AdminUsers from './pages/admin/Users';
import AdminTokens from './pages/admin/Tokens';
import AdminLoginPage from './pages/admin/AdminLogin';

function ProtectedRoute({ children, publicAllowed = false }: { children: React.ReactNode, publicAllowed?: boolean }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F172A', color: 'white' }}>
        <img src="/logo.png" alt="UGMentor Logo" width="80" height="80" style={{ objectFit: 'contain', backgroundColor: 'white', padding: '10px', borderRadius: '16px', marginBottom: '24px', animation: 'pulse 2s infinite' }} />
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }
  
  if (publicAllowed && user) {
    if (user.role === 'superadmin') return <Navigate to="/contrl-panl" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  
  if (!publicAllowed && !user) return <Navigate to="/login" replace />;
  if (!publicAllowed && user?.role === 'superadmin') return <Navigate to="/contrl-panl" replace />;
  
  return <>{children}</>;
}

function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;
  if (!user) return <AdminLoginPage />;
  if (user.role !== 'superadmin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

import ReloadPrompt from './components/ReloadPrompt';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <ReloadPrompt />
      <Routes>
        <Route path="/" element={
          <ProtectedRoute publicAllowed>
            <LandingPage />
          </ProtectedRoute>
        } />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<DashboardHome />} />
          <Route path="lms-notes" element={<LmsNotesPage />} />
          <Route path="learning/ai-mentor" element={<AiMentorPage />} />
          <Route path="learning/notes-creator" element={<NotesCreatorPage />} />
          <Route path="learning/vocabulary" element={<VocabularyPage />} />
          <Route path="learning/mnemonic-generator" element={<MnemonicPage />} />
          <Route path="learning/essay-generator" element={<EssayGeneratorPage />} />
          <Route path="learning/mcq-generator" element={<McqGeneratorPage />} />
          <Route path="clinmaster/bedside-companion" element={<BedsideCompanionPage />} />
          <Route path="clinmaster/case-simulator" element={<CaseSimulatorPage />} />
          <Route path="clinmaster/clinical-reasoning" element={<ClinicalReasoningPage />} />
          <Route path="clinmaster/drug-calculations" element={<DrugCalculationsPage />} />
          <Route path="clinmaster/interpretation-lab" element={<InterpretationLabPage />} />
          <Route path="clinmaster/patient-education" element={<PatientEducationPage />} />
          <Route path="proskill/communication-trainer" element={<CommunicationTrainerPage />} />
          <Route path="proskill/aetcom-skills" element={<AetcomSkillsPage />} />
          <Route path="assignment/reflection" element={<ReflectionPage />} />
          <Route path="assignment/seminar" element={<SeminarPage />} />
          <Route path="assignment/case-presentations" element={<CasePresentationsPage />} />
          <Route path="assignment/topic-summary" element={<TopicSummaryPage />} />
          <Route path="research/research-assistant" element={<ResearchAssistantPage />} />
          <Route path="research/statistics-assistant" element={<StatisticsAssistantPage />} />
          <Route path="research/scientific-writing" element={<ScientificWritingPage />} />
          <Route path="assessment/essay-question" element={<EssayQuestionPage />} />
          <Route path="assessment/mcq-question" element={<McqQuestionPage />} />
          <Route path="assessment/viva-simulator" element={<VivaSimulatorPage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
        </Route>
        
        <Route path="/contrl-panl" element={<SuperAdminRoute><AdminLayout /></SuperAdminRoute>}>
          <Route index element={<AdminHome />} />
          <Route path="creator" element={<AdminCreator />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="tokens" element={<AdminTokens />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

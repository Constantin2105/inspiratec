import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import SiteLayout from '@/components/common/layout/SiteLayout.jsx';
import ProtectedRoute from '@/components/auth/ProtectedRoute.jsx';
import Spinner from '@/components/common/Spinner.jsx';

const Home = React.lazy(() => import('@/pages/Home'));
const WhyInspiratec = React.lazy(() => import('@/pages/WhyInspiratec'));
const Blog = React.lazy(() => import('@/pages/blog/Blog'));
const BlogArticle = React.lazy(() => import('@/pages/blog/BlogArticle'));
const Login = React.lazy(() => import('@/pages/Login'));
const ExpertLogin = React.lazy(() => import('@/pages/auth/expert/ExpertLogin'));
const CompanyLogin = React.lazy(() => import('@/pages/auth/company/CompanyLogin'));
const AdminLogin = React.lazy(() => import('@/pages/auth/admin/AdminLogin'));
const ExpertSignup = React.lazy(() => import('@/pages/auth/expert/ExpertSignup'));
const CompanySignup = React.lazy(() => import('@/pages/auth/company/CompanySignup'));
const Missions = React.lazy(() => import('@/pages/Missions'));
const FindMission = React.lazy(() => import('@/pages/FindMission'));
const OnAUneMission = React.lazy(() => import('@/pages/OnAUneMission'));

const AdminRoot = React.lazy(() => import('@/pages/admin/index'));
const AdminDashboard = React.lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminUsers = React.lazy(() => import('@/pages/admin/AdminUsers'));
const AdminUserFormPage = React.lazy(() => import('@/pages/admin/AdminUserFormPage'));
const AdminCreateAO = React.lazy(() => import('@/pages/admin/AdminCreateAO'));
const AdminCreateBlog = React.lazy(() => import('@/pages/admin/AdminCreateBlog'));
const AdminViewBlogArticle = React.lazy(() => import('@/pages/admin/AdminViewBlogArticle'));
const AdminSettings = React.lazy(() => import('@/pages/admin/AdminSettings'));
const AdminEdgeFunctions = React.lazy(() => import('@/pages/admin/AdminEdgeFunctions'));
const ManageContent = React.lazy(() => import('@/pages/admin/ManageContent'));
const AdminAnnouncementForm = React.lazy(() => import('@/pages/admin/AdminAnnouncementForm'));
const TestimonialForm = React.lazy(() => import('@/components/admin/testimonials/TestimonialForm'));
const AdminWorkflow = React.lazy(() => import('@/pages/admin/AdminWorkflow'));
const AdminDocuments = React.lazy(() => import('@/pages/admin/AdminDocuments'));
const ShareDocumentPage = React.lazy(() => import('@/pages/admin/ShareDocumentPage'));

const ExpertDashboard = React.lazy(() => import('@/pages/expert/index'));
const ExpertViewBlogArticle = React.lazy(() => import('@/pages/expert/ViewBlogArticle'));
const ApplyToMission = React.lazy(() => import('@/pages/expert/ApplyToMission'));

const CompanyDashboard = React.lazy(() => import('@/pages/company/index'));
const CompanyViewBlogArticlePage = React.lazy(() => import('@/pages/company/ViewBlogArticle'));
const ScheduleInterviewPage = React.lazy(() => import('@/pages/company/ScheduleInterviewPage'));
const AllNotificationsPage = React.lazy(() => import('@/pages/company/AllNotifications'));

const RequestPasswordReset = React.lazy(() => import('@/pages/RequestPasswordReset'));
const UpdatePassword = React.lazy(() => import('@/pages/UpdatePassword'));
const EmailVerificationSent = React.lazy(() => import('@/pages/EmailVerificationSent'));
const AccountVerified = React.lazy(() => import('@/pages/AccountVerified'));
const LegalMentions = React.lazy(() => import('@/pages/LegalMentions'));
const PrivacyPolicy = React.lazy(() => import('@/pages/PrivacyPolicy'));
const RGPD = React.lazy(() => import('@/pages/RGPD'));
const Unauthorized = React.lazy(() => import('@/pages/Unauthorized'));
const NotFound = React.lazy(() => import('@/pages/404'));
const SupportPage = React.lazy(() => import('@/pages/Support'));

const App = () => {
  return (
    <>
      <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-background"><Spinner size="lg" /></div>}>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/why-inspiratec" element={<WhyInspiratec />} />
            <Route path="/missions" element={<Missions />} />
            <Route path="/find-mission" element={<FindMission />} />
            <Route path="/post-mission" element={<OnAUneMission />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogArticle />} />
            <Route path="/legal-mentions" element={<LegalMentions />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/rgpd" element={<RGPD />} />
          </Route>
          
          <Route path="/login" element={<Login />} />
          <Route path="/login/expert" element={<ExpertLogin />} />
          <Route path="/login/company" element={<CompanyLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/signup/expert" element={<ExpertSignup />} />
          <Route path="/signup/company" element={<CompanySignup />} />
          <Route path="/request-password-reset" element={<RequestPasswordReset />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/email-verification-sent" element={<EmailVerificationSent />} />
          <Route path="/account-verified" element={<AccountVerified />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/support" element={
            <ProtectedRoute requiredRole={['expert', 'company']}>
              <SupportPage />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute requiredRole="super-admin">
              <AdminRoot />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="workflow" element={<AdminWorkflow />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/new" element={<AdminUserFormPage />} />
            <Route path="users/edit/:id" element={<AdminUserFormPage />} />
            <Route path="aos/new" element={<AdminCreateAO />} />
            <Route path="aos/edit/:id" element={<AdminCreateAO />} />
            <Route path="content" element={<ManageContent />} />
            <Route path="announcements/new" element={<AdminAnnouncementForm />} />
            <Route path="announcements/edit/:id" element={<AdminAnnouncementForm />} />
            <Route path="testimonials/new" element={<TestimonialForm />} />
            <Route path="testimonials/edit/:id" element={<TestimonialForm />} />
            <Route path="blog/new" element={<AdminCreateBlog />} />
            <Route path="blog/edit/:slug" element={<AdminCreateBlog />} />
            <Route path="blog/view/:slug" element={<AdminViewBlogArticle />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="documents" element={<AdminDocuments />} />
            <Route path="documents/share" element={<ShareDocumentPage />} />
            <Route path="profile" element={<Navigate to="/admin/settings" replace />} />
            <Route path="edge-functions" element={<AdminEdgeFunctions />} />
          </Route>

          <Route path="/expert/dashboard" element={
            <ProtectedRoute requiredRole="expert">
                <ExpertDashboard />
            </ProtectedRoute>
          }>
             <Route path="blog/:slug" element={<ExpertViewBlogArticle />} />
             <Route path="apply/:missionId" element={<ApplyToMission />} />
          </Route>

          <Route path="/company/dashboard" element={
            <ProtectedRoute requiredRole="company">
                <CompanyDashboard />
            </ProtectedRoute>
          }>
            <Route path="blog/:slug" element={<CompanyViewBlogArticlePage />} />
            <Route path="schedule-interview/:candidatureId" element={<ScheduleInterviewPage />} />
            <Route path="notifications" element={<AllNotificationsPage />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster />
    </>
  );
};

export default App;
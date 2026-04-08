/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import Landing from '@/pages/Landing';
import Auth from '@/pages/Auth';
import Onboarding from '@/pages/Onboarding';
import TermsOfService from '@/pages/TermsOfService';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import DashboardLayout from '@/layouts/DashboardLayout';
import Overview from '@/pages/dashboard/Overview';
import Agent from '@/pages/dashboard/Agent';
import SchoolList from '@/pages/dashboard/SchoolList';
import Applications from '@/pages/dashboard/Applications';
import EssayPlanner from '@/pages/dashboard/EssayPlanner';
import Preparation from '@/pages/dashboard/Preparation';
import HumanServices from '@/pages/dashboard/HumanServices';
import Pricing from '@/pages/dashboard/Pricing';
import Settings from '@/pages/dashboard/Settings';
import Commons from '@/pages/dashboard/Commons';
import CommonsPostDetail from '@/pages/dashboard/CommonsPost';
import Playground from '@/pages/dashboard/Playground';
import Wellbeing from '@/pages/dashboard/Wellbeing';
import AdieFAB from '@/components/adie/AdieFAB';

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Agent />} />
            <Route path="overview" element={<Overview />} />
            <Route path="schools" element={<SchoolList />} />
            <Route path="applications" element={<Applications />} />
            <Route path="essays" element={<EssayPlanner />} />
            <Route path="preparation" element={<Preparation />} />
            <Route path="human-services" element={<HumanServices />} />
            <Route path="commons" element={<Commons />} />
            <Route path="commons/:postId" element={<CommonsPostDetail />} />
            <Route path="playground" element={<Playground />} />
            <Route path="wellbeing" element={<Wellbeing />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
        <AdieFAB />
      </BrowserRouter>
    </ThemeProvider>
  );
}

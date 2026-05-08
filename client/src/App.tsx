import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth.store';
import { ToastProvider } from './components/Toast';
import { Layout } from './components/Layout';
import { LoginPage } from './features/auth/LoginPage';
import { HomePage } from './features/home/HomePage';
import { MoodPage } from './features/mood/MoodPage';
import { RantPage } from './features/rant/RantPage';
import { CountdownPage } from './features/countdown/CountdownPage';
import { GalleryPage } from './features/gallery/GalleryPage';
import { TimelinePage } from './features/timeline/TimelinePage';
import { ChatWidget } from './features/chat/ChatWidget';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">加载中...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <ToastProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/mood" element={<MoodPage />} />
          <Route path="/rant" element={<RantPage />} />
          <Route path="/countdown" element={<CountdownPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ChatWidget />
    </ToastProvider>
  );
}

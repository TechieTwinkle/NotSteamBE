import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import api from "./api/client";
import { useAuth } from "./context/AuthContext";
import AppLayout from "./layout/AppLayout";
import LoadingScreen from "./components/LoadingScreen";
import JoinModal from "./components/JoinModal";

const HomePage = lazy(() => import("./pages/HomePage"));
const DiscoverPage = lazy(() => import("./pages/DiscoverPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const GamePage = lazy(() => import("./pages/GamePage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));

const ProtectedRoute = ({ children, role }) => {
  const { user, authLoading } = useAuth();
  if (authLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace />;
  if (role && user.role !== role) return <Navigate to="/discover" replace />;
  return children;
};

const App = () => {
  const { user } = useAuth();
  const [booting, setBooting] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);

  const stats = useMemo(() => {
    const totalRatings = games.reduce((acc, game) => acc + (game.ratingCount || 0), 0);
    return [
      { label: "Published indie games", value: games.length },
      { label: "Player ratings", value: totalRatings },
      { label: "Open creator slots", value: "Always" }
    ];
  }, [games]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBooting(false);
      setShowJoinModal(!user);
    }, 1800);

    return () => clearTimeout(timer);
  }, [user]);

  useEffect(() => {
    const loadGames = async () => {
      setLoadingGames(true);
      try {
        const { data } = await api.get("/games");
        setGames(data);
      } finally {
        setLoadingGames(false);
      }
    };
    loadGames();
  }, []);

  if (booting) return <LoadingScreen />;

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      {showJoinModal && <JoinModal onClose={() => setShowJoinModal(false)} />}
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route element={<AppLayout games={games} />}>
            <Route path="/" element={<HomePage stats={stats} games={games} loading={loadingGames} />} />
            <Route path="/discover" element={<DiscoverPage games={games} loading={loadingGames} />} />
            <Route path="/auth" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/game/:id" element={<GamePage />} />
            <Route path="/games/:id" element={<GamePage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;


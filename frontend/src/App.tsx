import { Navigate, Route, Routes } from "react-router-dom";
import { LoadingPage } from "@/pages/LoadingPage";
import { AuthPage } from "@/pages/AuthPage";
import { WalletPage } from "@/pages/WalletPage";
import { PIonnaPage } from "@/pages/PIonnaPage";
import { BookingPage } from "@/pages/BookingPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { TripDetailPage } from "@/pages/TripDetailPage";
import { TripEventDetailPage } from "@/pages/TripEventDetailPage";
import { BookingDetailPage } from "@/pages/BookingDetailPage";
import { AppLayout } from "@/layouts/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoadingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/p-ionna" element={<PIonnaPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/trips/:id" element={<TripDetailPage />} />
        <Route path="/trips/:tripId/event/:kind/:id" element={<TripEventDetailPage />} />
        <Route path="/bookings/:id" element={<BookingDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

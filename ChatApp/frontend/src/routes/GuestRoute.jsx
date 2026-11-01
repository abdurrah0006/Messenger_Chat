import { Navigate, Outlet } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import { useAuth } from "../hooks/useAuth";

const GuestRoute = () => {
  const { user } = useAuth();

  if (user) return <Navigate to="/" replace />;

  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
};

export default GuestRoute;

import { Navigate, useLocation } from "react-router-dom";
import { useDashboardStore } from "@/pages/dashboard/store/useDashboardStore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export const ProtectedRoute = ({ 
  children, 
  allowedRoles, 
  redirectTo = "/dashboard" 
}: ProtectedRouteProps) => {
  const currentRole = useDashboardStore((state) => state.currentRole);
  const isLoggedIn = useDashboardStore((state) => state.isLoggedIn);
  const location = useLocation();

  // Check if user is logged in
  if (!isLoggedIn) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check if user's role is allowed
  if (!allowedRoles.includes(currentRole)) {
    // Map role names for better display
    const roleLabels: Record<string, string> = {
      'kasir': 'Kasir',
      'supervisor': 'Supervisor (Legacy)',
      'supervisor-outlet': 'Supervisor Outlet',
      'supervisor-produksi': 'Supervisor Produksi',
      'owner': 'Owner',
    };
    
    const currentRoleLabel = roleLabels[currentRole] || currentRole;
    const allowedRolesLabels = allowedRoles.map(r => roleLabels[r] || r).join(", ");

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Akses Ditolak</AlertTitle>
          <AlertDescription className="mt-2">
            Anda tidak memiliki izin untuk mengakses halaman ini.
            <br /><br />
            <strong>Role Anda saat ini:</strong> {currentRoleLabel}
            <br />
            <strong>Role yang diizinkan:</strong> {allowedRolesLabels}
            <br /><br />
            <a href="/dashboard" className="text-primary hover:underline">
              Kembali ke Dashboard
            </a>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};


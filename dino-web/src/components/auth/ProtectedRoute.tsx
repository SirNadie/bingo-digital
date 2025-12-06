import { Navigate, Outlet } from 'react-router-dom';
import { Me } from '../../types';

interface ProtectedRouteProps {
    user: Me | null;
    allowedRoles?: ('user' | 'admin')[];
    redirectPath?: string;
}

export const ProtectedRoute = ({
    user,
    allowedRoles,
    redirectPath = '/auth',
}: ProtectedRouteProps) => {
    if (!user) {
        return <Navigate to={redirectPath} replace />;
    }

    if (allowedRoles) {
        const isAdmin = user.is_admin;
        const hasPermission = allowedRoles.includes(isAdmin ? 'admin' : 'user');

        if (!hasPermission) {
            return <Navigate to={isAdmin ? '/admin' : '/'} replace />;
        }
    }

    return <Outlet />;
};

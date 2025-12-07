import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet } from 'react-router-dom';
export const ProtectedRoute = ({ user, allowedRoles, redirectPath = '/auth', }) => {
    if (!user) {
        return _jsx(Navigate, { to: redirectPath, replace: true });
    }
    if (allowedRoles) {
        const isAdmin = user.is_admin;
        const hasPermission = allowedRoles.includes(isAdmin ? 'admin' : 'user');
        if (!hasPermission) {
            return _jsx(Navigate, { to: isAdmin ? '/admin' : '/', replace: true });
        }
    }
    return _jsx(Outlet, {});
};

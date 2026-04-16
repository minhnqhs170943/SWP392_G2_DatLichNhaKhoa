import { Navigate } from 'react-router-dom';

const RoleRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    // RoleID từ DB: 1-Admin, 2-Staff, 3-Doctor, 4-Patient (User)
    if (allowedRoles && !allowedRoles.includes(user.RoleID)) {
        return <Navigate to="/home" replace />;
    }

    return children;
};

export default RoleRoute;
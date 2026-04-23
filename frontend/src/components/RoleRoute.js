import { Navigate } from 'react-router-dom';

const RoleRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    let user = null;
    
    try {
        user = JSON.parse(localStorage.getItem('user'));
    } catch (error) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    }

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    const currentRoleId = user.RoleID || user.roleId; 
    
    if (allowedRoles && !allowedRoles.includes(currentRoleId)) {
        return <Navigate to="/home" replace />;
    }

    return children;
};

export default RoleRoute;
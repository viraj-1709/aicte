import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { api } from '../services/api';

interface RequireRoleProps {
  allowedRole: UserRole;
  currentPath: string;
  onRedirect: (targetPath: string) => void;
  children: React.ReactNode;
}

export const RequireRole: React.FC<RequireRoleProps> = ({
  allowedRole,
  currentPath,
  onRedirect,
  children
}) => {
  const { user, role, showToast } = useApp();
  const denialLoggedRef = useRef<string | null>(null);

  const getDashboardForRole = (r: UserRole): string => {
    switch (r) {
      case 'OFFICER':
        return '/officer';
      case 'ADMIN':
        return '/admin';
      case 'APPLICANT':
        return '/applicant';
      default:
        return '/login';
    }
  };

  useEffect(() => {
    if (role !== allowedRole) {
      const denialKey = `${role}:${currentPath}`;
      if (denialLoggedRef.current !== denialKey) {
        denialLoggedRef.current = denialKey;
        const targetDashboard = getDashboardForRole(role);
        
        // Log access denial to audit trail via backend API
        api.logAccessDenial({
          user: user?.name || user?.email || 'Anonymous',
          role: role,
          target_path: currentPath,
          reason: `Statutory access control violation: Role '${role}' attempted to access '${currentPath}' which requires '${allowedRole}'. Automatically redirected to '${targetDashboard}'.`
        });

        showToast(`Access Denied: You do not have permission to access ${currentPath}. Redirected to your statutory dashboard.`);
        onRedirect(targetDashboard);
      }
    }
  }, [role, allowedRole, currentPath, user, showToast, onRedirect]);

  if (role !== allowedRole) {
    return null;
  }

  return <>{children}</>;
};

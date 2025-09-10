import { Shield, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserRole, UserRole } from "@/hooks/useUserRole";

export const RoleSelector = () => {
  const { userRole, changeRole } = useUserRole();

  const handleRoleChange = (role: UserRole) => {
    changeRole(role);
  };

  return (
    <div className="flex items-center gap-2 p-1 bg-secondary/50 rounded-lg">
      <Button
        variant={userRole === 'admin' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleRoleChange('admin')}
        className="flex items-center gap-2"
      >
        <Shield className="h-4 w-4" />
        Admin
      </Button>
      <Button
        variant={userRole === 'viewer' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleRoleChange('viewer')}
        className="flex items-center gap-2"
      >
        <Eye className="h-4 w-4" />
        Viewer
      </Button>
    </div>
  );
};
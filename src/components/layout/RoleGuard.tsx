import type { PropsWithChildren } from "react";
import { View } from "react-native";
import { useAuth } from "../../hooks/useAuth";
import type { UserRole } from "../../constants/roles";

type RoleGuardProps = PropsWithChildren<{ roles: UserRole[] }>;

export default function RoleGuard({ roles, children }: RoleGuardProps) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) {
    return <View />;
  }
  return <>{children}</>;
}

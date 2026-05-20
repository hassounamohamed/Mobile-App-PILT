import React from "react";
import { View } from "react-native";
import { useAuthStore } from "@/context/authStore";
import { UserRole } from "@/types/auth";
import { useDashboardStyles } from "@/components/dashboardStyles";

import SuperAdminDashboard from "./SuperAdminDashboard";
import ProductOwnerDashboard from "./ProductOwnerDashboard";
import ScrumMasterDashboard from "./ScrumMasterDashboard";
import QATesterDashboard from "./QATesterDashboard";
import DeveloperDashboard from "./DeveloperDashboard";

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const role = user?.role as UserRole | undefined;
  const styles = useDashboardStyles();

  return (
    <View style={styles.root}>
      {role === "Super Admin" && <SuperAdminDashboard />}
      {role === "Product Owner" && <ProductOwnerDashboard />}
      {role === "Scrum Master" && <ScrumMasterDashboard />}
      {role === "Testeur QA" && <QATesterDashboard />}
      {role === "Développeur" && <DeveloperDashboard />}
      {!role && <SuperAdminDashboard />}
    </View>
  );
}

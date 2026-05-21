import AnomaliesScreen from "@/screens/AnomaliesScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import QATesterDashboard from "@/screens/QATesterDashboard";
import ReportsScreen from "@/screens/ReportsScreen";
import SprintsScreen from "@/screens/SprintsScreen";
import TestsScreen from "@/screens/TestsScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { InstagramTabBar } from "./InstagramTabBar";
import { QATabParamList } from "./types";

const Tab = createBottomTabNavigator<QATabParamList>();

export const QATabs: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <InstagramTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={QATesterDashboard} />
      <Tab.Screen name="Sprints" component={SprintsScreen} />
      <Tab.Screen name="Tests" component={TestsScreen} />
      <Tab.Screen name="Anomalies" component={AnomaliesScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

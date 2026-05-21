import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DeveloperTabParamList } from "./types";
import { InstagramTabBar } from "./InstagramTabBar";
import DeveloperDashboard from "@/screens/DeveloperDashboard";
import SprintsScreen from "@/screens/SprintsScreen";
import StoriesScreen from "@/screens/StoriesScreen";
import TestsScreen from "@/screens/TestsScreen";
import ReportsScreen from "@/screens/ReportsScreen";
import ProfileScreen from "@/screens/ProfileScreen";

const Tab = createBottomTabNavigator<DeveloperTabParamList>();

export const DeveloperTabs: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <InstagramTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={DeveloperDashboard} />
      <Tab.Screen name="Sprints" component={SprintsScreen} />
      <Tab.Screen name="Stories" component={StoriesScreen} />
      <Tab.Screen name="Tests" component={TestsScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

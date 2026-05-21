import BacklogScreen from "@/screens/BacklogScreen";
import POCahierTestScreen from "@/screens/POCahierTestScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import ReportsScreen from "@/screens/ReportsScreen";
import ScrumMasterDashboard from "@/screens/ScrumMasterDashboard";
import SprintsScreen from "@/screens/SprintsScreen";
import TeamScreen from "@/screens/TeamScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { InstagramTabBar } from "./InstagramTabBar";
import { ScrumMasterTabParamList } from "./types";

const Tab = createBottomTabNavigator<ScrumMasterTabParamList>();

export const ScrumMasterTabs: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <InstagramTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={ScrumMasterDashboard} />
      <Tab.Screen name="Sprints" component={SprintsScreen} />
      <Tab.Screen name="Backlog" component={BacklogScreen} />
      <Tab.Screen name="Team" component={TeamScreen} />
      <Tab.Screen name="CahierTest" component={POCahierTestScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

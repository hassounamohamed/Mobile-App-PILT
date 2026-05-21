import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ProductOwnerTabParamList } from "./types";
import { InstagramTabBar } from "./InstagramTabBar";
import ProductOwnerDashboard from "@/screens/ProductOwnerDashboard";
import ProjectsScreen from "@/screens/ProjectsScreen";
import BacklogScreen from "@/screens/BacklogScreen";
import POCahierTestScreen from "@/screens/POCahierTestScreen";
import ReportsScreen from "@/screens/ReportsScreen";
import ProfileScreen from "@/screens/ProfileScreen";

const Tab = createBottomTabNavigator<ProductOwnerTabParamList>();

export const ProductOwnerTabs: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <InstagramTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={ProductOwnerDashboard} />
      <Tab.Screen name="Projects" component={ProjectsScreen} />
      <Tab.Screen name="Backlog" component={BacklogScreen} />
      <Tab.Screen name="CahierTest" component={POCahierTestScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

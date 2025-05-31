import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import BarDetailsScreen from '../screens/bars/BarDetailsScreen';
import BarsListScreen from '../screens/bars/BarsListScreen';
import MenuItemScreen from '../screens/bars/MenuItemScreen';
import EventDetailsScreen from '../screens/events/EventDetailsScreen';
import EventsListScreen from '../screens/events/EventsListScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Define the parameter types for your stacks
export type BarsStackParamList = {
  BarsList: undefined;
  BarDetails: { barId: string };
  MenuItem: { barId: string; itemId: string };
};

export type EventsStackParamList = {
  EventsList: undefined;
  EventDetails: { eventId: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

// Auth Stack Navigator
const AuthStack = createStackNavigator<AuthStackParamList>();
function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen 
        name="Welcome" 
        component={WelcomeScreen} 
      />
      <AuthStack.Screen 
        name="Login" 
        component={LoginScreen}
      />
      <AuthStack.Screen 
        name="Register" 
        component={RegisterScreen}
      />
    </AuthStack.Navigator>
  );
}

// Bars Stack Navigator
const BarsStackNav = createStackNavigator<BarsStackParamList>();
function BarsStack() {
  return (
    <BarsStackNav.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <BarsStackNav.Screen 
        name="BarsList" 
        component={BarsListScreen}
      />
      <BarsStackNav.Screen 
        name="BarDetails" 
        component={BarDetailsScreen}
      />
      <BarsStackNav.Screen 
        name="MenuItem" 
        component={MenuItemScreen}
      />
    </BarsStackNav.Navigator>
  );
}

// Events Stack Navigator
const EventsStackNav = createStackNavigator<EventsStackParamList>();
function EventsStack() {
  return (
    <EventsStackNav.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <EventsStackNav.Screen 
        name="EventsList" 
        component={EventsListScreen}
      />
      <EventsStackNav.Screen 
        name="EventDetails" 
        component={EventDetailsScreen}
      />
    </EventsStackNav.Navigator>
  );
}

// Profile Stack Navigator
const ProfileStackNav = createStackNavigator<ProfileStackParamList>();
function ProfileStack() {
  return (
    <ProfileStackNav.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <ProfileStackNav.Screen 
        name="Profile" 
        component={ProfileScreen}
      />
      <ProfileStackNav.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
      />
    </ProfileStackNav.Navigator>
  );
}

// Main Tab Navigator (for authenticated users)
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0.5,
          borderTopColor: '#e0e0e0',
          paddingBottom: 5,
          height: 60,
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen 
        name="BarsTab" 
        component={BarsStack}
        options={{ 
          tabBarLabel: 'Bares',
          tabBarIcon: ({ color, size }) => (
            // You can add icons here if you have react-native-vector-icons
            // <Icon name="beer" size={size} color={color} />
            null
          ),
        }}
      />
      <Tab.Screen 
        name="EventsTab" 
        component={EventsStack}
        options={{ 
          tabBarLabel: 'Eventos',
          tabBarIcon: ({ color, size }) => (
            // <Icon name="calendar" size={size} color={color} />
            null
          ),
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileStack}
        options={{ 
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            // <Icon name="user" size={size} color={color} />
            null
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Root Navigator - Main entry point
export default function RootNavigator() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <MainTabNavigator /> : <AuthNavigator />;
}
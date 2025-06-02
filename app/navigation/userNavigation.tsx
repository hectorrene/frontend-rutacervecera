import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import BusinessDetails from '../screens/business/bar/BarDetailScreen';
import BusinessBars from '../screens/business/bar/BarListScreen';
import CreateBarScreen from '../screens/business/bar/CreateBarScreen';
import EditBarScreen from '../screens/business/bar/EditBarScreen';
import AddEventScreen from '../screens/business/events/AddEventScreen';
import EditEventScreen from '../screens/business/events/EditEventScreen';
import AddMenuItemScreen from '../screens/business/menu/AddMenuItemScreen';
import EditMenuItemScreen from '../screens/business/menu/EditMenuItemScreen';
import BarDetailsScreen from '../screens/user/bars/BarDetailsScreen';
import BarsListScreen from '../screens/user/bars/BarsListScreen';
import MenuItemScreen from '../screens/user/bars/MenuItemScreen';
import EventDetailsScreen from '../screens/user/events/EventDetailsScreen';
import EventsListScreen from '../screens/user/events/EventsListScreen';
import { default as EditProfileScreen, default as LoginScreen } from '../screens/user/profile/EditProfileScreen';
import { default as FavoritesScreen, default as RegisterScreen } from '../screens/user/profile/FavoritesScreen';
import { default as ProfileScreen, default as WelcomeScreen } from '../screens/user/profile/ProfileScreen';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;
const isDesktop = width >= 1024;

// Dark theme colors matching the other screens
const colors = {
  background: '#0a0a0a',
  surface: '#1a1a1a',
  surfaceVariant: '#2a2a2a',
  surfaceElevated: '#1f1f1f',
  primary: '#3b82f6',
  primaryVariant: '#2563eb',
  secondary: '#6366f1',
  accent: '#8b5cf6',
  text: '#ffffff',
  textSecondary: '#a1a1aa',
  textMuted: '#71717a',
  border: '#27272a',
  borderLight: '#3f3f46',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  tabBarBackground: '#1a1a1a',
  tabBarBorder: '#27272a',
};

const Tab = createBottomTabNavigator();
const TopTab = createMaterialTopTabNavigator();
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
  Favorites: undefined;
  BusinessBars: undefined;
  BusinessEvents: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

export type BusinessStackParamList = {
  BarListScreen: undefined; 
  BusinessDashboard: undefined;
  BusinessDetails: {
    barId: string;
    barName: string;
  };
  CreateBarScreen: undefined;
  EditBarScreen: {
    barId: string;
    barName: string;
  };
  MenuListScreen: {
    barId: string;
    barName: string;
  };
  AddMenuItemScreen: {
    barId: string;
    barName: string;
  };
  EditMenuItemScreen: {
    barId: string;
    itemId: string;
    barName: string;
    itemName?: string;
  };
  EventListScreen: {
    barId: string;
    barName: string;
  };
  AddEventScreen: {
    barId: string;
    barName: string;
  };
  EditEventScreen: {
    barId: string;
    eventId: string;
    barName: string;
    eventName?: string;
  };
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
      <ProfileStackNav.Screen 
        name="Favorites" 
        component={FavoritesScreen}
      />
      <ProfileStackNav.Screen 
        name="BusinessBars" 
        component={BusinessBars} 
      />
    </ProfileStackNav.Navigator>
  );
}

// Business Stack Navigator
const BusinessStack = createStackNavigator<BusinessStackParamList>();
function BusinessNavigator() {
  return (
  <BusinessStack.Navigator
      screenOptions={{
        headerShown: false,
      }}>

      <BusinessStack.Screen
        name="BarListScreen"
        component={BusinessBars}
      />

      <BusinessStack.Screen
        name="BusinessDetails"
        component={BusinessDetails}
      />

      <BusinessStack.Screen
        name="CreateBarScreen"
        component={CreateBarScreen}
        options={{
          title: 'Crear Nuevo Bar',
        }}
      />

      <BusinessStack.Screen
        name = "EditBarScreen"
        component = {EditBarScreen}
      />

      <BusinessStack.Screen
        name="MenuListScreen"
        component={AddMenuItemScreen}
      />

      <BusinessStack.Screen
        name = "AddEventScreen"
        component = {AddEventScreen}
      />

      <BusinessStack.Screen
        name = "EditEventScreen"
        component = {EditEventScreen}
      />

      <BusinessStack.Screen
        name="EditMenuItemScreen"
        component={EditMenuItemScreen}
      />
  </BusinessStack.Navigator>
  );
}

// Tab configuration for both mobile and desktop
const tabScreens = [
  {
    name: 'BarsTab',
    component: BarsStack,
    label: 'Bares',
    icon: 'local-bar',
  },
  {
    name: 'EventsTab',
    component: EventsStack,
    label: 'Eventos',
    icon: 'event',
  },
  {
    name: 'ProfileTab',
    component: ProfileStack,
    label: 'Perfil',
    icon: 'person',
  },
  {
    name: 'BusinessBars',
    component: BusinessNavigator,
    label: 'Business',
    icon: 'business',
  },
];

// Desktop Top Tab Navigator (looks like a navbar)
function DesktopTabNavigator() {
  return (
    <View style={styles.desktopContainer}>
      <TopTab.Navigator
        screenOptions={{
          tabBarStyle: styles.desktopTabBar,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: styles.desktopTabLabel,
          tabBarIndicatorStyle: styles.desktopTabIndicator,
          tabBarPressColor: colors.surfaceVariant,
          tabBarScrollEnabled: false,
        }}
      >
        {tabScreens.map((screen) => (
          <TopTab.Screen
            key={screen.name}
            name={screen.name}
            component={screen.component}
            options={{
              tabBarLabel: screen.label,
              tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
                <Icon 
                  name={screen.icon} 
                  size={24} 
                  color={color}
                  style={[
                    styles.desktopTabIcon,
                    focused && styles.desktopTabIconFocused
                  ]} 
                />
              ),
            }}
          />
        ))}
      </TopTab.Navigator>
    </View>
  );
}

// Mobile Bottom Tab Navigator
function MobileTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.mobileTabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.mobileTabLabel,
        tabBarIconStyle: styles.mobileTabIcon,
      }}
    >
      {tabScreens.map((screen) => (
        <Tab.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={{
            tabBarLabel: screen.label,
            tabBarIcon: ({ color, size, focused }) => (
              <View style={[
                styles.mobileIconContainer,
                focused && styles.mobileIconContainerFocused
              ]}>
                <Icon 
                  name={screen.icon} 
                  size={focused ? size + 2 : size} 
                  color={color}
                />
              </View>
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

// Main Tab Navigator - chooses between mobile and desktop layout
function MainTabNavigator() {
  // Use desktop layout for tablets and larger screens
  if (isTablet || isDesktop) {
    return <DesktopTabNavigator />;
  }
  
  return <MobileTabNavigator />;
}

// Root Navigator - Main entry point
export default function RootNavigator() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <MainTabNavigator /> : <AuthNavigator />;
}

const styles = StyleSheet.create({
  // Desktop styles
  desktopContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  desktopTabBar: {
    backgroundColor: colors.tabBarBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.tabBarBorder,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    height: 70,
    paddingTop: Platform.OS === 'ios' ? 10 : 0,
  },
  desktopTabLabel: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'none',
    marginTop: 4,
  },
  desktopTabIndicator: {
    backgroundColor: colors.primary,
    height: 3,
    borderRadius: 2,
  },
  desktopTabIcon: {
    marginBottom: 4,
  },
  desktopTabIconFocused: {
    transform: [{ scale: 1.1 }],
  },

  // Mobile styles
  mobileTabBar: {
    backgroundColor: colors.tabBarBackground,
    borderTopWidth: 1,
    borderTopColor: colors.tabBarBorder,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
    height: Platform.OS === 'ios' ? 85 : 65,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mobileTabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  mobileTabIcon: {
    marginBottom: 2,
  },
  mobileIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  mobileIconContainerFocused: {
    backgroundColor: colors.surfaceVariant,
    transform: [{ scale: 1.1 }],
  },
});
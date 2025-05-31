import React from 'react';
import { AuthProvider } from './context/AuthContext';
import RootNavigator from './navigation/userNavigation';

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
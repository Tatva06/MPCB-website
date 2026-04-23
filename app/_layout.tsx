import { Stack } from 'expo-router';
import React from 'react';
 
export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Login screen */}
      <Stack.Screen name="index" />
 
      {/* Dashboard group — all screens inside (dashboard) folder */}
      <Stack.Screen name="(dashboard)" />
 
      {/* Modal — presented as a modal overlay */}
      <Stack.Screen
        name="modal"
        options={{
          presentation: 'transparentModal',
          animation: 'fade',
        }}
      />
    </Stack>
  );
}
 
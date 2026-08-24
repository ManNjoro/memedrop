import { useAuth } from '@clerk/expo';
import { Redirect } from 'expo-router';
import React from 'react';

export default function Index() {
  const { isLoaded } = useAuth();

  if (!isLoaded) return null;

  return <Redirect href='/(tabs)'/>;
}
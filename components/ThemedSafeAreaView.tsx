import React from 'react'
import { SafeAreaView } from './CustomSafeAreaView'

const ThemedSafeAreaView = ({children}: {children: React.ReactNode}) => {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg-light dark:bg-bg">
      {children}
    </SafeAreaView>
  )
}

export default ThemedSafeAreaView
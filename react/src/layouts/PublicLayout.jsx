import React from 'react'
import Header from '../components/Header'
import { useOutlet } from 'react-router-dom'
import Footer from '../components/Footer';

/**
 * Each public page will be wrapped in this layout
 * Avoid code duplication & keep a consistent layout
 */
export default function PublicLayout() {
  const outlet = useOutlet();

  return (
    <>
      <Header />
      {outlet}
      <Footer />
    </>
  )
}

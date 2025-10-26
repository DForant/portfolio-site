import React, { useEffect } from 'react'
import Header from '../components/Header'
import Hero from '../components/Hero'
import Clients from '../components/Clients'
import About from '../components/About'
import Services from '../components/Services'
import Portfolio from '../components/Portfolio'
import Contact from '../components/Contact'
import Footer from '../components/Footer'

function HomePage() {
  useEffect(() => {
    // Smooth scroll for internal anchor links
    const handleAnchorClick = (e) => {
      const target = e.target.closest('a[href^="#"]')
      if (!target) return
      
      const targetId = target.getAttribute('href')
      if (!targetId || targetId === '#') return
      
      const el = document.querySelector(targetId)
      if (el) {
        e.preventDefault()
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }

    document.addEventListener('click', handleAnchorClick)
    return () => document.removeEventListener('click', handleAnchorClick)
  }, [])

  // Intersection Observer for animations
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in')
        }
      })
    }, observerOptions)

    // Observe cards and sections
    document.querySelectorAll('.card, .clients__item, .about__media, .about__content').forEach(el => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <>
      <Header />
      <main id="home">
        <Hero />
        <Clients />
        <About />
        <Services />
        <Portfolio />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default HomePage

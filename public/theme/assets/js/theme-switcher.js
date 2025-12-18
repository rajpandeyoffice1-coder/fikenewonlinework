;(() => {
  'use strict'

  const getStoredTheme = () => localStorage.getItem('theme')
  const setStoredTheme = (theme) => localStorage.setItem('theme', theme)

  const getPreferredTheme = () => {
    const storedTheme = getStoredTheme()
    if (storedTheme) return storedTheme
    return 'light'
  }

  const setTheme = (theme) => {
    const html = document.documentElement

    // Remove existing theme classes
    html.classList.remove('light-theme', 'dark-theme')

    // Set Bootstrap data attribute (if you're using Bootstrap 5 theme support)
    html.setAttribute('data-bs-theme', theme === 'auto'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme
    )

    // Add theme class for custom styling
    if (theme === 'auto') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark-theme' : 'light-theme'
      html.classList.add(systemTheme)
    } else {
      html.classList.add(`${theme}-theme`)
    }
  }

  const showActiveTheme = (theme, focus = false) => {
    const themeSwitcher = document.querySelector('.theme-switcher')
    if (!themeSwitcher) return

    const activeThemeIcon = document.querySelector('.theme-icon-active i')
    const btnToActive = document.querySelector(`[data-bs-theme-value="${theme}"]`)
    const iconOfActiveBtn = btnToActive.querySelector('.theme-icon i').className

    document.querySelectorAll('[data-bs-theme-value]').forEach(el => {
      el.classList.remove('active')
      el.setAttribute('aria-pressed', 'false')
    })

    btnToActive.classList.add('active')
    btnToActive.setAttribute('aria-pressed', 'true')
    activeThemeIcon.className = iconOfActiveBtn
    themeSwitcher.setAttribute('aria-label', `Toggle theme (${theme})`)

    if (focus) themeSwitcher.focus()
  }

  // Detect system theme change if auto is selected
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getStoredTheme() === 'auto') {
      setTheme('auto')
    }
  })

  // On load
  window.addEventListener('DOMContentLoaded', () => {
    const theme = getPreferredTheme()
    setTheme(theme)
    showActiveTheme(theme)

    document.querySelectorAll('[data-bs-theme-value]').forEach(toggle => {
      toggle.addEventListener('click', () => {
        const selectedTheme = toggle.getAttribute('data-bs-theme-value')
        setStoredTheme(selectedTheme)
        setTheme(selectedTheme)
        showActiveTheme(selectedTheme, true)
      })
    })
  })
})()

import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { createTheme } from '@mui/material/styles'
import App from './App'

const ThemeApp = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode')
    return savedMode ? JSON.parse(savedMode) : false
  })

  const [primaryColor, setPrimaryColor] = useState(() => {
    const savedColor = localStorage.getItem('primaryColor')
    return savedColor || '#2196f3'
  })

  const [secondaryColor, setSecondaryColor] = useState(() => {
    const savedColor = localStorage.getItem('secondaryColor')
    return savedColor || '#f50057'
  })

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem('primaryColor', primaryColor)
  }, [primaryColor])

  useEffect(() => {
    localStorage.setItem('secondaryColor', secondaryColor)
  }, [secondaryColor])

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: primaryColor,
      },
      secondary: {
        main: secondaryColor,
      },
    },
  })

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        onPrimaryColorChange={setPrimaryColor}
        onSecondaryColorChange={setSecondaryColor}
      />
    </ThemeProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeApp />
  </React.StrictMode>,
)
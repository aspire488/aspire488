import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Fonts first so nothing paints with a fallback and swaps.
import '@fontsource-variable/archivo/standard.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'

// Design system order matters: tokens → reset/type → shell → sections.
import './styles/tokens.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/hero.css'
import './styles/work.css'
import './styles/data.css'

import App from './App'

// Mark the document as scripted *before* first paint so reveal states apply
// without a flash of already-animated content.
document.documentElement.classList.add('js-ready')

const container = document.getElementById('root')
if (!container) throw new Error('Missing #root element')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

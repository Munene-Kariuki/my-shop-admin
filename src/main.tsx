import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from '@/app/ErrorBoundary'
import { Providers } from '@/app/providers'
import App from './App.tsx'
import './index.css'

async function enableMocking() {
  const { worker } = await import('@/mocks/browser')
  // This app has no real backend — MSW intercepts every request, in dev and
  // in the deployed build alike, so the mock API "deploys" along with the app.
  return worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
    },
  })
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <Providers>
          <App />
        </Providers>
      </ErrorBoundary>
    </StrictMode>,
  )
})

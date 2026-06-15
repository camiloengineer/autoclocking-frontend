import { render } from 'solid-js/web'
import './index.css'
import App from './App.tsx'
import { QueryProvider } from './app/providers/query-provider'

const root = document.getElementById('root')

render(
    () => (
        <QueryProvider>
            <App />
        </QueryProvider>
    ),
    root!
)

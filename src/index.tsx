import { render } from 'solid-js/web'
import './index.css'
import App from './App.tsx'
import { QueryProvider } from './app/providers/query-provider'
import { MarcajesProvider } from './features/marcajes/application/marcajes.store'

const root = document.getElementById('root')

render(
    () => (
        <QueryProvider>
            <MarcajesProvider>
                <App />
            </MarcajesProvider>
        </QueryProvider>
    ),
    root!
)

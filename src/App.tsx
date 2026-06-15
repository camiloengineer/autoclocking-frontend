import { DashboardPage } from './pages/dashboard-page'

function App() {
    return (
        <div class="app-shell">
            <header class="app-header">
                <div class="app-header__brand">
                    <span class="brand-mark" />
                    <span>autoclocking</span>
                </div>
            </header>
            <DashboardPage />
        </div>
    )
}

export default App

import { PanelHeader } from '../components/ui/panel-header'

export function AboutPage() {
    return (
        <main class="dashboard-shell">
            <section class="panel about-panel">
                <PanelHeader title="About" detail="Why AutoClocking 2.0 exists" />
                <figure class="about-panel__figure">
                    <img src="/ironia.png" alt="Buk notice announcing that web marking has been permanently disabled" />
                    <figcaption>Buk, permanently disabling the thing this was built to automate.</figcaption>
                </figure>
                <div class="about-panel__copy">
                    <p>
                        I automated my clock-ins so I'd stop thinking about them. Then Buk permanently killed the web marking I had automated — the notice
                        above, in their own words. So I automated the new one too. If they kill this one, there will be a 3.0.
                    </p>
                </div>
            </section>
        </main>
    )
}

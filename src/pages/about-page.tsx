export function AboutPage() {
    return (
        <main class="dashboard-shell">
            <section class="panel about-panel">
                <div class="about-panel__copy">
                    <span class="hero-panel__eyebrow"><span class="signal-dot" /> About</span>
                    <h1>AutoClocking 2.0</h1>
                    <p>
                        I automated clocking in and out so I'd never have to think about it again. Then Buk permanently disabled the web marking I had
                        automated — the notice on the right, in their own words.
                    </p>
                    <p>
                        So I automated the new one too. Version 2.0 exists because version 1.0 worked flawlessly, right up until it wasn't allowed to. If
                        they kill this one, there will be a 3.0.
                    </p>
                </div>
                <figure class="about-panel__figure">
                    <img src="/ironia.png" alt="Buk notice announcing that web marking has been permanently disabled" />
                    <figcaption>Buk, permanently disabling the thing this was built to automate.</figcaption>
                </figure>
            </section>
        </main>
    )
}

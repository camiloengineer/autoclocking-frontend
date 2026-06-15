import { createMemo, Show } from 'solid-js'
import { HistoryTable } from '../components/history-table'
import { StatusBadge } from '../components/status-badge'
import { useMarcajes } from '../hooks/use-marcajes'
import { formatActionLabel, formatCreatedAt, formatStatusLabel, getActionTone, getLatestRecord, getStatusTone, summarizeStatuses } from '../utils/formatters'

export function DashboardPage() {
    const marcajesQuery = useMarcajes()

    const records = createMemo(() => marcajesQuery.data?.items ?? [])
    const recordCount = createMemo(() => marcajesQuery.data?.count ?? 0)
    const latestRecord = createMemo(() => getLatestRecord(records()))
    const statusSummary = createMemo(() => summarizeStatuses(records()))

    const handleRefresh = async () => {
        await marcajesQuery.refetch()
    }

    return (
        <main class="dashboard-shell">
            <section class="hero-panel panel">
                <div class="hero-panel__content">
                    <div>
                        <div class="hero-panel__title">
                            <img class="hero-panel__icon" src="/biohazard.svg" alt="" aria-hidden="true" />
                            <h1>AutoClocking</h1>
                        </div>
                        <p class="hero-panel__lead">Historial operativo de marcajes automáticos.</p>
                    </div>
                    <div class="hero-panel__actions">
                        <button class="terminal-button" type="button" onClick={handleRefresh} disabled={marcajesQuery.isRefetching}>
                            {marcajesQuery.isRefetching ? 'Refrescando...' : 'Refrescar ahora'}
                        </button>
                    </div>
                </div>
            </section>

            <section class="content-grid">
                <article class="panel spotlight-panel">
                    <div class="panel-header">
                        <div>
                            <span class="panel-label">Último evento detectado</span>
                            <h2>Registro más reciente</h2>
                        </div>
                        <Show when={latestRecord()}>
                            {(record) => <StatusBadge tone={getStatusTone(record().status)}>{formatStatusLabel(record().status)}</StatusBadge>}
                        </Show>
                    </div>

                    <Show
                        when={latestRecord()}
                        fallback={
                            <div class="empty-state">
                                <span class="empty-state__icon">[ vacío ]</span>
                                <h3>Aún no hay marcajes cargados</h3>
                                <p>El endpoint está activo, pero en este momento no devuelve registros. La UI queda lista para mostrar el primer evento apenas exista.</p>
                            </div>
                        }
                    >
                        {(record) => (
                            <div class="spotlight-record">
                                <div class="spotlight-record__row">
                                    <span class="panel-detail">Acción</span>
                                    <StatusBadge tone={getActionTone(record().action_type)}>{formatActionLabel(record().action_type)}</StatusBadge>
                                </div>
                                <div class="spotlight-record__row">
                                    <span class="panel-detail">Fecha del registro</span>
                                    <strong>{formatCreatedAt(record().created_at)}</strong>
                                </div>
                                <div class="spotlight-record__row">
                                    <span class="panel-detail">Fecha CLT</span>
                                    <strong>{record().fecha_clt || 'Sin fecha CLT'}</strong>
                                </div>
                                <div class="spotlight-record__row">
                                    <span class="panel-detail">RUT</span>
                                    <strong>{record().rut_masked || 'Oculto'}</strong>
                                </div>
                                <div class="spotlight-record__row">
                                    <span class="panel-detail">Corrida</span>
                                    <strong>{record().run_number || 'Sin corrida'}</strong>
                                </div>
                                <div class="spotlight-record__message">
                                    <span class="panel-detail">Mensaje</span>
                                    <p>{record().message || 'Sin detalle adicional'}</p>
                                </div>
                            </div>
                        )}
                    </Show>
                </article>
            </section>

            <section class="panel history-panel">
                <div class="panel-header">
                    <div>
                        <span class="panel-label">Historial cronológico</span>
                        <h2>Feed de marcajes</h2>
                    </div>
                    <span class="panel-detail">Orden descendente por created_at</span>
                </div>

                <Show
                    when={!marcajesQuery.isLoading && records().length > 0}
                    fallback={
                        <div class="history-fallback">
                            <Show
                                when={marcajesQuery.isLoading}
                                fallback={<p>Sin filas disponibles todavía. Cuando existan marcajes, aparecerán aquí con su estado y detalle.</p>}
                            >
                                <div class="loading-grid" aria-hidden="true">
                                    <span />
                                    <span />
                                    <span />
                                </div>
                            </Show>
                        </div>
                    }
                >
                    <HistoryTable items={records()} />
                </Show>
            </section>

            <details class="panel technical-details">
                <summary class="technical-details__summary">
                    <div>
                        <span class="panel-label">Detalles técnicos</span>
                        <h2>Estado del endpoint y telemetría</h2>
                    </div>
                    <span class="technical-details__hint">Expandir</span>
                </summary>

                <div class="technical-details__content">
                    <div class="technical-details__grid">
                        <div class="technical-stat">
                            <span class="panel-label">Endpoint</span>
                            <strong>{marcajesQuery.isError ? 'OFFLINE' : 'ONLINE'}</strong>
                            <span class="panel-detail">{marcajesQuery.isError ? 'No hubo respuesta válida del servicio.' : 'La API respondió correctamente.'}</span>
                        </div>
                        <div class="technical-stat">
                            <span class="panel-label">Registros visibles</span>
                            <strong>{String(recordCount())}</strong>
                            <span class="panel-detail">Respuesta actual del endpoint GET /?limit=100.</span>
                        </div>
                        <div class="technical-stat">
                            <span class="panel-label">Marcajes confirmados</span>
                            <strong>{String(statusSummary().success)}</strong>
                            <span class="panel-detail">{`${statusSummary().error} con error / ${statusSummary().info} informativos`}</span>
                        </div>
                    </div>

                    <dl class="system-list">
                        <div>
                            <dt>Origen</dt>
                            <dd>Cloud Function + Firestore</dd>
                        </div>
                        <div>
                            <dt>Refresco automático</dt>
                            <dd>Cada 60 segundos y al recuperar foco</dd>
                        </div>
                        <div>
                            <dt>Límite consultado</dt>
                            <dd>100 registros</dd>
                        </div>
                    </dl>

                    <Show when={marcajesQuery.isError}>
                        <div class="error-banner">
                            <strong>Error de lectura</strong>
                            <p>{marcajesQuery.error instanceof Error ? marcajesQuery.error.message : 'No se pudo consultar el endpoint.'}</p>
                        </div>
                    </Show>
                </div>
            </details>
        </main>
    )
}

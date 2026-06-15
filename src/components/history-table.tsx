import { For } from 'solid-js'
import type { MarcajeItem } from '../services/marcajes.api'
import { formatActionLabel, formatCreatedAt, formatStatusLabel, getActionTone, getStatusTone } from '../utils/formatters'
import { StatusBadge } from './status-badge'

type HistoryTableProps = {
    items: MarcajeItem[]
}

export function HistoryTable(props: HistoryTableProps) {
    return (
        <div class="table-shell">
            <table class="history-table">
                <thead>
                    <tr>
                        <th>Acción</th>
                        <th>Estado</th>
                        <th>Fecha del registro</th>
                        <th>Fecha CLT</th>
                        <th>RUT</th>
                        <th>Corrida</th>
                        <th>Mensaje</th>
                    </tr>
                </thead>
                <tbody>
                    <For each={props.items}>
                        {(item) => (
                            <tr>
                                <td>
                                    <StatusBadge tone={getActionTone(item.action_type)}>{formatActionLabel(item.action_type)}</StatusBadge>
                                </td>
                                <td>
                                    <StatusBadge tone={getStatusTone(item.status)}>{formatStatusLabel(item.status)}</StatusBadge>
                                </td>
                                <td>{formatCreatedAt(item.created_at)}</td>
                                <td>{item.fecha_clt || 'Sin fecha CLT'}</td>
                                <td>{item.rut_masked || 'Oculto'}</td>
                                <td>{item.run_number || 'Sin corrida'}</td>
                                <td class="history-table__message">{item.message || 'Sin detalle adicional'}</td>
                            </tr>
                        )}
                    </For>
                </tbody>
            </table>
        </div>
    )
}

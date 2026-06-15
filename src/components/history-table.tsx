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
                        <th>Action</th>
                        <th>Status</th>
                        <th>Recorded at</th>
                        <th>CLT date</th>
                        <th>RUT</th>
                        <th>Run number</th>
                        <th>Message</th>
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
                                <td>{item.fecha_clt || 'No CLT date available'}</td>
                                <td>{item.rut_masked || 'Hidden'}</td>
                                <td>{item.run_number || 'No run number'}</td>
                                <td class="history-table__message">{item.message || 'No additional detail'}</td>
                            </tr>
                        )}
                    </For>
                </tbody>
            </table>
        </div>
    )
}

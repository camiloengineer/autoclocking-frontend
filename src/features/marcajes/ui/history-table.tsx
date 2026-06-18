import { For } from 'solid-js'
import type { MarcajeItem } from '../domain/marcaje.types'
import { formatActionLabel, formatCreatedAt, formatMessageSummary, formatStatusLabel, getActionTone, getStatusTone } from '../domain/marcaje.formatters'
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
                        <th>Clocked at</th>
                        <th>RUT</th>
                        <th>Message</th>
                    </tr>
                </thead>
                <tbody>
                    <For each={props.items}>
                        {(item) => (
                            <tr>
                                <td>
                                    <StatusBadge tone={getActionTone(item.action_type)} variant="action">
                                        {formatActionLabel(item.action_type)}
                                    </StatusBadge>
                                </td>
                                <td>
                                    <StatusBadge tone={getStatusTone(item.status)}>{formatStatusLabel(item.status)}</StatusBadge>
                                </td>
                                <td>{formatCreatedAt(item.created_at)}</td>
                                <td>{item.rut_masked || 'Hidden'}</td>
                                <td class="history-table__message">
                                    <div class="history-table__message-summary">{formatMessageSummary(item.message || 'No additional detail', item.rut_masked)}</div>
                                </td>
                            </tr>
                        )}
                    </For>
                </tbody>
            </table>
        </div>
    )
}

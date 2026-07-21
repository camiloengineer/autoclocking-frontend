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
                        <th>Timestamp</th>
                        <th>Account</th>
                        <th>Summary</th>
                    </tr>
                </thead>
                <tbody>
                    <For each={props.items}>
                        {(item) => (
                            <tr>
                                <td data-label="Action">
                                    <StatusBadge tone={getActionTone(item.action_type)} variant="action">
                                        {formatActionLabel(item.action_type)}
                                    </StatusBadge>
                                </td>
                                <td data-label="Status">
                                    <StatusBadge tone={getStatusTone(item.status)}>{formatStatusLabel(item.status)}</StatusBadge>
                                </td>
                                <td data-label="Timestamp">{formatCreatedAt(item.created_at)}</td>
                                <td data-label="Account">{item.email_masked || 'Hidden'}</td>
                                <td class="history-table__message" data-label="Summary">
                                    <div class="history-table__message-summary">{formatMessageSummary(item.message || 'No additional detail')}</div>
                                </td>
                            </tr>
                        )}
                    </For>
                </tbody>
            </table>
        </div>
    )
}

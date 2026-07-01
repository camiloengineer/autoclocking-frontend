import type { MarcajeItem } from './marcaje.types'

/**
 * Decides whether a marcaje belongs in the clocking feed.
 * Confirmed and failed clock-ins/outs are relevant, holidays are always kept,
 * and informational noise (duplicate-prevented, debug simulations) is excluded.
 */
export function isFeedRelevantMarcaje(item: MarcajeItem): boolean {
    return item.action_type === 'FERIADO' || item.status !== 'info'
}

import { useEffect, useRef } from 'react'
import { fetchMultiplePrices } from './useStockPrice'
import { useApp } from '../context/AppContext'

export function useAlerts() {
  const { alerts, triggerAlert } = useApp()
  const intervalRef = useRef(null)

  useEffect(() => {
    const activeAlerts = alerts.filter(a => !a.triggered)
    if (activeAlerts.length === 0) return

    async function check() {
      const symbols = [...new Set(activeAlerts.map(a => a.symbol))]
      const prices = await fetchMultiplePrices(symbols)
      activeAlerts.forEach(alert => {
        const price = prices[alert.symbol]
        if (!price) return
        const hit = alert.direction === 'above' ? price >= alert.targetPrice : price <= alert.targetPrice
        if (hit) {
          triggerAlert(alert.id)
          fireNotification(alert, price)
        }
      })
    }

    check()
    intervalRef.current = setInterval(check, 60 * 1000)
    return () => clearInterval(intervalRef.current)
  }, [alerts])
}

function fireNotification(alert, price) {
  const msg = `${alert.symbol} est ${alert.direction === 'above' ? 'au-dessus' : 'en-dessous'} de ${alert.targetPrice} — Prix actuel: ${price.toFixed(2)}`

  // Browser notification
  if (Notification.permission === 'granted') {
    new Notification(`🔔 Alerte Trackr — ${alert.symbol}`, {
      body: msg,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
    })
  }

  // Fallback: in-app toast via CustomEvent
  window.dispatchEvent(new CustomEvent('trackr:alert', { detail: { title: alert.symbol, body: msg, id: alert.id } }))
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const perm = await Notification.requestPermission()
  return perm === 'granted'
}

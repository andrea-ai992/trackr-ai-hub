import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export default function Modal({ title, onClose, children, size = 'md' }) {
  const contentRef = useRef(null)
  const dragStartY = useRef(null)
  const [dragY, setDragY] = useState(0)

  // Escape key
  useEffect(() => {
    const h = e => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  // Drag-to-dismiss on the handle
  function onHandleTouchStart(e) {
    dragStartY.current = e.touches[0].clientY
  }
  function onHandleTouchMove(e) {
    if (dragStartY.current == null) return
    const delta = Math.max(0, e.touches[0].clientY - dragStartY.current)
    setDragY(delta)
  }
  function onHandleTouchEnd() {
    if (dragY > 80) {
      navigator.vibrate?.(6)
      onClose()
    } else {
      setDragY(0)
    }
    dragStartY.current = null
  }

  const maxW = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' }[size]

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={contentRef}
        className={`w-full ${maxW}`}
        style={{
          background: 'rgba(12,12,22,0.95)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 0 60px rgba(99,102,241,0.1), 0 25px 60px rgba(0,0,0,0.7)',
          borderRadius: '28px 28px 0 0',
          animation: 'slideUp 300ms cubic-bezier(0.22,1,0.36,1)',
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
          transition: dragY === 0 ? 'transform 0.25s ease' : 'none',
          willChange: 'transform',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Drag handle */}
        <div
          style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px', cursor: 'grab' }}
          onTouchStart={onHandleTouchStart}
          onTouchMove={onHandleTouchMove}
          onTouchEnd={onHandleTouchEnd}
        >
          <div style={{ width: 36, height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.18)' }} />
        </div>

        <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 press-scale"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

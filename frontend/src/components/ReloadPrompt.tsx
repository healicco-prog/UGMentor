// @ts-nocheck
import React from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: any) {
      // eslint-disable-next-line prefer-template
      console.log('SW Registered: ' + r)
    },
    onRegisterError(error: any) {
      console.log('SW registration error', error)
    },
  })

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <div className="ReloadPrompt-container">
      { (offlineReady || needRefresh)
        && (
          <div className="ReloadPrompt-toast" style={{ position: 'fixed', bottom: '20px', right: '20px', backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '16px', zIndex: 9999, color: 'white', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
            <div className="ReloadPrompt-message">
              { offlineReady
                ? <span>App ready to work offline</span>
                : <span>A new version of UGMentor is available.</span>
              }
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              { needRefresh && (
                <button className="btn btn-primary btn-sm" onClick={() => updateServiceWorker(true)}>
                  Update Now
                </button>
              )}
              <button className="btn btn-secondary btn-sm" onClick={() => close()}>
                Later
              </button>
            </div>
          </div>
        )
      }
    </div>
  )
}

export default ReloadPrompt

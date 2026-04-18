import { useEffect, useRef } from 'react';

const TradingViewWidget = ({ symbol = 'BINANCE:BTCUSDT', interval = '1D', theme = 'dark', locale = 'fr' }) => {
  const containerRef = useRef(null);
  const scriptRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.type = 'text/javascript';
    script.innerHTML = `
      new window.TradingView.widget({
        autosize: true,
        symbol: "${symbol}",
        interval: "${interval}",
        timezone: "Etc/UTC",
        theme: "${theme}",
        style: "1",
        locale: "${locale}",
        toolbar_bg: "#111",
        enable_publishing: false,
        allow_symbol_change: true,
        container_id: "${containerRef.current.id}"
      });
    `;

    containerRef.current.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (scriptRef.current && containerRef.current.contains(scriptRef.current)) {
        containerRef.current.removeChild(scriptRef.current);
      }
    };
  }, [symbol, interval, theme, locale]);

  return (
    <div
      id="tradingview-widget-container"
      ref={containerRef}
      style={{
        width: '100%',
        height: '500px',
        minHeight: '400px',
        backgroundColor: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    />
  );
};

export default TradingViewWidget;
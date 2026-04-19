import React, { useEffect, useRef } from 'react';

const TradingViewWidget = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          autosize: true,
          symbol: "BINANCE:BTCUSDT",
          interval: "D",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: containerRef.current.id,
          studies: [
            "STD;RSI@tv-basicstudies"
          ],
          show_popup_button: true,
          popup_width: "1000",
          popup_height: "650"
        });
      }
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div
      id="tradingview-widget-container"
      ref={containerRef}
      style={{
        width: '100%',
        height: '600px',
        fontFamily: 'JetBrains Mono, monospace',
      }}
    />
  );
};

export default TradingViewWidget;
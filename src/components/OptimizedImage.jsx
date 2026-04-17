src/components/OptimizedImage.jsx

import { useState, useEffect, useRef, useCallback, memo } from 'react';

const LQIP_SIZE = 20;
const DEFAULT_QUALITY = 85;
const DEFAULT_SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

const generateBlurDataURL = (width = LQIP_SIZE, height = LQIP_SIZE, color = '#1a1a2e') => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, '#16213e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  return canvas.toDataURL('image/jpeg', 0.1);
};

const generateSrcSet = (src, widths = [320, 480, 640, 768, 1024, 1280, 1920]) => {
  if (!src || src.startsWith('data:') || src.startsWith('blob:')) return '';
  const url = new URL(src, window.location.origin);
  const ext = url.pathname.split('.').pop().toLowerCase();
  const basePath = url.pathname.replace(`.${ext}`, '');
  return widths
    .map(w => {
      const webpPath = `${basePath}-${w}w.webp`;
      return `${webpPath} ${w}w`;
    })
    .join(', ');
};

const generateWebPSrc = (src) => {
  if (!src || src.startsWith('data:') || src.startsWith('blob:') || src.startsWith('http')) return src;
  const ext = src.split('.').pop().toLowerCase();
  if (ext === 'webp') return src;
  return src.replace(`.${ext}`, '.webp');
};

const shimmer = (w, h) => `
  <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop stop-color="#1a1a2e" offset="0%" />
        <stop stop-color="#16213e" offset="20%" />
        <stop stop-color="#0f3460" offset="60%" />
        <stop stop-color="#1a1a2e" offset="100%" />
        <animateTransform attributeName="gradientTransform" type="translate" values="-1 0;1 0;-1 0" dur="1.5s" repeatCount="indefinite"/>
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g)" />
  </svg>
`;

const toBase64 = (str) => {
  if (typeof window !== 'undefined') {
    return window.btoa(unescape(encodeURIComponent(str)));
  }
  return Buffer.from(str).toString('base64');
};

const shimmerDataURL = (w, h) =>
  `data:image/svg+xml;base64,${toBase64(shimmer(w, h))}`;

const imageRegistry = new Map();
const pendingLoads = new Map();

const preloadImage = (src) => {
  if (imageRegistry.has(src)) return imageRegistry.get(src);
  if (pendingLoads.has(src)) return pendingLoads.get(src);
  const promise = new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageRegistry.set(src, { loaded: true, src });
      pendingLoads.delete(src);
      resolve({ loaded: true, src });
    };
    img.onerror = () => {
      pendingLoads.delete(src);
      reject(new Error(`Failed to load image: ${src}`));
    };
    img.src = src;
  });
  pendingLoads.set(src, promise);
  return promise;
};

const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (!window.IntersectionObserver) {
      setIsIntersecting(true);
      setHasIntersected(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          setHasIntersected(true);
        } else {
          setIsIntersecting(false);
        }
      },
      {
        rootMargin: options.rootMargin || '200px 0px',
        threshold: options.threshold || 0,
        ...options,
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [options.rootMargin, options.threshold]);

  return [ref, isIntersecting, hasIntersected];
};

const useImageLoader = (src, webpSrc, { lazy, priority, onLoad, onError }) => {
  const [state, setState] = useState({
    loaded: false,
    error: false,
    currentSrc: null,
    blurDataURL: null,
    isWebPSupported: false,
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!src) return;

    const checkWebPSupport = async () => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img.width > 0 && img.height > 0);
        img.onerror = () => resolve(false);
        img.src = 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA';
      });
    };

    const generateLQIP = async () => {
      try {
        const dataURL = generateBlurDataURL(LQIP_SIZE, LQIP_SIZE);
        if (mountedRef.current) {
          setState(prev => ({ ...prev, blurDataURL: dataURL }));
        }
      } catch {
        // fallback silently
      }
    };

    const loadImage = async () => {
      const isWebPSupported = await checkWebPSupport();
      await generateLQIP();

      const targetSrc = isWebPSupported && webpSrc ? webpSrc : src;

      if (imageRegistry.has(targetSrc)) {
        if (mountedRef.current) {
          setState(prev => ({
            ...prev,
            loaded: true,
            currentSrc: targetSrc,
            isWebPSupported,
          }));
          onLoad?.({ src: targetSrc, cached: true });
        }
        return;
      }

      try {
        await preloadImage(targetSrc);
        if (mountedRef.current) {
          setState(prev => ({
            ...prev,
            loaded: true,
            currentSrc: targetSrc,
            isWebPSupported,
          }));
          onLoad?.({ src: targetSrc, cached: false });
        }
      } catch {
        try {
          await preloadImage(src);
          if (mountedRef.current) {
            setState(prev => ({
              ...prev,
              loaded: true,
              currentSrc: src,
              isWebPSupported,
              error: false,
            }));
            onLoad?.({ src, cached: false, fallback: true });
          }
        } catch (fallbackErr) {
          if (mountedRef.current) {
            setState(prev => ({
              ...prev,
              loaded: false,
              error: true,
              isWebPSupported,
            }));
            onError?.(fallbackErr);
          }
        }
      }
    };

    if (priority || !lazy) {
      loadImage();
    }
  }, [src, webpSrc, lazy, priority]);

  const triggerLoad = useCallback(() => {
    if (state.loaded || state.error) return;

    const checkWebPSupport = () =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img.width > 0 && img.height > 0);
        img.onerror = () => resolve(false);
        img.src = 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA';
      });

    (async () => {
      const isWebPSupported = await checkWebPSupport();
      const targetSrc = isWebPSupported && webpSrc ? webpSrc : src;

      try {
        await preloadImage(targetSrc);
        if (mountedRef.current) {
          setState(prev => ({
            ...prev,
            loaded: true,
            currentSrc: targetSrc,
            isWebPSupported,
          }));
          onLoad?.({ src: targetSrc, cached: false });
        }
      } catch {
        try {
          await preloadImage(src);
          if (mountedRef.current) {
            setState(prev => ({
              ...prev,
              loaded: true,
              currentSrc: src,
              isWebPSupported,
            }));
            onLoad?.({ src, fallback: true });
          }
        } catch (err) {
          if (mountedRef.current) {
            setState(prev => ({ ...prev, error: true }));
            onError?.(err);
          }
        }
      }
    })();
  }, [src, webpSrc, state.loaded, state.error, onLoad, onError]);

  return { ...state, triggerLoad };
};

const ErrorFallback = ({ alt, width, height, className }) => (
  <div
    className={className}
    role="img"
    aria-label={alt}
    style={{
      width: width || '100%',
      height: height || '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      borderRadius: 'inherit',
      flexDirection: 'column',
      gap: '8px',
      color: '#e94560',
      fontSize: '12px',
      fontFamily: 'system-ui, sans-serif',
    }}
  >
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
    <span style={{ opacity: 0.7 }}>Image unavailable</span>
  </div>
);

const PlaceholderSkeleton = ({ width, height, shimmer: useShimmer = true, style = {} }) => (
  <div
    aria-hidden="true"
    style={{
      width: width || '100%',
      height: height || '100%',
      background: useShimmer
        ? `url("${shimmerDataURL(width || 400, height || 300)}") center/cover no-repeat`
        : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      borderRadius: 'inherit',
      transition: 'opacity 0.3s ease',
      ...style,
    }}
  />
);

const OptimizedImage = memo(({
  src,
  alt = '',
  width,
  height,
  className = '',
  style = {},
  objectFit = 'cover',
  objectPosition = 'center',
  lazy = true,
  priority = false,
  quality = DEFAULT_QUALITY,
  sizes = DEFAULT_SIZES,
  srcSet: customSrcSet,
  webpSrc: customWebpSrc,
  placeholder = 'shimmer',
  blurDataURL: customBlurDataURL,
  onLoad,
  onError,
  onClick,
  decoding = 'async',
  fetchPriority,
  fallbackSrc,
  aspectRatio,
  fill = false,
  rounded = false,
  shadow = false,
  overlay = false,
  overlayColor = 'rgba(0,0,0,0.4)',
  caption,
  'data-testid': testId,
  intersectionOptions = {},
  ...rest
}) => {
  const [observerRef, isIntersecting, hasIntersected] = useIntersectionObserver(intersectionOptions);
  const imgRef = useRef(null);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  const webpSrc = customWebpSrc || (src ? generateWebPSrc(src) : null);
  const shouldLoad = priority || !lazy || hasIntersected;

  const {
    loaded,
    error,
    currentSrc,
    blurDataURL,
    triggerLoad,
  } = useImageLoader(src, webpSrc, {
    lazy,
    priority,
    onLoad,
    onError,
  });

  useEffect(() => {
    if (hasIntersected && !loaded && !error) {
      triggerLoad();
    }
  }, [hasIntersected, loaded, error, triggerLoad]);

  const handleImgLoad = useCallback((e) => {
    const img = e.currentTarget;
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    onLoad?.({ src: img.src, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight });
  }, [onLoad]);

  const handleImgError = useCallback((e) => {
    const img = e.currentTarget;
    if (fallbackSrc && img.src !== fallbackSrc) {
      img.src = fallbackSrc;
      return;
    }
    onError?.(new Error(`Image load failed: ${img.src}`));
  }, [fallbackSrc, onError]);

  const computedSrcSet = customSrcSet || (currentSrc ? generateSrcSet(currentSrc) : '');

  const containerStyle = {
    position: 'relative',
    display: 'inline-block',
    overflow: 'hidden',
    ...(fill ? { position: 'absolute', inset: 0, width: '100%', height: '100%' } : {}),
    ...(width && !fill ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
    ...(height && !fill ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
    ...(aspectRatio && !fill ? { aspectRatio: String(aspectRatio) } : {}),
    ...(rounded ? { borderRadius: typeof rounded === 'boolean' ? '50%' : rounded } : {}),
    ...(shadow ? { boxShadow: '0 10px 40px rgba(0,0,0,0.4)' } : {}),
    ...style,
  };

  const imgStyle = {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit,
    objectPosition,
    transition: 'opacity 0.4s ease, filter 0.4s ease',
    opacity: loaded ? 1 : 0,
    filter: loaded ? 'none' : 'blur(8px)',
    position: fill ? 'absolute' : 'relative',
    inset: fill ? 0 : 'auto',
  };

  const placeholderStyle = {
    position: 'absolute',
    inset: 0,
    transition: 'opacity 0.4s ease',
    opacity: loaded ? 0 : 1,
    pointerEvents: 'none',
  };

  if (!src && !error) {
    return (
      <div
        ref={observerRef}
        className={className}
        style={containerStyle}
        data-testid={testId}
        role="img"
        aria-label={alt}
      >
        <PlaceholderSkeleton width={width} height={height} />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={className}
        style={containerStyle}
        data-testid={testId}
      >
        <ErrorFallback alt={alt} width={width} height={height} />
      </div>
    );
  }

  return (
    <figure
      ref={observerRef}
      className={`optimized-image-wrapper${className ? ` ${className}` : ''}`}
      style={{ ...containerStyle, margin: 0, padding: 0 }}
      data-testid={testId}
      onClick={onClick}
    >
      {!loaded && (
        <div style={placeholderStyle} aria-hidden="true">
          {placeholder === 'shimmer' && (
            <PlaceholderSkeleton
              width={typeof width === 'number' ? width : 400}
              height={typeof height === 'number' ? height : 300}
              shimmer
            />
          )}
          {placeholder === 'blur' && (customBlurDataURL || blurDataURL) && (
            <img
              src={customBlurDataURL || blurDataURL}
              alt=""
              aria-hidden="true"
              style={{
                width: '100%',
                height: '100%',
                objectFit,
                objectPosition,
                filter: 'blur(20px)',
                transform: 'scale(1.1)',
              }}
            />
          )}
          {placeholder === 'color' && (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              }}
            />
          )}
        </div>
      )}

      {shouldLoad && currentSrc && (
        <picture style={{ display: 'contents' }}>
          {webpSrc && webpSrc !== currentSrc && (
            <source
              type="image/webp"
              srcSet={computedSrcSet || webpSrc}
              sizes={sizes}
            />
          )}
          {src && (
            <source
              type={`image/${src.split('.').pop().toLowerCase() || 'jpeg'}`}
              srcSet={src}
              sizes={sizes}
            />
          )}
          <img
            ref={imgRef}
            src={currentSrc}
            srcSet={computedS
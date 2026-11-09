import 'react';

// Lets style objects carry the CSS custom properties the stylesheets read (--d, --i, --p, ...) without casts.
declare module 'react' {
  interface CSSProperties {
    [property: `--${string}`]: string | number | undefined;
  }
}

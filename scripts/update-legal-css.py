#!/usr/bin/env python3
"""Update legal/support pages CSS to cinematic theme."""

import re
import os

CINEMATIC_CSS = '''@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');

    :root {
      --bg-deep: #050505;
      --bg-dark: #0a0a0a;
      --bg-card: #111111;
      --text-primary: #ffffff;
      --text-secondary: #888888;
      --text-dim: #555555;
      --spotlight-warm: #ffedd5;
      --spotlight-gold: #fbbf24;
      --spotlight-amber: #f59e0b;
      --accent: #D4736B;
      --accent-light: #F2D4D1;
      --border-subtle: rgba(255, 255, 255, 0.05);
      --border-light: rgba(255, 255, 255, 0.1);
    }
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
    
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      color: var(--text-primary);
      line-height: 1.6;
      background: var(--bg-deep);
      -webkit-font-smoothing: antialiased;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
    }

    a { color: var(--spotlight-gold); text-decoration: none; transition: color 0.3s; }
    a:hover { color: var(--spotlight-warm); }
    a:focus-visible { outline: 2px solid var(--spotlight-gold); outline-offset: 2px; }

    .grain {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 1000;
      opacity: 0.03;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    }
    
    .header {
      background: linear-gradient(to bottom, rgba(5, 5, 5, 0.95) 0%, rgba(5, 5, 5, 0.8) 100%);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--border-subtle);
      padding: 0.875rem 1rem;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    
    .header-content {
      max-width: 720px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    
    .header-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: var(--text-primary);
      font-family: 'Playfair Display', serif;
      font-weight: 500;
      font-size: 1.2rem;
      min-height: 44px;
      letter-spacing: 0.02em;
    }
    
    .header-brand:hover { color: var(--text-primary); }
    .header-brand img { width: 32px; height: 32px; border-radius: 8px; }
    
    .header-cta {
      background: transparent;
      color: var(--text-primary);
      padding: 0.5rem 1rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      font-size: 0.8rem;
      font-weight: 500;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      transition: all 0.3s;
    }
    
    .header-cta:hover {
      background: var(--text-primary);
      color: var(--bg-deep);
    }
    
    main {
      flex: 1;
      position: relative;
      z-index: 1;
    }
    
    .content {
      max-width: 720px;
      margin: 0 auto;
      padding: 3rem 1.25rem;
    }
    
    h1 {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2rem, 5vw, 2.5rem);
      font-weight: 400;
      margin-bottom: 0.5rem;
      color: var(--text-primary);
      letter-spacing: -0.02em;
    }
    
    .last-updated {
      color: var(--text-dim);
      font-size: 0.85rem;
      margin-bottom: 2.5rem;
      letter-spacing: 0.05em;
    }
    
    h2 {
      font-family: 'Playfair Display', serif;
      font-size: 1.5rem;
      font-weight: 500;
      margin: 2.5rem 0 1rem;
      color: var(--text-primary);
      letter-spacing: -0.01em;
    }
    
    h3 {
      font-family: 'Playfair Display', serif;
      font-size: 1.15rem;
      font-weight: 500;
      margin: 2rem 0 0.75rem;
      color: var(--text-primary);
    }
    
    p {
      margin-bottom: 1.25rem;
      color: var(--text-secondary);
      font-weight: 300;
      line-height: 1.8;
    }
    
    ul, ol {
      margin-bottom: 1.25rem;
      padding-left: 1.5rem;
      color: var(--text-secondary);
    }
    
    li {
      margin-bottom: 0.5rem;
      font-weight: 300;
    }
    
    .highlight-box {
      background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(251, 191, 36, 0.05) 100%);
      border: 1px solid rgba(251, 191, 36, 0.2);
      padding: 1.5rem;
      margin: 2rem 0;
    }
    
    .highlight-box p { margin-bottom: 0; color: var(--text-primary); font-weight: 400; }
    .highlight-box strong { color: var(--spotlight-gold); }
    
    .contact-box {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      padding: 2rem;
      margin: 2rem 0;
      position: relative;
    }
    
    .contact-box::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.3), transparent);
    }
    
    .contact-box h3 {
      font-family: 'Playfair Display', serif;
      margin-top: 0;
      margin-bottom: 1rem;
      color: var(--text-primary);
    }
    
    .contact-box p { margin-bottom: 0.5rem; }
    .contact-box p:last-child { margin-bottom: 0; }
    
    .footer {
      background: var(--bg-deep);
      border-top: 1px solid var(--border-subtle);
      padding: 2rem 1rem;
      text-align: center;
      color: var(--text-dim);
      position: relative;
      z-index: 1;
    }
    
    .footer-content {
      max-width: 720px;
      margin: 0 auto;
    }
    
    .footer-brand {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-dim);
      font-family: 'Playfair Display', serif;
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }
    
    .footer-brand img { width: 24px; height: 24px; border-radius: 6px; opacity: 0.7; }
    
    .footer-links {
      display: flex;
      gap: 1.5rem;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 1.5rem;
    }
    
    .footer-links a {
      color: var(--text-dim);
      font-size: 0.8rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      padding: 0.5rem 0;
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      transition: color 0.3s;
    }
    
    .footer-links a:hover { color: var(--text-secondary); }
    
    .copyright {
      font-size: 0.75rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-subtle);
    }
    
    @media (max-width: 640px) {
      .content { padding: 2rem 1rem; }
      .footer-links { flex-direction: column; gap: 0.25rem; }
    }'''

GRAIN_DIV = '  <div class="grain"></div>\n'

def update_page(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Replace style block
    style_pattern = r'<style>.*?</style>'
    new_style = f'<style>\n{CINEMATIC_CSS}\n  </style>'
    content = re.sub(style_pattern, new_style, content, flags=re.DOTALL)
    
    # Add grain div after body if not present
    if '<div class="grain">' not in content:
        content = content.replace('<body>', '<body>\n' + GRAIN_DIV)
    
    # Add font preconnect if not present
    if 'fonts.googleapis.com' not in content:
        content = content.replace('</head>', '''  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
</head>''')
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    print(f"Updated: {filepath}")

if __name__ == '__main__':
    public_dir = '/Users/jarrydaubert/Desktop/Project Nexus/prosepal-web/public'
    files = ['privacy.html', 'terms.html', 'support.html']
    
    for f in files:
        update_page(os.path.join(public_dir, f))
    
    print("All legal/support pages updated!")

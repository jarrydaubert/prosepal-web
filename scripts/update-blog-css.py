#!/usr/bin/env python3
"""Update blog post CSS to cinematic theme."""

import re
import os

CINEMATIC_CSS = '''@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Source+Sans+3:wght@400;500;600;700;800&display=swap');

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
    html { scroll-behavior: smooth; }

    body {
      font-family: 'Source Sans 3', -apple-system, sans-serif;
      color: var(--text-primary);
      line-height: 1.7;
      background: var(--bg-deep);
      -webkit-font-smoothing: antialiased;
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

    .site-header {
      background: linear-gradient(to bottom, rgba(5, 5, 5, 0.95) 0%, rgba(5, 5, 5, 0.8) 100%);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--border-subtle);
      padding: 1rem 1.5rem;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-content {
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .header-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: var(--text-primary);
      font-family: 'Fraunces', serif;
      font-weight: 500;
      font-size: 1.2rem;
      letter-spacing: 0.02em;
    }

    .header-brand:hover { color: var(--text-primary); }
    .header-brand img { width: 36px; height: 36px; border-radius: 8px; }

    .header-cta {
      background: transparent;
      color: var(--text-primary);
      padding: 0.6rem 1.25rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      font-size: 0.8rem;
      font-weight: 500;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      transition: all 0.3s;
    }

    .header-cta:hover {
      background: var(--text-primary);
      color: var(--bg-deep);
    }

    .article {
      max-width: 800px;
      margin: 0 auto;
      padding: 4rem 1.5rem;
      position: relative;
      z-index: 1;
    }

    .article-header {
      margin-bottom: 3rem;
      text-align: center;
    }

    .breadcrumb {
      font-size: 0.75rem;
      color: var(--text-dim);
      margin-bottom: 1.5rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .breadcrumb a { color: var(--text-secondary); }
    .breadcrumb a:hover { color: var(--spotlight-gold); }

    h1 {
      font-family: 'Fraunces', serif;
      font-size: clamp(2rem, 5vw, 3rem);
      font-weight: 400;
      line-height: 1.2;
      margin-bottom: 1rem;
      color: var(--text-primary);
      letter-spacing: -0.02em;
    }

    h1 em {
      font-style: italic;
      color: var(--spotlight-warm);
      text-shadow: 0 0 60px rgba(251, 191, 36, 0.3);
    }

    .article-meta {
      color: var(--text-dim);
      font-size: 0.85rem;
      letter-spacing: 0.05em;
    }

    .article-content h2 {
      font-family: 'Fraunces', serif;
      font-size: 1.75rem;
      font-weight: 500;
      margin: 3rem 0 1.25rem;
      color: var(--text-primary);
      letter-spacing: -0.01em;
    }

    .article-content h3 {
      font-family: 'Fraunces', serif;
      font-size: 1.3rem;
      font-weight: 500;
      margin: 2.5rem 0 1rem;
      color: var(--text-primary);
    }

    .article-content p {
      margin-bottom: 1.5rem;
      color: var(--text-secondary);
      font-weight: 300;
      line-height: 1.8;
    }

    .article-content ul, .article-content ol {
      margin-bottom: 1.5rem;
      padding-left: 1.5rem;
      color: var(--text-secondary);
    }

    .article-content li {
      margin-bottom: 0.75rem;
      font-weight: 300;
    }

    .message-examples {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%);
      border: 1px solid var(--border-subtle);
      padding: 2rem;
      margin: 2rem 0;
      position: relative;
    }

    .message-examples::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.3), transparent);
    }

    .message-example {
      padding: 1.25rem 1.5rem;
      background: rgba(0, 0, 0, 0.3);
      margin-bottom: 1rem;
      font-family: 'Fraunces', serif;
      font-style: italic;
      font-size: 1.1rem;
      line-height: 1.7;
      color: var(--text-primary);
      border-left: 2px solid var(--spotlight-gold);
    }

    .message-example:last-child { margin-bottom: 0; }

    .cta-box {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      padding: 3rem 2rem;
      text-align: center;
      margin: 3rem 0;
      position: relative;
      overflow: hidden;
    }

    .cta-box::before {
      content: '';
      position: absolute;
      top: -100px;
      left: 50%;
      transform: translateX(-50%);
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, transparent 60%);
      pointer-events: none;
    }

    .cta-box h3 {
      font-family: 'Fraunces', serif;
      color: var(--text-primary);
      margin-bottom: 1rem;
      font-size: 1.5rem;
      font-weight: 400;
      position: relative;
    }

    .cta-box p {
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
      font-weight: 300;
      position: relative;
    }

    .cta-button {
      display: inline-block;
      background: var(--spotlight-gold);
      color: var(--bg-deep);
      padding: 1rem 2rem;
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      transition: all 0.3s;
      position: relative;
    }

    .cta-button:hover {
      background: var(--spotlight-amber);
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(251, 191, 36, 0.2);
      color: var(--bg-deep);
    }

    .tips-box {
      background: linear-gradient(135deg, rgba(212, 115, 107, 0.1) 0%, rgba(212, 115, 107, 0.05) 100%);
      border: 1px solid rgba(212, 115, 107, 0.2);
      padding: 2rem;
      margin: 2rem 0;
    }

    .tips-box h4 {
      font-family: 'Fraunces', serif;
      color: var(--accent-light);
      margin-bottom: 1rem;
      font-size: 1.1rem;
      font-weight: 500;
    }

    .tips-box ul { margin-bottom: 0; color: var(--text-secondary); }
    .tips-box li { margin-bottom: 0.75rem; font-weight: 300; }
    .tips-box li:last-child { margin-bottom: 0; }
    .tips-box strong { color: var(--text-primary); font-weight: 500; }

    .related-section {
      margin-top: 3rem;
      padding-top: 2.5rem;
      border-top: 1px solid var(--border-subtle);
    }

    .related-section h3 {
      font-family: 'Fraunces', serif;
      font-size: 1.25rem;
      font-weight: 500;
      margin-bottom: 1.25rem;
    }

    .related-links {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .related-link {
      display: inline-block;
      background: transparent;
      border: 1px solid var(--border-light);
      padding: 0.75rem 1.25rem;
      font-size: 0.9rem;
      transition: all 0.3s;
    }

    .related-link:hover {
      border-color: var(--spotlight-gold);
      background: rgba(251, 191, 36, 0.05);
      color: var(--spotlight-gold);
    }

    footer {
      padding: 3rem 1.5rem;
      background: var(--bg-deep);
      border-top: 1px solid var(--border-subtle);
      color: var(--text-dim);
      position: relative;
      z-index: 1;
    }

    .footer-content {
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }

    .footer-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: var(--text-dim);
      font-family: 'Fraunces', serif;
      font-weight: 400;
      font-size: 1rem;
    }

    .footer-brand img { width: 32px; height: 32px; border-radius: 6px; opacity: 0.7; }

    .footer-links {
      display: flex;
      gap: 2.5rem;
      flex-wrap: wrap;
      justify-content: center;
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
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-subtle);
      width: 100%;
      text-align: center;
    }

    @media (max-width: 640px) {
      .article { padding: 3rem 1.25rem; }
      .footer-links { flex-direction: column; align-items: center; gap: 0.75rem; }
      .related-links { flex-direction: column; }
      .related-link { text-align: center; width: 100%; }
    }'''

GRAIN_DIV = '  <div class="grain"></div>\n'

def update_blog_post(filepath):
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
    blog_dir = '/Users/jarrydaubert/Desktop/Project Nexus/prosepal-web/public/blog'
    files = [
        'birthday-card-messages.html',
        'graduation-card-messages.html',
        'thank-you-card-wording.html',
        'wedding-card-message.html',
        'what-to-write-in-sympathy-card.html'
    ]
    
    for f in files:
        update_blog_post(os.path.join(blog_dir, f))
    
    print("All blog posts updated!")

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function BlogPost() {
  const { slug } = useParams();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.DEV ? 'http://localhost:8080' : import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/blogs/${slug}`);
        if (!res.ok) throw new Error('Failed to fetch blog');
        const data = await res.json();
        setBlog(data);
      } catch (error) {
        console.error(error);
        toast.error('Article not found');
      }
      setLoading(false);
    };

    fetchBlog();
  }, [slug]);

  useEffect(() => {
    if (blog) {
      // Update page title
      document.title = `${blog.title} | UGMentor Blog`;

      // Helper to update or create meta tags
      const setMetaTag = (attr: string, key: string, content: string) => {
        let element = document.querySelector(`meta[${attr}="${key}"]`);
        if (!element) {
          element = document.createElement('meta');
          element.setAttribute(attr, key);
          document.head.appendChild(element);
        }
        element.setAttribute('content', content);
      };

      const shareUrl = window.location.href;
      
      // Standard SEO
      setMetaTag('name', 'description', blog.excerpt || blog.title);
      
      // Open Graph / Facebook
      setMetaTag('property', 'og:type', 'article');
      setMetaTag('property', 'og:url', shareUrl);
      setMetaTag('property', 'og:title', blog.title);
      setMetaTag('property', 'og:description', blog.excerpt || blog.title);
      if (blog.featured_image) {
        setMetaTag('property', 'og:image', blog.featured_image);
      }

      // Twitter
      setMetaTag('name', 'twitter:card', 'summary_large_image');
      setMetaTag('name', 'twitter:url', shareUrl);
      setMetaTag('name', 'twitter:title', blog.title);
      setMetaTag('name', 'twitter:description', blog.excerpt || blog.title);
      if (blog.featured_image) {
        setMetaTag('name', 'twitter:image', blog.featured_image);
      }
    }
  }, [blog]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px 0' }}>Loading article...</div>;
  }

  if (!blog) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <h2>Article not found</h2>
        <Link to="/blog" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 600 }}>← Back to Blog</Link>
      </div>
    );
  }

  const shareUrl = window.location.href;
  const shareTitle = encodeURIComponent(blog.title);
  const shareSummary = encodeURIComponent(blog.excerpt || '');

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', color: '#0f172a' }}>
      <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
        <Link to="/" style={{ color: '#64748b', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span>←</span> Back to Home
        </Link>
        <Link to="/blog" style={{ color: '#64748b', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span>←</span> Back to Blog
        </Link>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#4f46e5', background: '#eef2ff', padding: '6px 16px', borderRadius: 999 }}>{blog.category || 'General'}</span>
        <span style={{ fontSize: 14, color: '#94a3b8' }}>{blog.reading_time ? `${blog.reading_time} min read` : '5 min read'}</span>
      </div>

      <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 24, lineHeight: 1.2 }}>{blog.title}</h1>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 48, paddingBottom: 32, borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700 }}>
            {blog.author_name ? blog.author_name.charAt(0) : 'U'}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{blog.author_name || 'UGMentor Team'}</div>
            <div style={{ fontSize: 14, color: '#64748b' }}>{blog.author_role || 'Editor'} • {blog.created_at ? new Date(blog.created_at).toLocaleDateString() : ''}</div>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginRight: 8 }}>Share:</span>
          
          <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`} target="_blank" rel="noopener noreferrer" 
             style={{ width: 36, height: 36, borderRadius: '50%', background: '#f1f5f9', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'all 0.2s' }}
             onMouseOver={(e) => { e.currentTarget.style.background = '#0f172a'; e.currentTarget.style.color = '#fff'; }}
             onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
             title="Share on X (Twitter)">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer"
             style={{ width: 36, height: 36, borderRadius: '50%', background: '#f1f5f9', color: '#1877f2', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'all 0.2s' }}
             onMouseOver={(e) => { e.currentTarget.style.background = '#1877f2'; e.currentTarget.style.color = '#fff'; }}
             onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#1877f2'; }}
             title="Share on Facebook">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          
          <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareTitle}&summary=${shareSummary}`} target="_blank" rel="noopener noreferrer"
             style={{ width: 36, height: 36, borderRadius: '50%', background: '#f1f5f9', color: '#0a66c2', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'all 0.2s' }}
             onMouseOver={(e) => { e.currentTarget.style.background = '#0a66c2'; e.currentTarget.style.color = '#fff'; }}
             onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0a66c2'; }}
             title="Share on LinkedIn">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>

          <a href={`https://api.whatsapp.com/send?text=${shareTitle}%20-%20${shareUrl}`} target="_blank" rel="noopener noreferrer"
             style={{ width: 36, height: 36, borderRadius: '50%', background: '#f1f5f9', color: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'all 0.2s' }}
             onMouseOver={(e) => { e.currentTarget.style.background = '#25D366'; e.currentTarget.style.color = '#fff'; }}
             onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#25D366'; }}
             title="Share on WhatsApp">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a5.8 5.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </a>
          
          <div style={{ width: 1, height: 24, background: '#e2e8f0', margin: '0 4px' }} />

          <button 
             onClick={() => {
               navigator.clipboard.writeText(shareUrl);
               toast.success('Link copied to clipboard!');
             }}
             style={{ width: 36, height: 36, borderRadius: '50%', background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
             onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#334155'; }}
             onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
             title="Copy link">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
          </button>
        </div>
      </div>

      {blog.featured_image && (
        <div style={{ marginBottom: 48, borderRadius: 16, overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
          <img 
            src={blog.featured_image} 
            alt={blog.title} 
            style={{ width: '100%', maxHeight: 450, objectFit: 'cover', display: 'block' }} 
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        </div>
      )}

      <div 
        className="blog-content"
        style={{ fontSize: 18, lineHeight: 1.8, color: '#334155' }}
        dangerouslySetInnerHTML={{ __html: blog.content || '<p>No content available.</p>' }} 
      />

      {blog.tags && Array.isArray(blog.tags) && blog.tags.length > 0 && (
        <div style={{ marginTop: 60, paddingTop: 32, borderTop: '1px solid #e2e8f0' }}>
          <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Tags</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {blog.tags.map((tag: string, i: number) => (
              <span key={i} style={{ background: '#f1f5f9', color: '#475569', padding: '6px 12px', borderRadius: 6, fontSize: 14, fontWeight: 500 }}>
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

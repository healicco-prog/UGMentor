import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function BlogList() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.DEV ? 'http://localhost:8080' : import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/blogs`);
        if (!res.ok) throw new Error('Failed to fetch blogs');
        const data = await res.json();
        setBlogs(data || []);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load blogs');
      }
      setLoading(false);
    };

    fetchBlogs();
  }, []);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px', color: '#0f172a' }}>
      <div style={{ marginBottom: 20 }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#64748b', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
          <span>←</span> Back to Home
        </Link>
      </div>
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 16 }}>Medical Education Blog</h1>
        <p style={{ fontSize: 18, color: '#64748b', maxWidth: 600, margin: '0 auto' }}>
          Insights, guides, and resources for medical students navigating their educational journey.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading articles...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 32 }}>
          {blogs.map(blog => (
            <Link to={`/blog/${blog.slug}`} key={blog.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', background: '#fff', transition: 'transform 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                   onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                   onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                {blog.featured_image ? (
                  <div style={{ height: 200, borderBottom: '1px solid #e2e8f0', backgroundImage: `url(${blog.featured_image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                ) : (
                  <div style={{ height: 200, background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
                    {blog.category === 'Study Tips' ? '📚' : blog.category === 'Clinical Skills' ? '🩺' : '💡'}
                  </div>
                )}
                <div style={{ padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#4f46e5', background: '#eef2ff', padding: '4px 12px', borderRadius: 999 }}>{blog.category || 'General'}</span>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{blog.reading_time ? `${blog.reading_time} min read` : '5 min read'}</span>
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, lineHeight: 1.3 }}>{blog.title}</h3>
                  <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20, lineHeight: 1.5 }}>
                    {blog.excerpt || 'Read the full article to learn more about this medical topic.'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                      {blog.author_name ? blog.author_name.charAt(0) : 'U'}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{blog.author_name || 'UGMentor Team'}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{new Date(blog.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {blogs.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: '#64748b' }}>
              No blogs published yet. Check back soon!
            </div>
          )}
        </div>
      )}
    </div>
  );
}

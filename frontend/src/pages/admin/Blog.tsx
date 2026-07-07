import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  created_at?: string;
  status?: string;
  excerpt?: string;
  views_count?: number;
  slug?: string;
  primary_keyword?: string;
  secondary_keywords?: string[];
  tags?: string[];
  featured_image?: string;
}

export default function AdminBlog() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [generatedMeta, setGeneratedMeta] = useState<any>({});

  const apiUrl = import.meta.env.DEV ? 'http://localhost:8080' : import.meta.env.VITE_API_URL;

  const [isGenerating, setIsGenerating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [secondaryKeywords, setSecondaryKeywords] = useState('');
  const [tags, setTags] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [mentionBrand, setMentionBrand] = useState(true);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      
      const res = await fetch(`${apiUrl}/api/admin/blogs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error('Failed to fetch blogs');
      const data = await res.json();
      setBlogs(data || []);
    } catch (error) {
      toast.error('Failed to fetch blogs');
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleCreateBlog = async (status: 'published' | 'draft' = 'published') => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error('Please enter both title and content');
      return;
    }
    
    // Generate a simple slug from title
    const slug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId ? `${apiUrl}/api/admin/blogs/${editingId}` : `${apiUrl}/api/admin/blogs`;

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newContent.trim(),
          slug: slug,
          status: status,
          primary_keyword: primaryKeyword,
          secondary_keywords: secondaryKeywords.split(',').map(k => k.trim()).filter(Boolean),
          tags: tags.split(',').map(k => k.trim()).filter(Boolean),
          featured_image: featuredImage,
          ...generatedMeta
        })
      });
      
      if (!res.ok) throw new Error('Error publishing blog');
      toast.success(status === 'draft' ? 'Draft saved!' : (editingId ? 'Blog updated successfully' : 'Blog published successfully'));
      resetForm();
      fetchBlogs();
    } catch (error) {
      toast.error('Error saving blog');
      console.error(error);
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewContent('');
    setPrimaryKeyword('');
    setSecondaryKeywords('');
    setTags('');
    setFeaturedImage('');
    setGeneratedMeta({});
    setIsCreating(false);
    setEditingId(null);
  };
  
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [galleryPage, setGalleryPage] = useState(0);

  const medicalImages = [
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
    'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80',
    'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&q=80',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80',
    'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&q=80',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80',
    'https://images.unsplash.com/photo-1584982751601-97d883f510f4?w=800&q=80',
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80',
    'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=800&q=80',
    'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=800&q=80',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80',
    'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&q=80',
    'https://images.unsplash.com/photo-1576091160501-bbe57469278b?w=800&q=80',
    'https://images.unsplash.com/photo-1511174511562-5f7f18bf270b?w=800&q=80',
    'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&q=80',
    'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800&q=80',
    'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800&q=80',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80'
  ];

  const handleEdit = (blog: any) => {
    try {
      setNewTitle(blog.title || '');
      setNewContent(blog.content || '');
      setPrimaryKeyword(blog.primary_keyword || '');
      
      const safeJoin = (val: any) => {
        if (!val) return '';
        if (Array.isArray(val)) return val.join(', ');
        return String(val);
      };
      
      setSecondaryKeywords(safeJoin(blog.secondary_keywords));
      setTags(safeJoin(blog.tags));
      setFeaturedImage(blog.featured_image || '');
      setEditingId(blog.id);
      setIsCreating(true);
      setShowImageGallery(false);
      
      // Scroll the main content area up
      setTimeout(() => {
        const mainContent = document.querySelector('main');
        if (mainContent) {
          mainContent.scrollTo({ top: 0, behavior: 'smooth' });
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    } catch (err) {
      console.error("Error setting edit state:", err);
      toast.error('Could not edit this article due to a data format issue.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this article?')) return;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      
      const res = await fetch(`${apiUrl}/api/admin/blogs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error('Failed to delete blog');
      toast.success('Blog deleted successfully');
      fetchBlogs();
    } catch (error) {
      toast.error('Failed to delete blog');
    }
  };

  const handleGenerateAI = async () => {
    if (!newTitle.trim()) {
      toast.error('Please enter a title/topic first');
      return;
    }
    setIsGenerating(true);
    toast.loading('Generating AI Content (SEO Optimized)...', { id: 'ai-gen' });
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      
      let topicToGenerate = newTitle;
      if (mentionBrand) {
        topicToGenerate += " (Make sure to subtly mention UGMentor as a helpful resource)";
      }

      const res = await fetch(`${apiUrl}/api/admin/blogs/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic: topicToGenerate })
      });
      if (!res.ok) throw new Error('Failed to generate');
      const data = await res.json();
      
      setNewContent(data.content || '');
      setPrimaryKeyword(data.primary_keyword || '');
      setSecondaryKeywords((data.secondary_keywords || []).join(', '));
      setTags((data.tags || []).join(', '));
      
      const { content, primary_keyword, secondary_keywords, tags, ...meta } = data;
      setGeneratedMeta(meta);
      toast.success('Content generated successfully!', { id: 'ai-gen' });
    } catch (error) {
      toast.error('AI Generation Failed', { id: 'ai-gen' });
    }
    setIsGenerating(false);
  };

  const insertFormat = (tag: string) => {
    const textarea = document.getElementById('blog-editor-textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = newContent;
    let insertion = '';
    
    if (tag === 'H2') insertion = `<h2>${text.substring(start, end) || 'Heading'}</h2>`;
    else if (tag === 'B') insertion = `<strong>${text.substring(start, end) || 'Bold text'}</strong>`;
    else if (tag === 'I') insertion = `<em>${text.substring(start, end) || 'Italic text'}</em>`;
    else if (tag === 'UL') insertion = `<ul>\n  <li>${text.substring(start, end) || 'Item 1'}</li>\n</ul>`;
    else if (tag === 'CODE') insertion = `<code>${text.substring(start, end) || 'Code'}</code>`;
    else if (tag === 'IMG') insertion = `<img src="https://via.placeholder.com/600x400" alt="Description" style="max-width: 100%; border-radius: 8px;" />`;
    
    setNewContent(text.substring(0, start) + insertion + text.substring(end));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + insertion.length, start + insertion.length);
    }, 0);
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', color: '#0f172a' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Blog Publications Engine</h1>
        <p style={{ color: '#64748b', fontSize: 16 }}>Author, edit, and publish content directly to the UGMentor knowledge base.</p>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        {!isCreating ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  📄
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>All Published & Drafts</div>
                  <div style={{ color: '#64748b', fontSize: 13 }}>{blogs.length} articles total</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button style={{ background: '#eef2ff', color: '#4f46e5', padding: '10px 20px', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                  ✨ Bulk AI Blogs
                </button>
                <button 
                  onClick={() => setIsCreating(true)}
                  style={{ background: '#0f172a', color: '#fff', padding: '10px 20px', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                  ▶ New Article
                </button>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748b' }}>Loading articles...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
                {blogs.map(blog => (
                  <div key={blog.id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: blog.status === 'draft' ? '#f59e0b' : '#16a34a', background: blog.status === 'draft' ? '#fef3c7' : '#f0fdf4', padding: '4px 10px', borderRadius: 999, border: `1px solid ${blog.status === 'draft' ? '#fde68a' : '#bbf7d0'}`, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {blog.status === 'draft' ? '✍️ DRAFT' : '✓ PUBLISHED'}
                      </span>
                      <div style={{ display: 'flex', gap: 4, color: '#94a3b8' }}>
                        <button 
                          onClick={() => handleEdit(blog)} 
                          title="Edit Article"
                          style={{ cursor: 'pointer', background: 'transparent', border: 'none', padding: '4px 8px', borderRadius: 6, fontSize: 16 }}
                          onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDelete(blog.id)} 
                          title="Delete Article"
                          style={{ cursor: 'pointer', background: 'transparent', border: 'none', padding: '4px 8px', borderRadius: 6, fontSize: 16 }}
                          onMouseOver={(e) => e.currentTarget.style.background = '#fef2f2'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, lineHeight: 1.4 }}>{blog.title}</h3>
                    <p style={{ color: '#64748b', fontSize: 13, marginBottom: 24, flex: 1 }}>
                      {blog.excerpt?.substring(0, 100) || (blog.content || '').replace(/<[^>]*>?/gm, '').substring(0, 100) || 'No content...'}...
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: 12, marginBottom: 16 }}>
                      <span>{blog.created_at ? new Date(blog.created_at).toLocaleDateString() : 'Unknown date'}</span>
                      <span>👁️ {blog.views_count || 0}</span>
                    </div>
                    <button style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, color: '#475569', fontWeight: 600, cursor: 'pointer' }} onClick={() => window.open(`/blog/${blog.slug}`, '_blank')}>
                      View Live Article
                    </button>
                  </div>
                ))}
                {blogs.length === 0 && (
                  <div style={{ padding: '40px 0', gridColumn: '1 / -1', textAlign: 'center', color: '#64748b' }}>No articles published yet.</div>
                )}
              </div>
            )}
          </>
        ) : (
          <div>
            {/* Editor Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{editingId ? 'Edit Article' : 'Create Article'}</h2>
                <button 
                  onClick={handleGenerateAI}
                  disabled={isGenerating}
                  style={{ background: '#f0f4ff', color: '#4f46e5', border: '1px solid #c7d2fe', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: isGenerating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {isGenerating ? 'Generating...' : '✨ Write with AI (SEO)'}
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={resetForm} style={{ background: 'transparent', border: 'none', color: '#64748b', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  ⊗ Cancel
                </button>
                <button onClick={() => handleCreateBlog('draft')} style={{ background: '#1e293b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  💾 Save Draft
                </button>
                <button onClick={() => handleCreateBlog('published')} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  🌐 Publish Now
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 24 }}>
              {/* Main Content Area (70%) */}
              <div style={{ flex: '7' }}>
                <input 
                  type="text" 
                  placeholder="Article Title..." 
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  style={{ width: '100%', padding: '16px', fontSize: 24, fontWeight: 700, border: '1px solid #e2e8f0', borderRadius: '12px 12px 0 0', outline: 'none', color: '#0f172a' }}
                />
                
                {/* Toolbar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: '#f8fafc', borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', gap: 16, color: '#475569', fontSize: 14, fontWeight: 600 }}>
                    <span style={{ cursor: 'pointer' }} onClick={() => insertFormat('H2')}>H2</span>
                    <span style={{ cursor: 'pointer' }} onClick={() => insertFormat('B')}>B</span>
                    <span style={{ cursor: 'pointer', fontStyle: 'italic' }} onClick={() => insertFormat('I')}>I</span>
                    <span style={{ cursor: 'pointer' }} onClick={() => insertFormat('UL')}>List (ul)</span>
                    <span style={{ cursor: 'pointer' }} onClick={() => insertFormat('CODE')}>&lt;/&gt;</span>
                    <span style={{ cursor: 'pointer' }} onClick={() => insertFormat('IMG')}>Image</span>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#4f46e5', fontWeight: 600, cursor: 'pointer' }}>
                    <input type="checkbox" checked={mentionBrand} onChange={e => setMentionBrand(e.target.checked)} style={{ accentColor: '#4f46e5' }} />
                    Mention UGMentor via AI
                  </label>
                </div>

                <textarea 
                  id="blog-editor-textarea"
                  placeholder="Write your amazing article here... Use HTML tags for formatting if needed." 
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  style={{ width: '100%', height: 500, padding: 16, border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 12px 12px', fontSize: 15, lineHeight: 1.6, color: '#334155', resize: 'vertical', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>

              {/* Sidebar Settings Area (30%) */}
              <div style={{ flex: '3', display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase' }}>Primary Keyword</label>
                  <input type="text" value={primaryKeyword} onChange={e => setPrimaryKeyword(e.target.value)} placeholder="e.g. ethical issues in AI" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase' }}>Secondary Keywords (CSV)</label>
                  <input type="text" value={secondaryKeywords} onChange={e => setSecondaryKeywords(e.target.value)} placeholder="AI ethics, healthcare AI ethics" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase' }}>Tags (CSV)</label>
                  <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="AI, ethics, healthcare, technology" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase' }}>Featured Image URL</label>
                  {featuredImage && (
                    <div style={{ marginBottom: 12, borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                      <img src={featuredImage} alt="Preview" style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
                    </div>
                  )}
                  <input type="text" value={featuredImage} onChange={e => setFeaturedImage(e.target.value)} placeholder="https://images.unsplash.com/..." style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', marginBottom: 8 }} />
                  <button 
                    onClick={() => setShowImageGallery(!showImageGallery)}
                    style={{ width: '100%', background: '#4f46e5', color: '#fff', border: 'none', padding: '12px', borderRadius: 8, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
                    {showImageGallery ? '❌ CLOSE GALLERY' : '✨ SEARCH ONLINE (MEDICAL AI)'}
                  </button>
                  
                  {showImageGallery && (
                    <div style={{ marginTop: 12, padding: 12, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', margin: '0 0 12px 0', textAlign: 'center' }}>Select an AI Curated Medical Image</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {medicalImages.slice(galleryPage * 6, (galleryPage + 1) * 6).map((imgUrl, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => {
                              setFeaturedImage(imgUrl);
                              setShowImageGallery(false);
                            }}
                            style={{ borderRadius: 6, overflow: 'hidden', cursor: 'pointer', border: featuredImage === imgUrl ? '2px solid #4f46e5' : '2px solid transparent' }}
                          >
                            <img src={imgUrl} alt={`Option ${galleryPage * 6 + idx}`} style={{ width: '100%', height: 80, objectFit: 'cover', display: 'block' }} />
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          setGalleryPage(prev => (prev + 1) * 6 >= medicalImages.length ? 0 : prev + 1);
                        }}
                        style={{ width: '100%', marginTop: 12, background: '#e2e8f0', color: '#475569', border: 'none', padding: '8px', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}>
                        Load Next 6 Images ↻
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

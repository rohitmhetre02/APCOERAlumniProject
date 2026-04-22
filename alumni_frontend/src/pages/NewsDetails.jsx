import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Card from "../components/ui/Card";

const NewsDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNewsDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('alumni_token');
        
        if (!token) {
          setError('Please login to view news details');
          setLoading(false);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/news/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('News article not found');
          } else {
            throw new Error('Failed to fetch news details');
          }
          return;
        }
        
        const data = await response.json();
        setNews(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchNewsDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/dashboard/news" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Back to News
          </Link>
        </Card>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Article Not Found</h2>
          <p className="text-gray-600 mb-6">The article you're looking for doesn't exist.</p>
          <Link to="/dashboard/news" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Back to News
          </Link>
        </Card>
      </div>
    );
  }

  const getCategoryColor = (category) => {
    return "bg-blue-100 text-blue-800";
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* 🔙 Back */}
      <button
        onClick={() => navigate(-1)}
        className="text-blue-600 hover:underline"
      >
        ← Back
      </button>

      {/* HEADER */}
      <div className="space-y-3">
        <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(news.category)}`}>
          {news.category}
        </span>

        <h1 className="text-3xl font-bold text-gray-900">
          {news.title}
        </h1>

        <div className="flex items-center gap-3">
          <img
            src="https://picsum.photos/seed/author-default/100/100.jpg"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="text-sm font-medium">{news.author_name || 'Anonymous'}</p>
            <p className="text-xs text-gray-500">
              {news.published_at ? new Date(news.published_at).toLocaleDateString() : new Date(news.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* 🔥 IMAGE (FIXED SIZE, NOT FULL WIDTH) */}
      <Card>
        <img
          src={news.image_url || 'https://picsum.photos/seed/news-default/800/400.jpg'}
          alt={news.title}
          className="w-full h-72 object-cover rounded-xl"
        />
      </Card>

      {/* CONTENT */}
      <Card>
        <p className="text-gray-600 mb-4">
          {news.short_content || news.content}
        </p>

        <p className="text-gray-700 whitespace-pre-line">
          {news.full_content || news.content}
        </p>
      </Card>

      {/* ENGAGEMENT */}
      <Card>
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div className="flex gap-6">
            <span>❤️ {news.likes_count || 0}</span>
            <span>💬 {news.comments_count || 0}</span>
          </div>
          <span>{news.views_count || news.views || 0} views</span>
        </div>
      </Card>

    </div>
  );
};

export default NewsDetails;
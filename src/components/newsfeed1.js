import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { useAuth } from '../contexts/AuthContext';
import { Search, Loader2, X, ExternalLink, Clock, Building2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

Modal.setAppElement('#root');

const NewsFeed = () => {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [categories] = useState(['general', 'technology', 'business', 'sports', 'entertainment', 'health']);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { currentUser } = useAuth();

  // Keep existing fetch functions
  const fetchNewsByCategory = async (category) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${process.env.REACT_APP_NEWS_API_KEY}`
      );
      setArticles(response.data.articles);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNewsBySearch = async (query) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&apiKey=${process.env.REACT_APP_NEWS_API_KEY}`
      );
      setArticles(response.data.articles);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSearching) {
      fetchNewsByCategory(selectedCategory);
    }
  }, [selectedCategory, isSearching]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setIsSearching(false);
    setSearchQuery('');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      await fetchNewsBySearch(searchQuery);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    fetchNewsByCategory(selectedCategory);
  };

  const openModal = (article) => {
    setSelectedArticle(article);
    setAiSummary('');
  };

  const closeModal = () => {
    setSelectedArticle(null);
    setAiSummary('');
  };

  const generateSummary = async (article) => {
    setIsSummarizing(true);
    try {
      const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEM_API);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

      const prompt = `Please provide a concise summary of the following news article in 3-4 sentences: 
      Title: ${article.title}
      Content: ${article.content}
      Description: ${article.description}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      setAiSummary(response.text());
    } catch (error) {
      console.error('Error generating summary:', error);
      setAiSummary('Failed to generate summary. Please try again.');
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Search and Categories Section */}
        <div className="space-y-6">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for any topic..."
                className="w-full pl-12 pr-16 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200 bg-white shadow-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-20 top-3 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-3 top-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                Search
              </button>
            </div>
          </form>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`px-6 py-2.5 rounded-full capitalize transition-all duration-200 ${
                  selectedCategory === category && !isSearching
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25 scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Current View Indicator */}
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {isSearching ? (
                <span className="flex items-center justify-center gap-2">
                  Search Results for <span className="text-blue-500">"{searchQuery}"</span>
                </span>
              ) : (
                <span className="capitalize">{selectedCategory} News</span>
              )}
            </h2>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-lg shadow-sm">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              <span className="text-gray-600">Loading articles...</span>
            </div>
          </div>
        )}

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <div
              key={index}
              onClick={() => openModal(article)}
              className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer border border-gray-100 hover:border-blue-100"
            >
              <div className="aspect-video relative overflow-hidden bg-gray-100">
                {article.urlToImage ? (
                  <img
                    src={article.urlToImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/400/320';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Building2 className="h-12 w-12 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                  {article.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3">{article.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 pt-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                  </div>
                  <span className="font-medium">{article.source.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results Message */}
        {articles.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto">
              <p className="text-gray-600">No articles found. Try a different search term or category.</p>
            </div>
          </div>
        )}

        {/* Article Modal */}
        <Modal
          isOpen={!!selectedArticle}
          onRequestClose={closeModal}
          className="max-w-3xl mx-auto mt-12 mb-12 bg-white rounded-2xl shadow-xl outline-none p-0 relative"
          overlayClassName="fixed inset-0 bg-black/50 flex items-start justify-center overflow-y-auto px-4"
        >
          {selectedArticle && (
            <div className="divide-y divide-gray-100">
              {/* Modal Header */}
              <div className="p-6">
                <div className="flex justify-between items-start gap-4">
                  <h2 className="text-2xl font-bold text-gray-800 leading-tight">{selectedArticle.title}</h2>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(selectedArticle.publishedAt).toLocaleDateString()}
                  </span>
                  <span className="font-medium">{selectedArticle.source.name}</span>
                  {selectedArticle.author && (
                    <span className="text-gray-500">By {selectedArticle.author}</span>
                  )}
                </div>
              </div>

              {/* Article Image */}
              {selectedArticle.urlToImage && (
                <div className="relative aspect-video">
                  <img
                    src={selectedArticle.urlToImage}
                    alt={selectedArticle.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/400/320';
                    }}
                  />
                </div>
              )}

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* AI Summary Section */}
                <div className="bg-blue-50 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg text-gray-800">AI Summary</h3>
                    <button
                      onClick={() => generateSummary(selectedArticle)}
                      disabled={isSummarizing}
                      className={`px-4 py-2 rounded-lg text-white flex items-center gap-2 transition-colors ${
                        isSummarizing
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600'
                      }`}
                    >
                      {isSummarizing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        'Generate Summary'
                      )}
                    </button>
                  </div>
                  {aiSummary && (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-gray-700 leading-relaxed">{aiSummary}</p>
                    </div>
                  )}
                </div>

                {/* Article Content */}
                <div className="prose prose-blue max-w-none">
                  <p className="text-gray-700 leading-relaxed">{selectedArticle.content}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-4">
                  <a
                    href={selectedArticle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Read Full Article</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default NewsFeed;
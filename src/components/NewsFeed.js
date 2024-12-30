import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { Search, Loader2, X, ExternalLink, Clock, Globe, Languages } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

Modal.setAppElement('#root');

const NewsFeed = () => {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState({});
  const [languages, setLanguages] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);


  // Format countries/languages data for display
  const formatOptionsData = (data) => {
    const formatted = {};
    Object.entries(data).forEach(([name, code]) => {
      formatted[name] = code;
    });
    return formatted;
  };

  // Fetch available options from API
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const apiKey = process.env.REACT_APP_CURRENTS_API_KEY;
        const [categoriesRes, countriesRes, languagesRes] = await Promise.all([
          axios.get(`https://api.currentsapi.services/v1/available/categories?apiKey=${apiKey}`),
          axios.get(`https://api.currentsapi.services/v1/available/regions?apiKey=${apiKey}`),
          axios.get(`https://api.currentsapi.services/v1/available/languages?apiKey=${apiKey}`)
        ]);

        if (categoriesRes.data && categoriesRes.data.categories) {
          setCategories(categoriesRes.data.categories);
        }
        if (countriesRes.data && countriesRes.data.regions) {
          // Format countries data: {countryName: countryCode}
          setCountries(formatOptionsData(countriesRes.data.regions));
        }
        if (languagesRes.data && languagesRes.data.languages) {
          // Format languages data: {languageName: languageCode}
          setLanguages(formatOptionsData(languagesRes.data.languages));
        }
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };

    fetchOptions();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const apiKey = process.env.REACT_APP_CURRENTS_API_KEY;
      let url = 'https://api.currentsapi.services/v1/search?';
      const params = new URLSearchParams();
      
      // Add API key first
      params.append('apiKey', apiKey);
      
      // Add active filters
      if (selectedCountry) params.append('country', selectedCountry);
      if (selectedLanguage) params.append('language', selectedLanguage);
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchQuery.trim()) params.append('keywords', searchQuery.trim());
      
      const response = await axios.get(`${url}${params.toString()}`);
      
      if (response.data && response.data.news) {
        setArticles(response.data.news);
      } else {
        setArticles([]);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if at least one filter is active or there's a search query
    if (selectedCountry || selectedLanguage || selectedCategory ) {
      fetchNews();
    }
  }, [selectedCategory, selectedCountry, selectedLanguage ]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      setSelectedCategory(''); // Optional: clear other filters if desired
      setSelectedCountry('');
      setSelectedLanguage('');
      await fetchNews();
    }
  };
  const handleSelectArticle = (article) => {
    setSelectedArticle(article);
    setAiSummary(''); // Reset the summary whenever a new article is selected
  };
  
  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    fetchNews();
  };

  const handleFilterChange = (type, value) => {
    switch (type) {
      case 'country':
        setSelectedCountry(value);
        setSelectedCategory(''); // Clear only category, keep language
        break;
      case 'language':
        setSelectedLanguage(value);
        setSelectedCategory(''); // Clear only category, keep country
        break;
      case 'category':
        setSelectedCategory(value);
        setSelectedCountry(''); // Clear both country and language
        setSelectedLanguage('');
        break;
      default:
        break;
    }
    setSearchQuery(''); // Clear search query when changing filters
    setIsSearching(false); // Reset search state
  };
  
  const generateSummary = async (article) => {
    setIsSummarizing(true);
    try {
      const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEM_API);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

      const prompt = `Please provide a concise summary of the following news article in 3-4 sentences: 
      Title: ${article.title}
      Content: ${article.description}`;

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
        {/* Filters Section */}
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
                className="absolute right-3 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                Search
              </button>
            </div>
          </form>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 justify-center items-center">
            {/* Country Selector */}
            <div className="relative min-w-[200px]">
              <Globe className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <select
                value={selectedCountry}
                onChange={(e) => handleFilterChange('country', e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg appearance-none outline-none transition-colors ${
                  selectedCountry ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'
                }`}
              >
                <option value="">All Countries</option>
                {Object.entries(countries).map(([name, code]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Selector */}
            <div className="relative min-w-[200px]">
              <Languages className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <select
                value={selectedLanguage}
                onChange={(e) => handleFilterChange('language', e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg appearance-none outline-none transition-colors ${
                  selectedLanguage ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'
                }`}
              >
                <option value="">All Languages</option>
                {Object.entries(languages).map(([name, code]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleFilterChange('category', category)}
                className={`px-6 py-2.5 rounded-full capitalize transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25 scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Active Filters Indicator */}
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {isSearching ? (
                <span>Search Results for "{searchQuery}"</span>
              ) : (
                <span>
                  {selectedCategory && `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} News`}
                  {selectedCountry && `News from ${Object.keys(countries).find(name => countries[name] === selectedCountry)}`}
                  {selectedLanguage && `News in ${Object.keys(languages).find(name => languages[name] === selectedLanguage)}`}
                  {!selectedCategory && !selectedCountry && !selectedLanguage && 'Latest News'}
                </span>
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
              onClick={() => handleSelectArticle(article)}
              className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer border border-gray-100 hover:border-blue-100"
            >
              <div className="aspect-video relative overflow-hidden bg-gray-100">
                {article.image && (
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/400/320';
                    }}
                  />
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
                    <span>{new Date(article.published).toLocaleDateString()}</span>
                  </div>
                  <span className="font-medium">{article.author}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results Message */}
        {articles.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto">
              <p className="text-gray-600">No articles found. Try different filters or search terms.</p>
            </div>
          </div>
        )}

        {/* Article Modal */}
        <Modal
          isOpen={!!selectedArticle}
          onRequestClose={() => setSelectedArticle(null)}
          className="max-w-3xl mx-auto mt-12 mb-12 bg-white rounded-2xl shadow-xl outline-none p-0 relative"
          overlayClassName="fixed inset-0 bg-black/50 flex items-start justify-center overflow-y-auto px-4"
        >
          {selectedArticle && (
            <div className="divide-y divide-gray-100">
              {/* Modal Header */}
              <div className="p-6">
                <div className="flex justify-between items-start gap-4">
                  <h2 className="text-2xl font-bold text-gray-800 leading-tight">
                    {selectedArticle.title}
                  </h2>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(selectedArticle.published).toLocaleDateString()}
                  </span>
                  <span className="font-medium">{selectedArticle.author}</span>
                  {selectedArticle.category && (
                    <span className="text-gray-500">{selectedArticle.category.join(', ')}</span>
                  )}
                </div>
              </div>

              {/* Article Image */}
              {selectedArticle.image && (
                <div className="relative aspect-video">
                  <img
                    src={selectedArticle.image}
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
                  <p className="text-gray-700 leading-relaxed">{selectedArticle.description}</p>
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
import { useState, useEffect, useRef } from 'react';
import { Language, LanguageToVoiceMap } from './DataValues';
import Modal from 'react-modal';
import axios from 'axios';
import { Search, X, Globe, Languages, Clock, Loader2, ExternalLink } from 'lucide-react';
import { Categories, Countries } from './DataValues';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
Modal.setAppElement('#root');
// PlayHT.init({
//   userId: 'ihBrfazFdqRowQV7gZeEiwqe5l23',
//   apiKey: '10d59e8aa5a442298e6c1e0d950de7e9',
// });

const NewsFeed = () => {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Top');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('ta');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [nextPage, setNextPage] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const categories = Categories;
  const countries = Countries;
  const languages = Language;
  const observer = useRef();
  const auth = useAuth();

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

  }, []);

  const fetchNews = async (pageToken = null, isNewSearch = true) => {
    setLoading(true);
    try {
      const paramsNewsData = new URLSearchParams();
      paramsNewsData.append('apikey', process.env.REACT_APP_NEWS_DATA_API_KEY);

      // Add active filters
      if (pageToken) paramsNewsData.append('page', pageToken);
      if (selectedCountry) paramsNewsData.append('country', selectedCountry);
      if (selectedLanguage) paramsNewsData.append('language', selectedLanguage);
      if (selectedCategory && selectedCategory !== "For you") paramsNewsData.append('category', selectedCategory);
      if (searchQuery.trim()) paramsNewsData.append('q', searchQuery.trim());
      if (selectedCategory === "For you") {
        console.log(auth.categoryClickCount);

        // Filter and sort categories based on count
        const sortedCategories = Object.entries(auth.categoryClickCount)
          .filter(([, count]) => count > 0) // Exclude categories with zero count
          .sort(([, countA], [, countB]) => countB - countA)
          .slice(0, 5)
          .map(([category]) => category);

        if (sortedCategories.length === 0) {
          console.log("No categories with interaction count greater than zero.");
          setArticles([]); // Clear articles if no categories
          setHasMore(false);
          return;
        }

        console.log("Top categories:", sortedCategories);

        // Create a single API request for the top categories
        paramsNewsData.delete('category');
        sortedCategories.forEach((category) => paramsNewsData.append('category', category));

        try {
          const RSSresponse = await axios.get(
            `https://newsdata.io/api/1/latest?${paramsNewsData.toString()}`
          );

          if (RSSresponse.data && RSSresponse.data.results) {
            // Remove duplicates if duplicate is true
            const seen = new Set();
            const uniqueNews = RSSresponse.data.results.filter((article) => {
              if (article.duplicate || seen.has(article.article_id)) return false;
              seen.add(article.article_id);
              return true;
            });

            if (isNewSearch) {
              setArticles(uniqueNews);
            } else {
              setArticles((prev) => [...prev, ...uniqueNews]);
            }

            setNextPage(RSSresponse.data.nextPage || null);
            setHasMore(!!RSSresponse.data.nextPage);
          } else {
            setHasMore(false);
            setArticles([]);
          }
        } catch (error) {
          console.error("Error fetching news data:", error);
          setHasMore(false);
          setArticles([]);
        }
      }
      else {
        const RSSresponse = await axios.get(
          `https://newsdata.io/api/1/latest?${paramsNewsData.toString()}`
        );

        if (RSSresponse.data && RSSresponse.data.results) {
          if (isNewSearch) {
            setArticles(RSSresponse.data.results);
          } else {
            setArticles((prev) => [...prev, ...RSSresponse.data.results]);
          }
          setNextPage(RSSresponse.data.nextPage || null);
          setHasMore(!!RSSresponse.data.nextPage);
        } else {
          setHasMore(false);
          setArticles([]);
        }
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCountry || selectedLanguage || selectedCategory) {
      fetchNews(null, true);
    }
  }, [selectedCategory, selectedCountry, selectedLanguage]);

  const lastArticleRef = useRef();

  useEffect(() => {
    if (loading || !hasMore) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextPage) {
          fetchNews(nextPage, false);
        }
      },
      { threshold: 0.5 } // Adjusted threshold for better sensitivity
    );

    if (lastArticleRef.current) observer.current.observe(lastArticleRef.current);

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [loading, hasMore, nextPage]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      // setSelectedCategory(''); // Optional: clear other filters if desired
      // setSelectedCountry('');
      // setSelectedLanguage('');
      await fetchNews();
    }
  };
  const handleSelectArticle = (article) => {
    setSelectedArticle(article);
    setSelectedEmoji(null); // Reset emoji selection
    setAiSummary(''); // Reset the summary whenever a new article is selected

    const userRef = doc(db, "users", auth.currentUser.uid);
    article.category.forEach(updateClickCount)
    console.log(auth.categoryClickCount)
    async function updateClickCount(categoryName, index, array) {
      if (!(categoryName in auth.categoryClickCount)) return;
      const updatedCount = auth.categoryClickCount[categoryName] + 1;

      console.log(categoryName, updatedCount)
      await updateDoc(userRef, {
        [`categoryClickCount.${categoryName}`]: updatedCount,
      });

      auth.fetchCategoryClickCount()
    };
  }

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    fetchNews();
  };

  const handleFilterChange = (type, value) => {
    switch (type) {
      case 'country':
        setSelectedCountry(value);
        setSelectedLanguage(''); // Clear only language, keep category
        break;
      case 'language':
        setSelectedLanguage(value);
        break;
      case 'category':
        if(value===selectedCategory){
          setSelectedCategory("Top");
          break;
        }
        setSelectedCategory(value);
        break;
      default:
        break;
    }
    setSearchQuery(''); // Clear search query when changing filters
    setIsSearching(false); // Reset search state
  };

  const handleEmojiSelect = (emoji) => {
    setSelectedEmoji(emoji); // Update the displayed emoji
    likeHandle(selectedArticle, emoji); // Call the likeHandle function
  };

  const likeHandle = async (article, emoji) => {
    const userRef = doc(db, "users", auth.currentUser.uid);

    // Weight for emojis (customize as needed)
    const emojiWeights = {
      '👍': 1,
      '❤️': 2,
      '👏': 2,
      '😂': 3,
      '😢': 3,
      '👎':-1,
    };

    const weight = emojiWeights[emoji] || 1; // Default weight is 1
    console.log(auth.categoryClickCount)
    article.category.forEach(async (categoryName) => {
      if (!(categoryName in auth.categoryClickCount)) return;

      const updatedCount = auth.categoryClickCount[categoryName] + weight;

      await updateDoc(userRef, {
        [`categoryClickCount.${categoryName}`]: updatedCount,
      });

      auth.fetchCategoryClickCount(); // Refresh locally stored counts
    });
  };

  const generateSummary = async (article) => {
    setIsSummarizing(true);
    try {
      const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEM_API);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

      const prompt = `Please provide a concise summary of the following news article in 3-4 sentences: 
      Title: ${article.title}
      Content: ${article.description}'`;

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

  const speakDescription = (description, language) => {
    if (!description) {
      if (isSpeaking) {
        window.responsiveVoice.cancel();
        setIsSpeaking(false);
      }
      return;
    }
  
    // Check if speech is already happening and stop it
    if (isSpeaking) {
      window.responsiveVoice.cancel();
      setIsSpeaking(false);
      return;
    }
  
    let lang = LanguageToVoiceMap[language.toLowerCase()];
    if (!lang) {
      lang = 'US English Female';
    }
  
    console.log(lang);
  
    setIsSpeaking(true); // Set speaking state to true
    console.log("Started");
  
    window.responsiveVoice.speak(description, lang, {
      onend: () => {
        console.log("Speech ended");
        setIsSpeaking(false); // Reset speaking state after speech ends
      },
      onerror: () => {
        console.error("Speech failed");
        setIsSpeaking(false); // Reset speaking state if an error occurs
      },
    });
  };



  return (
    <div className="min-h-screen w-full overflow-hidden relative">
      {/* Full-screen animated background */}
      <div className="fixed inset-0 bg-white">
        {/* Animated blobs */}
        <div
          className="absolute -top-1/2 -left-1/2 w-[1000px] h-[1000px] bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"
        />
        <div
          className="absolute -top-1/2 -right-1/2 w-[1000px] h-[1000px] bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob-reverse"
          style={{ animationDelay: '-2s' }}
        />
        <div
          className="absolute -bottom-1/2 left-1/4 w-[1000px] h-[1000px] bg-pink-500/50 rounded-full mix-blend-multiply filter blur-3xl animate-blob"
          style={{ animationDelay: '-4s' }}
        />
        <div
          className="absolute -top-1/4 left-1/3 w-[800px] h-[800px] bg-blue-300/50 rounded-full mix-blend-multiply filter blur-3xl animate-blob-spin"
          style={{ animationDelay: '-3s' }}
        />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Rest of the component code remains the same */}
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
                className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg appearance-none outline-none transition-colors ${selectedCountry ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'
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
                className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg appearance-none outline-none transition-colors ${selectedLanguage ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'
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
            {categories.map((category) => 
            (category.trim()!=="top") && (
              <button
                key={category}
                onClick={() => handleFilterChange('category', category)}
                className={`px-6 py-2.5 rounded-full capitalize transition-all duration-200 ${selectedCategory === category
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
                  {selectedCountry && ` from ${Object.keys(countries).find(name => countries[name] === selectedCountry)}`}
                  {selectedLanguage && ` in ${Object.keys(languages).find(name => languages[name] === selectedLanguage)}`}
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
              ref={articles.length === index + 1 ? lastArticleRef : null}
            >
              <div className="aspect-video relative overflow-hidden bg-gray-100">
                {article.image_url && (
                  <img
                    src={article.image_url}
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
                    <span>{new Date(article.pubDate).toLocaleDateString()}</span>
                  </div>
                  <span className="font-medium">{article.source_name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results Message in For use*/}
        {articles.length === 0 && !loading && selectedCategory==="For you" && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto">
              <p className="text-gray-600">Get Started By Searching Some News..!</p>
            </div>
          </div>
        )}
        {/* No Results Message */}
        {articles.length === 0 && !loading && selectedCategory!=="For you" && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto">
              <p className="text-gray-600">No articles found. Try different filters or search terms.</p>
            </div>
          </div>
        )}
        {/* Article Modal */}
        <Modal
          isOpen={!!selectedArticle}
          onRequestClose={() => {
            speakDescription(null); // Stop speaking if modal is closed
            return setSelectedArticle(null)
          }}
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
                    {new Date(selectedArticle.pubDate).toLocaleDateString()}
                  </span>
                  <span className="font-medium">{selectedArticle.author}</span>
                  {selectedArticle.category && (
                    <span className="text-gray-500">{selectedArticle.category.join(', ')}</span>
                  )}
                </div>
              </div>

              {/* Article Image */}
              {selectedArticle.image_url && (
                <div className="relative aspect-video">
                  <img
                    src={selectedArticle.image_url}
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
                      className={`px-4 py-2 rounded-lg text-white flex items-center gap-2 transition-colors ${isSummarizing
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
                <div className="flex justify-end gap-4 pt-4 relative">
                  {/* Listen Button on the leftmost side */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the parent `onClick` handler
                      speakDescription(selectedArticle.description, selectedArticle.language);
                    }}
                    className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                  >
                    <span>{isSpeaking ? '⏸️ Stop' : '🔊 Listen'}</span> {/* Change text based on speaking state */}
                  </button>

                  {/* Emoji Reaction Buttons */}
                  <div className="relative group">
                    <button
                      className="text-lg px-3 py-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                      title={`React with ${selectedEmoji || '👍'}`}
                    >
                      {selectedEmoji || '👍'}
                    </button>

                    <div className="absolute bottom-full mb-2 left-0 bg-white border border-gray-300 rounded-lg shadow-lg p-2 flex gap-2 scale-0 group-hover:scale-100 transition-transform duration-200">
                      {['👍', '❤️', '👏', '😂', '😢','👎'].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleEmojiSelect(emoji)}
                          className="text-lg px-2 py-1 hover:bg-gray-200 rounded-full transition-colors"
                          title={`React with ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  <a
                    href={selectedArticle.link}
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
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- Language Translations ---
const translations = {
  hindi: {
    loginTitle: 'AI दुकानदार',
    loginText: 'मोबाइल नंबर से लॉगिन करें',
    loginPlaceholder: 'अपना 10 अंकों का मोबाइल नंबर दर्ज करें',
    loginButton: 'OTP भेजें',
    profileTitle: 'अपनी पहचान दर्ज करें',
    profilePlaceholder: 'अपना नाम',
    profileButton: 'लोकेशन ट्रैक करें',
    confirmTitle: 'लोकेशन की पुष्टि करें',
    confirmLocationText: 'आपकी लोकेशन:',
    confirmButton: 'हाँ, यह सही है',
    chatTitle: 'AI से चैटिंग करें',
    chatOrder: 'ऑर्डर #',
    chatPlaceholder: 'क्या खरीदना चाहते हैं?',
    chatSend: 'भेजें',
    confirmLocationPrompt: 'क्या यह लोकेशन सही है?',
    home: 'होम',
    shop: 'ऑर्डर',
    chat: 'नया',
    profile: 'प्रोफ़ाइल',
    changeLang: 'भाषा बदलें',
    error: 'एक त्रुटि हुई। कृपया पुन: प्रयास करें।',
    loading: 'लोड हो रहा है...',
  },
  hinglish: {
    loginTitle: 'AI Dukandar',
    loginText: 'Mobile number se login karein',
    loginPlaceholder: 'Apna 10 digit mobile number daalein',
    loginButton: 'Send OTP',
    profileTitle: 'Apni pehchan daalein',
    profilePlaceholder: 'Apna naam',
    profileButton: 'Location track karo',
    confirmTitle: 'Location confirm karein',
    confirmLocationText: 'Aapki location:',
    confirmButton: 'Haan, yeh sahi hai',
    chatTitle: 'AI se chat karein',
    chatOrder: 'Order #',
    chatPlaceholder: 'Kya khareedna hai?',
    chatSend: 'Bhejo',
    confirmLocationPrompt: 'Kya yeh location sahi hai?',
    home: 'Home',
    shop: 'Order',
    chat: 'Naya',
    profile: 'Profile',
    changeLang: 'Bhasha badlo',
    error: 'Ek error aa gayi. Please dobara try karein.',
    loading: 'Load ho raha hai...',
  },
  english: {
    loginTitle: 'AI Shopkeeper',
    loginText: 'Login with your mobile number',
    loginPlaceholder: 'Enter your 10-digit mobile number',
    loginButton: 'Send OTP',
    profileTitle: 'Enter Your Identity',
    profilePlaceholder: 'Your Name',
    profileButton: 'Track Location',
    confirmTitle: 'Confirm Location',
    confirmLocationText: 'Your Location:',
    confirmButton: 'Yes, this is correct',
    chatTitle: 'Chat with AI',
    chatOrder: 'Order #',
    chatPlaceholder: 'What do you want to buy?',
    chatSend: 'Send',
    confirmLocationPrompt: 'Is this location correct?',
    home: 'Home',
    shop: 'Order',
    chat: 'New',
    profile: 'Profile',
    changeLang: 'Change Language',
    error: 'An error occurred. Please try again.',
    loading: 'Loading...',
  },
};

// --- Main App Component ---
function App() {
  const [page, setPage] = useState('login'); // login, profile, confirmLocation, chat
  const [language, setLanguage] = useState('hindi');
  const [name, setName] = useState('');
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orderId] = useState(Math.floor(10000 + Math.random() * 90000));

  const T = translations[language]; // Get current language translations

  const trackLocation = () => {
    setIsLoading(true);
    setLocationError('');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // Simple display of lat/lon. In a real app, you'd use a geocoding service.
          setLocation(`Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`);
          setIsLoading(false);
          setPage('confirmLocation');
        },
        (error) => {
          setLocationError('Location access denied. Please enable it in your browser settings.');
          setIsLoading(false);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = { sender: 'user', text: inputMessage };
    setChatHistory((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/chat', {
        message: inputMessage,
        language: language,
      });
      const aiMessage = { sender: 'ai', text: response.data.reply };
      setChatHistory((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = { sender: 'ai', text: T.error };
      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render Functions for each page ---

  const renderLogin = () => (
    <div className="w-full h-full flex flex-col justify-between">
      <div className="p-6">
        <h2 className="text-center text-2xl font-bold text-gray-800">{T.loginText}</h2>
        <input
          type="tel"
          placeholder={T.loginPlaceholder}
          className="w-full p-3 mt-6 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
        />
        <button onClick={() => setPage('profile')} className="w-full bg-green-500 text-white p-3 mt-4 rounded-lg font-bold text-lg hover:bg-green-600">
          {T.loginButton}
        </button>
      </div>
      <LanguageSelector />
    </div>
  );

  const renderProfile = () => (
    <div className="w-full h-full flex flex-col justify-between">
       <div className="p-6">
        <h2 className="text-center text-2xl font-bold text-gray-800">{T.profileTitle}</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={T.profilePlaceholder}
          className="w-full p-3 mt-6 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
        />
        <button
          onClick={trackLocation}
          disabled={!name.trim() || isLoading}
          className="w-full bg-green-500 text-white p-3 mt-4 rounded-lg font-bold text-lg hover:bg-green-600 disabled:bg-gray-400"
        >
          {isLoading ? T.loading : T.profileButton}
        </button>
        {locationError && <p className="text-red-500 text-center mt-2">{locationError}</p>}
      </div>
       <LanguageSelector />
    </div>
  );

  const renderConfirmLocation = () => (
    <div className="w-full h-full flex flex-col justify-between items-center p-6 text-center">
        <div>
            <h2 className="text-3xl font-bold text-gray-800">{name}</h2>
            <div className="my-8">
                <p className="text-gray-600">{T.confirmLocationText}</p>
                <p className="font-bold text-lg">{location}</p>
                 <div className="h-40 w-full bg-gray-200 mt-4 rounded-lg flex items-center justify-center text-gray-500">
                    Map Placeholder
                 </div>
            </div>
            <button onClick={() => setPage('chat')} className="w-full bg-green-500 text-white p-3 rounded-lg font-bold text-lg hover:bg-green-600">
                {T.confirmButton}
            </button>
        </div>
        <LanguageSelector />
    </div>
  );

  const renderChat = () => (
    <div className="w-full h-full flex flex-col">
        <div className="p-4 border-b-2 border-gray-200">
            <h2 className="text-center text-lg font-bold text-gray-800">{T.chatTitle}</h2>
            <p className="text-center text-sm text-gray-500">{T.chatOrder}{orderId}</p>
            <div className="text-center mt-2">
                <button onClick={() => setPage('confirmLocation')} className="text-sm text-blue-600 hover:underline">
                    {T.confirmLocationPrompt}
                </button>
            </div>
        </div>
        <div className="flex-1 p-4 overflow-y-auto bg-gray-100">
            {chatHistory.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
                    <div className={`p-3 rounded-lg max-w-xs ${msg.sender === 'user' ? 'bg-green-500 text-white' : 'bg-white border border-gray-200'}`}>
                        {msg.text}
                    </div>
                </div>
            ))}
            {isLoading && <div className="flex justify-start"><div className="p-3 rounded-lg bg-white border border-gray-200">{T.loading}</div></div>}
        </div>
        <form onSubmit={handleSendMessage} className="p-4 border-t-2 border-gray-200 flex items-center bg-white">
            <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={T.chatPlaceholder}
                className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
            />
            <button type="submit" className="ml-3 bg-green-500 text-white p-3 rounded-lg font-bold hover:bg-green-600">
                {T.chatSend}
            </button>
        </form>
    </div>
  );

  const LanguageSelector = () => (
    <div className="text-center p-4">
        <span className="text-sm text-gray-600 mr-2">{T.changeLang}:</span>
        <button onClick={() => setLanguage('hindi')} className={`px-2 py-1 rounded ${language === 'hindi' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>हिन्दी</button>
        <button onClick={() => setLanguage('hinglish')} className={`ml-2 px-2 py-1 rounded ${language === 'hinglish' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>Hinglish</button>
        <button onClick={() => setLanguage('english')} className={`ml-2 px-2 py-1 rounded ${language === 'english' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>English</button>
    </div>
  );

  const renderPage = () => {
    switch (page) {
      case 'profile':
        return renderProfile();
      case 'confirmLocation':
        return renderConfirmLocation();
      case 'chat':
        return renderChat();
      case 'login':
      default:
        return renderLogin();
    }
  };

  const renderHeader = () => {
    const titles = {
        login: T.loginTitle,
        profile: T.profileTitle,
        confirmLocation: T.confirmTitle,
        chat: T.chatTitle
    };
    return (
        <header className="bg-green-500 text-white text-center p-4 font-bold text-xl">
            {titles[page]}
        </header>
    );
  }

  const renderFooter = () => (
    <footer className="w-full grid grid-cols-4 items-center bg-white border-t-2 p-2">
        <button onClick={() => setPage('login')} className="flex flex-col items-center text-gray-600 hover:text-green-500">
            <span className="text-2xl">🏠</span><span className="text-xs">{T.home}</span>
        </button>
        <button className="flex flex-col items-center text-gray-600 hover:text-green-500">
            <span className="text-2xl">🛒</span><span className="text-xs">{T.shop}</span>
        </button>
        <button onClick={() => setPage('chat')} className="flex flex-col items-center text-gray-600 hover:text-green-500">
            <span className="text-2xl">💬</span><span className="text-xs">{T.chat}</span>
        </button>
        <button onClick={() => setPage('profile')} className="flex flex-col items-center text-gray-600 hover:text-green-500">
            <span className="text-2xl">👤</span><span className="text-xs">{T.profile}</span>
        </button>
    </footer>
  );


  return (
    <div className="bg-gray-100 flex justify-center items-center h-screen">
        <div className="w-full max-w-sm h-[85vh] max-h-[800px] bg-white shadow-2xl rounded-2xl flex flex-col overflow-hidden">
            {renderHeader()}
            <main className="flex-1 overflow-y-auto">
                {renderPage()}
            </main>
            {renderFooter()}
        </div>
    </div>
  );
}

export default App;

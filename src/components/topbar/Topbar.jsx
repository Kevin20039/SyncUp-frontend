import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import Search from "../search/Search"; 

export default function Topbar() {
  const { user, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const PF = import.meta.env.VITE_PUBLIC_FOLDER;

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  return (
    <div className="h-16 w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 sticky top-0 z-50 flex items-center px-6 shadow-xl backdrop-blur-sm">
      <div className="flex items-center space-x-8 flex-1">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
            </svg>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            SyncUp
          </span>
        </Link>
        
        <div className="hidden lg:block w-96">
          <Search />
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          
          <Link to="/" className="p-2.5 rounded-xl hover:bg-gray-700/50 transition-all duration-200 group">
            <svg className="w-5 h-5 text-gray-300 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>
          
          
          <Link to="/messenger" className="p-2.5 rounded-xl hover:bg-gray-700/50 transition-all duration-200 group relative">
            <svg className="w-5 h-5 text-gray-300 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </Link>
        </div>
        
        <div className="w-px h-8 bg-gray-600"></div>
        
        <Link to={`/profile/${user.username}`} className="flex items-center space-x-3 group">
          <img
            src={user.profilePicture ? `http://localhost:8800/images/${user.profilePicture}` : PF + "D:\sociel-media\social-media-frontend\public\person\noAvtar.png"}
            alt="Profile"
            className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-600 group-hover:ring-blue-400 transition-all duration-200"
            onError={(e) => {
              e.target.src = PF + "person/noAvatar.png";
            }}
            
          />
          <div className="hidden md:block">
            <div className="text-sm font-medium text-white">{user.username}</div>
            <div className="text-xs text-gray-400">Online</div>
          </div>
        </Link>
        
        <button 
          onClick={handleLogout} 
          className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-xl text-sm hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-red-500/25"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import api from "../../api";
import Topbar from "../../components/topbar/Topbar";
import Feed from "../../components/feed/Feed";
import EditProfile from "../../components/editProfile/EditProfile";
import FollowListModal from "../../components/followListModal/FollowListModal";
import { AuthContext } from "../../context/AuthContext";

export default function Profile() {
  const [user, setUser] = useState({});
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, listType: null });
  const username = useParams().username;
  const { user: currentUser, dispatch } = useContext(AuthContext);
  const PF = import.meta.env.VITE_PUBLIC_FOLDER;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/users?username=${username}`);
        setUser(res.data);
        setFollowersCount(res.data.followers?.length || 0);
        setFollowingCount(res.data.following?.length || 0);
        setIsFollowing(currentUser.following.includes(res.data._id));
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, [username, currentUser.following]);

  const handleFollow = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      if (isFollowing) {
        await api.put(`/users/${user._id}/unfollow`, { userId: currentUser._id });
        dispatch({ type: "UNFOLLOW", payload: user._id });
        setFollowersCount(prev => prev - 1);
      } else {
        await api.put(`/users/${user._id}/follow`, { userId: currentUser._id });
        dispatch({ type: "FOLLOW", payload: user._id });
        setFollowersCount(prev => prev + 1);
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error("Error following/unfollowing:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Topbar />
      <div className="w-full max-w-4xl mx-auto px-4 py-6">
        
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-xl overflow-hidden mb-6">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600">
            <img
              src={user.coverPicture ? `http://localhost:8800/images/${user.coverPicture}` : PF + "person/noCover.png"}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Main Info Section */}
          <div className="p-6">
            <div className="flex items-start justify-between">
              {/* Profile Pic & Initial Info */}
              <div className="flex" style={{ marginTop: '-80px' }}>
                <img
                  src={user.profilePicture ? `http://localhost:8800/images/${user.profilePicture}` : PF + "person/noAvatar.png"}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover ring-4 ring-gray-800 shadow-xl"
                />
                <div className="ml-4 mt-16">
                  <h1 className="text-3xl font-bold text-white">{user.username}</h1>
                  <p className="text-gray-400">{user.desc || "No description available"}</p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                {currentUser.username !== user.username ? (
                  <button
                    onClick={handleFollow}
                    disabled={isLoading}
                    className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                      isFollowing
                        ? 'bg-gray-600 text-white hover:bg-gray-700'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                   {isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditProfileOpen(true)}
                    className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-xl"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
            
            {/* Stats */}
            <div className="mt-4 flex items-center space-x-8 text-sm">
              <div onClick={() => setModalState({ isOpen: true, listType: 'followers' })} className="flex items-center space-x-2 cursor-pointer hover:underline">
                <span className="text-white font-semibold">{followersCount}</span>
                <span className="text-gray-400">followers</span>
              </div>
              <div onClick={() => setModalState({ isOpen: true, listType: 'following' })} className="flex items-center space-x-2 cursor-pointer hover:underline">
                <span className="text-white font-semibold">{followingCount}</span>
                <span className="text-gray-400">following</span>
              </div>
            </div>
          </div>
        </div>
        
        <Feed username={username} />
      </div>
      
      <EditProfile 
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        userToEdit={user}
        onUpdate={(updatedUser) => setUser(updatedUser)}
      />

      <FollowListModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, listType: null })}
        userId={user._id}
        listType={modalState.listType}
      />
    </div>
  );
}
import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api";

export default function EditProfile({ isOpen, onClose, onUpdate }) {
    const { user, dispatch } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        username: user.username || "",  
        email: user.email || "",
        desc: user.desc || ""
    });
    const [profilePicture, setProfilePicture] = useState(null);
    const [coverPicture, setCoverPicture] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("edit"); // "edit" or "followers"
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);
    const PF = import.meta.env.VITE_PUBLIC_FOLDER;

    useEffect(() => {
        if (isOpen && activeTab === "followers") {
            fetchFollowers();
        }
    }, [isOpen, activeTab]);

    const fetchFollowers = async () => {
        setIsLoadingFollowers(true);
        try {
            const [followersRes, followingRes] = await Promise.all([
                api.get(`/users/${user._id}/followers`),
                api.get(`/users/${user._id}/following`)
            ]);
            setFollowers(followersRes.data);
            setFollowing(followingRes.data);
        } catch (err) {
            console.error("Error fetching followers:", err);
        } finally {
            setIsLoadingFollowers(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (type === 'profile') {
                setProfilePicture(file);
            } else {
                setCoverPicture(file);
            }
        }
    };

    const uploadFile = async (file) => {
        if (!file) return null;
        
        const data = new FormData();
        const fileName = Date.now() + file.name;
        data.append("name", fileName);
        data.append("file", file);
        
        try {
            await api.post("/upload", data);
            return fileName;
        } catch (err) {
            console.error("File upload failed:", err);
            return null;
        }
    };

    // src/components/editProfile/EditProfile.jsx

const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
        let profilePictureName = user.profilePicture;
        let coverPictureName = user.coverPicture;
        
        if (profilePicture) {
            profilePictureName = await uploadFile(profilePicture);
        }
        if (coverPicture) {
            coverPictureName = await uploadFile(coverPicture);
        }
        
        const updatePayload = {
            userId: user._id,
            ...formData,
            profilePicture: profilePictureName,
            coverPicture: coverPictureName
        };
        
        // --- FIX 1: Correct API endpoint (removed /update) ---
        const res = await api.put(`/users/${user._id}`, updatePayload);
        
        // --- FIX 2: Use LOGIN_SUCCESS to update the global user state ---
        dispatch({ type: "LOGIN_SUCCESS", payload: res.data });

        onUpdate(res.data);
        onClose();
    } catch (err) {
        console.error("Profile update failed:", err);
    } finally {
        setIsLoading(false);
    }
};
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
                    <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-gray-700/50 transition-colors"
                    >
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-700/50">
                    <button
                        onClick={() => setActiveTab("edit")}
                        className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                            activeTab === "edit" 
                                ? "text-blue-400 border-b-2 border-blue-400" 
                                : "text-gray-400 hover:text-gray-300"
                        }`}
                    >
                        Edit Profile
                    </button>
                    <button
                        onClick={() => setActiveTab("followers")}
                        className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                            activeTab === "followers" 
                                ? "text-blue-400 border-b-2 border-blue-400" 
                                : "text-gray-400 hover:text-gray-300"
                        }`}
                    >
                        Followers ({followers.length})
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {activeTab === "edit" ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Profile Picture */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-300">Profile Picture</label>
                                <div className="flex items-center space-x-4">
                                    <img
                                        src={
                                            profilePicture 
                                                ? URL.createObjectURL(profilePicture)
                                                : user.profilePicture 
                                                    ? `http://localhost:8800/images/${user.profilePicture}`
                                                    : PF + "person/noAvatar.png"
                                        }
                                        alt="Profile"
                                        className="w-20 h-20 rounded-full object-cover ring-2 ring-gray-600"
                                        onError={(e) => {
                                            e.target.src = PF + "person/noAvatar.png";
                                        }}
                                    />
                                    <label className="cursor-pointer">
                                        <div className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-colors">
                                            Change Photo
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'profile')}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Cover Picture */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-300">Cover Picture</label>
                                <div className="space-y-3">
                                    <div className="h-32 bg-gray-700/50 rounded-xl overflow-hidden">
                                        <img
                                            src={
                                                coverPicture 
                                                    ? URL.createObjectURL(coverPicture)
                                                    : user.coverPicture 
                                                        ? `http://localhost:8800/images/${user.coverPicture}`
                                                        : PF + "person/noCover.png"
                                            }
                                            alt="Cover"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                    <label className="cursor-pointer">
                                        <div className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-colors text-center">
                                            Change Cover Photo
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'cover')}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Username */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter username"
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter email"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Bio</label>
                                <textarea
                                    name="desc"
                                    value={formData.desc}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-6 py-3 bg-gray-600 text-white font-medium rounded-xl hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Saving...</span>
                                        </div>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            {/* Followers List */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Your Followers</h3>
                                {isLoadingFollowers ? (
                                    <div className="flex justify-center py-8">
                                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : followers.length > 0 ? (
                                    <div className="space-y-3">
                                        {followers.map((follower) => (
                                            <div key={follower._id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl">
                                                <div className="flex items-center space-x-3">
                                                    <img
                                                        src={follower.profilePicture ? `http://localhost:8800/images/${follower.profilePicture}` : PF + "person/noAvatar.png"}
                                                        alt={follower.username}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                        onError={(e) => {
                                                            e.target.src = PF + "person/noAvatar.png";
                                                        }}
                                                    />
                                                    <div>
                                                        <div className="font-medium text-white">{follower.username}</div>
                                                        <div className="text-sm text-gray-400">{follower.desc || "No bio"}</div>
                                                    </div>
                                                </div>
                                                <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors">
                                                    View Profile
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-400">
                                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <p>No followers yet</p>
                                        <p className="text-sm">Start posting to get followers!</p>
                                    </div>
                                )}
                            </div>

                            {/* Following List */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">People You Follow</h3>
                                {following.length > 0 ? (
                                    <div className="space-y-3">
                                        {following.map((followed) => (
                                            <div key={followed._id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl">
                                                <div className="flex items-center space-x-3">
                                                    <img
                                                        src={followed.profilePicture ? `http://localhost:8800/images/${followed.profilePicture}` : PF + "person/noAvatar.png"}
                                                        alt={followed.username}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                        onError={(e) => {
                                                            e.target.src = PF + "person/noAvatar.png";
                                                        }}
                                                    />
                                                    <div>
                                                        <div className="font-medium text-white">{followed.username}</div>
                                                        <div className="text-sm text-gray-400">{followed.desc || "No bio"}</div>
                                                    </div>
                                                </div>
                                                <button className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-lg hover:bg-red-500/30 transition-colors">
                                                    Unfollow
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-400">
                                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <p>Not following anyone yet</p>
                                        <p className="text-sm">Discover and follow interesting people!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 
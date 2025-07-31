import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

export default function FollowListModal({ isOpen, onClose, userId, listType }) {
    const [list, setList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const PF = import.meta.env.VITE_PUBLIC_FOLDER;

    useEffect(() => {
        if (!isOpen || !userId || !listType) return;

        const fetchList = async () => {
            setIsLoading(true);
            try {
                const res = await api.get(`/users/${userId}/${listType}`);
                setList(res.data);
            } catch (err) {
                console.error(`Failed to fetch ${listType}:`, err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchList();
    }, [isOpen, userId, listType]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm max-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700">
                    <h3 className="text-xl font-bold text-white text-center capitalize">{listType}</h3>
                </div>
                <div className="p-4 overflow-y-auto">
                    {isLoading ? (
                        <p className="text-center text-gray-400">Loading...</p>
                    ) : (
                        <div className="space-y-3">
                            {list.map(user => (
                                <Link to={`/profile/${user.username}`} key={user._id} onClick={onClose} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700/50">
                                    <img 
                                        src={user.profilePicture ? `http://localhost:8800/images/${user.profilePicture}` : PF + "person/noAvatar.png"} 
                                        alt={user.username}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <span className="font-medium text-white">{user.username}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
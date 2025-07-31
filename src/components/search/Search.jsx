import { useState, useEffect, useRef } from 'react'; // --- ADD useEffect and useRef ---
import { Link } from 'react-router-dom'; // --- ADD THIS IMPORT ---
import api from '../../api';

export default function Search({ onUserSelect }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const searchRef = useRef(null); // --- ADD THIS REF ---
    const PF = import.meta.env.VITE_PUBLIC_FOLDER;

    const handleSearch = async (e) => {
        const searchQuery = e.target.value;
        setQuery(searchQuery);

        if (searchQuery.length > 1) {
            try {
                const res = await api.get(`/users/search?username=${searchQuery}`);
                setResults(res.data);
            } catch (err) {
                console.error("Failed to search users:", err);
            }
        } else {
            setResults([]);
        }
    };

    const handleSelect = (user) => {
        // This will now clear the search results when a user is clicked
        setQuery("");
        setResults([]);
        // If the onUserSelect function is provided (like on the chat page), it will still run
        if (onUserSelect) {
            onUserSelect(user);
        }
    }

    // --- ADD THIS TO CLOSE THE DROPDOWN WHEN CLICKING OUTSIDE ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setResults([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [searchRef]);


    return (
        <div className="relative" ref={searchRef}>
            <input
                placeholder="Search..." // Changed placeholder for general use
                className="w-full py-2 px-3 rounded-full bg-gray-700/50 text-white focus:outline-none"
                value={query}
                onChange={handleSearch}
            />
            {results.length > 0 && (
                <div className="absolute w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                    {results.map(user => (
                        // --- THE FIX: WRAP THE RESULT IN A <Link> COMPONENT ---
                        <Link
                            to={`/profile/${user.username}`}
                            key={user._id}
                            onClick={() => handleSelect(user)}
                            className="flex items-center p-2 cursor-pointer hover:bg-gray-700/50"
                        >
                            <img
                                className="w-8 h-8 rounded-full object-cover mr-3"
                                src={user.profilePicture ? `http://localhost:8800/images/${user.profilePicture}` : PF + "person/noAvatar.png"}
                                alt={user.username}
                            />
                            <span className="font-medium text-white">{user.username}</span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
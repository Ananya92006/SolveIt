import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axiosClient from "../utils/axiosClient";
import Navbar from "../components/Navbar";

function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { user: currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axiosClient.get("/problem/leaderboard");
        // Ensure ranking is present, fallback to array index + 1
        const rankedData = response.data.map((u, i) => ({
          ...u,
          rank: u.rank || i + 1,
        }));
        setUsers(rankedData);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const filteredUsers = users.filter((u) =>
    (u.firstName + " " + (u.lastName || "")).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const firstPlace = users.find((u) => u.rank === 1);
  const secondPlace = users.find((u) => u.rank === 2);
  const thirdPlace = users.find((u) => u.rank === 3);

  const renderPodiumCard = (user, place) => {
    if (!user) return <div className="flex-1"></div>;
    
    let heightClass = place === 1 ? "h-64" : place === 2 ? "h-56" : "h-48";
    let borderClass = place === 1 ? "border-accent ring-2 ring-accent/50 shadow-[0_0_15px_rgba(251,191,36,0.3)]" : place === 2 ? "border-base-content/30" : "border-warning/50";
    let medal = place === 1 ? "👑" : place === 2 ? "🥈" : "🥉";
    let avatarLetter = user.firstName ? user.firstName.charAt(0).toUpperCase() : "U";

    return (
      <div className={`flex flex-col items-center justify-end flex-1 ${place === 1 ? "order-2 z-10 -mx-4" : place === 2 ? "order-1" : "order-3"}`}>
        <div className={`glass-card bg-base-100 flex flex-col items-center justify-center p-4 w-full rounded-t-2xl border-t-4 ${borderClass} ${heightClass} transition-all duration-300 hover:-translate-y-2`}>
          <div className="text-4xl mb-2 animate-bounce">{medal}</div>
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-3 shadow-lg">
            <span className="text-2xl font-bold text-primary-content">{avatarLetter}</span>
          </div>
          <h3 className="font-bold text-lg text-center truncate w-full">{user.firstName}</h3>
          <p className="text-sm text-base-content/70">{user.score} pts</p>
          <div className="badge badge-primary badge-sm mt-2">{user.totalSolved} solved</div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fade-in">
        {/* Title */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold">
            <span className="gradient-text">🏆 Global Leaderboard</span>
          </h1>
          <p className="text-base-content/60 text-lg">See how you rank against other developers</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="loading loading-bars loading-lg text-primary"></span>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-2xl">
            <h2 className="text-2xl font-bold text-base-content/50">No users found yet.</h2>
          </div>
        ) : (
          <div className="space-y-12 animate-slide-up">
            {/* Podium */}
            <div className="flex items-end max-w-3xl mx-auto mt-10">
              {renderPodiumCard(secondPlace, 2)}
              {renderPodiumCard(firstPlace, 1)}
              {renderPodiumCard(thirdPlace, 3)}
            </div>

            {/* Search */}
            <div className="flex justify-between items-center bg-base-100 p-4 rounded-2xl shadow-sm border border-base-content/5">
              <h2 className="text-xl font-bold ml-2">All Ranks</h2>
              <div className="relative w-full max-w-xs">
                <input
                  type="text"
                  placeholder="Search by name..."
                  className="input input-bordered w-full pl-10 bg-base-200/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-3 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto glass-card rounded-2xl border border-base-content/5">
              <table className="table w-full">
                <thead className="bg-base-200/50 text-base-content/70">
                  <tr>
                    <th className="w-16 text-center">Rank</th>
                    <th>User</th>
                    <th className="text-right">Score</th>
                    <th className="text-center">Total</th>
                    <th className="text-center hidden sm:table-cell">Easy</th>
                    <th className="text-center hidden sm:table-cell">Medium</th>
                    <th className="text-center hidden sm:table-cell">Hard</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-base-content/50">
                        No users match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const isCurrentUser = currentUser?.emailId === user.emailId;
                      const medal = user.rank === 1 ? "🥇" : user.rank === 2 ? "🥈" : user.rank === 3 ? "🥉" : `#${user.rank}`;
                      const avatarLetter = user.firstName ? user.firstName.charAt(0).toUpperCase() : "U";

                      return (
                        <tr
                          key={user._id || user.emailId}
                          className={`hover:bg-base-200/50 transition-colors ${
                            isCurrentUser ? "bg-primary/10 border-l-4 border-primary" : "border-l-4 border-transparent"
                          }`}
                        >
                          <td className="text-center font-bold text-lg">{medal}</td>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="avatar">
                                <div className="w-10 h-10 rounded-full bg-base-300 flex items-center justify-center">
                                  <span className="text-base-content font-bold">{avatarLetter}</span>
                                </div>
                              </div>
                              <div>
                                <div className="font-bold">{user.firstName} {isCurrentUser && <span className="text-xs text-primary font-normal ml-2">(You)</span>}</div>
                                <div className="text-xs text-base-content/50">{user.emailId}</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-right font-mono font-bold text-primary">{user.score}</td>
                          <td className="text-center font-bold">{user.totalSolved}</td>
                          <td className="text-center hidden sm:table-cell">
                            <span className="badge badge-success badge-sm badge-outline">{user.easy || 0}</span>
                          </td>
                          <td className="text-center hidden sm:table-cell">
                            <span className="badge badge-warning badge-sm badge-outline">{user.medium || 0}</span>
                          </td>
                          <td className="text-center hidden sm:table-cell">
                            <span className="badge badge-error badge-sm badge-outline">{user.hard || 0}</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;

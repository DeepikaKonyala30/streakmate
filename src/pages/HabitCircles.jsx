import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Users, Lock, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

function HabitCircles() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("myCircles");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [myCircles, setMyCircles] = useState([]);
  const [discoverCircles, setDiscoverCircles] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [circleData, setCircleData] = useState({
    name: "",
    description: "",
    privacy: "public",
    category: "Other",
    habits: [],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  useEffect(() => {
    loadMyCircles();
    loadDiscoverCircles();
  }, []);

  useEffect(() => {
    if (activeTab === "discover") loadDiscoverCircles();
  }, [searchQuery, selectedCategory, activeTab]);

  const loadMyCircles = async () => {
    try {
      setLoading(true);
      const circles = await api.getMyCircles();
      setMyCircles(circles);
    } catch {
      setError("Failed to load your circles");
    } finally {
      setLoading(false);
    }
  };

  const loadDiscoverCircles = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedCategory !== "All Categories") params.category = selectedCategory;
      const response = await api.getCircles(params);
      setDiscoverCircles(response.circles || response);
    } catch {
      setError("Failed to load circles");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setCircleData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCreateCircle = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      const newCircle = await api.createCircle(circleData);
      setMyCircles((prev) => [newCircle, ...prev]);
      setCircleData({
        name: "",
        description: "",
        privacy: "public",
        category: "Other",
        habits: [],
      });
      setShowCreateModal(false);
      setActiveTab("myCircles");
    } catch (err) {
      setError(err.message || "Failed to create circle");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCircle = async (circle) => {
    const circleId = circle._id || circle.id;
    try {
      setLoading(true);
      if (circle.privacy === "private") {
        await api.sendJoinRequest(circleId);
        alert("Join request sent to the circle admin");
      } else {
        await api.joinCircle(circleId);
      }
      await loadMyCircles();
      await loadDiscoverCircles();
    } catch (err) {
      setError(err.message || "Failed to join circle");
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveCircle = async (circleId) => {
    const id = circleId?._id || circleId;
    if (!window.confirm("Are you sure you want to leave this circle?")) return;
    try {
      setLoading(true);
      await api.leaveCircle(id);
      setMyCircles((prev) => prev.filter((c) => (c._id || c.id) !== id));
      await loadDiscoverCircles();
    } catch {
      setError("Failed to leave circle");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCircle = async (circleId) => {
    const id = circleId?._id || circleId;
    if (!window.confirm("Are you sure you want to delete this circle?")) return;
    try {
      setLoading(true);
      await api.deleteCircle(id);
      setMyCircles((prev) => prev.filter((c) => (c._id || c.id) !== id));
      setDiscoverCircles((prev) => prev.filter((c) => (c._id || c.id) !== id));
    } catch (err) {
      setError(err.message || "Failed to delete circle");
    } finally {
      setLoading(false);
    }
  };

  const CircleCard = ({ circle }) => (
    <motion.div
      className="bg-white rounded-xl shadow-soft overflow-hidden flex flex-col"
      whileHover={{ y: -4, boxShadow: "0 6px 20px rgba(0,0,0,0.1)" }}
      transition={{ duration: 0.3 }}
    >
      <div className="h-32 overflow-hidden">
        <img
          src={circle.image}
          alt={circle.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) =>
            (e.target.src =
              "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80")
          }
        />
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display font-semibold text-base truncate">
            {circle.name}
          </h3>
          {circle.privacy === "private" ? (
            <Lock size={14} className="text-neutral-500" />
          ) : (
            <Globe size={14} className="text-neutral-500" />
          )}
        </div>
        <div className="flex items-center text-neutral-600 mb-3">
          <Users size={14} className="mr-1" />
          <span className="text-xs">{circle.members} members</span>
        </div>
        {circle.category && (
          <div className="text-xs text-neutral-500 mb-2">
            Category: {circle.category}
          </div>
        )}
        <p className="text-xs text-neutral-500 mb-4 line-clamp-2">
          {circle.habits?.length > 0
            ? circle.habits.join(", ")
            : circle.description || "No habits specified"}
        </p>
        <div className="mt-auto flex gap-2">
          {activeTab === "myCircles" ? (
            <>
              <button
                onClick={() => navigate(`/circles/${circle._id || circle.id}/chat`)}
                className="flex-1 py-2 px-3 rounded-lg font-medium text-sm bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
              >
                View Circle
              </button>
              {!circle.isCreator && (
                <button
                  onClick={() => handleLeaveCircle(circle._id || circle.id)}
                  className="py-2 px-3 rounded-lg font-medium text-sm text-red-600 hover:bg-red-50 transition-colors"
                  disabled={loading}
                >
                  Leave
                </button>
              )}
            </>
          ) : (
            <button
              onClick={() => handleJoinCircle(circle)}
              className="w-full py-2 px-4 rounded-lg font-medium text-sm bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:bg-primary-300"
              disabled={loading || circle.isMember}
            >
              {circle.isMember
                ? "Already Joined"
                : circle.privacy === "private"
                ? "Send Join Request"
                : "Join Circle"}
            </button>
          )}
          {circle.isCreator && (
            <button
              onClick={() => handleDeleteCircle(circle._id || circle.id)}
              className="py-2 px-3 rounded-lg font-medium text-sm text-red-600 hover:bg-red-50 transition-colors"
              disabled={loading}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );

  const categories = [
    "All Categories",
    "Fitness",
    "Mindfulness",
    "Learning",
    "Productivity",
    "Health",
    "Other",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-50 pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {/* Tabs */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setActiveTab("myCircles")}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === "myCircles"
                ? "bg-primary-600 text-white"
                : "bg-white text-neutral-700"
            }`}
          >
            My Circles
          </button>
          <button
            onClick={() => setActiveTab("discover")}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === "discover"
                ? "bg-primary-600 text-white"
                : "bg-white text-neutral-700"
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="ml-auto flex items-center gap-1 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
          >
            <PlusCircle size={16} /> Create Circle
          </button>
        </div>
        {/* Category Filter & Search */}
        {activeTab === "discover" && (
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              placeholder="Search circles…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}
        {/* Circle Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {(activeTab === "myCircles" ? myCircles : discoverCircles).map(
            (circle) => (
              <CircleCard key={circle._id || circle.id} circle={circle} />
            )
          )}
        </div>
        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Create Circle</h2>
              <form onSubmit={handleCreateCircle} className="flex flex-col gap-3">
                <input
                  type="text"
                  name="name"
                  placeholder="Circle Name"
                  value={circleData.name}
                  onChange={handleChange}
                  required
                  className="px-3 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  name="description"
                  placeholder="Description"
                  value={circleData.description}
                  onChange={handleChange}
                  className="px-3 py-2 border rounded-lg"
                />
                <select
                  name="privacy"
                  value={circleData.privacy}
                  onChange={handleChange}
                  className="px-3 py-2 border rounded-lg"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
                <select
                  name="category"
                  value={circleData.category}
                  onChange={handleChange}
                  className="px-3 py-2 border rounded-lg"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-lg bg-neutral-200 hover:bg-neutral-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HabitCircles;

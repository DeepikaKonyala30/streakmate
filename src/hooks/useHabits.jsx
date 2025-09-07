import { useState, useEffect } from 'react';
import { format, isSameDay, differenceInDays, subDays } from 'date-fns';

const useHabits = () => {
  const [habits, setHabits] = useState([]);
  const [completedToday, setCompletedToday] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHabits = async () => {
    console.log('useHabits: Starting fetchHabits');
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      console.log('useHabits: Token retrieved:', token ? 'Present' : 'Missing');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('useHabits: Fetching habits from /api/habits');
      const response = await fetch('http://localhost:5000/api/habits', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('useHabits: Response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('useHabits: Habits data received:', data);
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch habits');
      }

      setHabits(data.habits);
      calculateStats(data.habits);
      setLoading(false);
      console.log('useHabits: Habits fetched successfully, loading set to false');
    } catch (err) {
      console.error('useHabits: Error in fetchHabits:', err.message);
      setError(err.message);
      setLoading(false);
      setHabits([]);
    }
  };

  const completeHabit = async (id, date) => {
    console.log(`useHabits: Attempting to complete habit with id: ${id} for date: ${date}`);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/habits/${id}/complete`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: format(new Date(date), 'yyyy-MM-dd'), completed: true }),
      });
      const data = await response.json();
      console.log('useHabits: Complete response:', data);
      if (!data.success) {
        throw new Error(data.message || 'Failed to complete habit');
      }
      // Refetch habits after completion
      await fetchHabits();
    } catch (err) {
      console.error('Error completing habit:', err);
      setError(err.message);
    }
  };

  const deleteHabit = async (id) => {
    console.log(`useHabits: Attempting to delete habit with id: ${id}`);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/habits/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log('useHabits: Delete response:', data);
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete habit');
      }
      // Refetch habits after deletion
      fetchHabits();
    } catch (err) {
      console.error('Error deleting habit:', err);
      setError(err.message);
    }
  };

  const calculateStats = (habits) => {
    console.log('useHabits: Calculating stats for habits:', habits);
    const today = format(new Date(), 'yyyy-MM-dd');
    let todayCount = 0;
    let currentStreak = 0;
    let maxStreak = 0;

    habits.forEach((habit) => {
      console.log(`useHabits: Processing habit: ${habit.name}, frequency: ${habit.frequency}`);
      // Count habits completed today
      if (habit.completedDates.includes(today)) {
        todayCount++;
      }

      // Calculate streaks
      let streak = 0;
      let currentDate = new Date();
      let dates = [...habit.completedDates].sort((a, b) => new Date(b) - new Date(a));
      console.log(`useHabits: Sorted completedDates for ${habit.name}:`, dates);

      if (habit.frequency === 'daily') {
        for (let i = 0; i < dates.length; i++) {
          if (i === 0 && isSameDay(new Date(dates[i]), currentDate)) {
            streak++;
            currentDate = subDays(currentDate, 1);
          } else if (i > 0 && differenceInDays(new Date(dates[i - 1]), new Date(dates[i])) === 1) {
            streak++;
          } else {
            break;
          }
        }
      } else if (habit.frequency === 'weekly') {
        const weeks = {};
        dates.forEach((date) => {
          const weekStart = format(new Date(date), 'yyyy-WW');
          weeks[weekStart] = (weeks[weekStart] || 0) + 1;
        });
        console.log(`useHabits: Weekly completions for ${habit.name}:`, weeks);

        let currentWeek = format(new Date(), 'yyyy-WW');
        while (weeks[currentWeek] && weeks[currentWeek] >= (habit.target || 1)) {
          streak++;
          currentWeek = format(subDays(new Date(currentWeek), 7), 'yyyy-WW');
        }
      }

      console.log(`useHabits: Streak for ${habit.name}: ${streak}`);
      if (streak > maxStreak) maxStreak = streak;
      if (habit.completedDates.includes(today)) {
        currentStreak = Math.max(currentStreak, streak);
      }
    });

    setCompletedToday(todayCount);
    setStreakCount(currentStreak);
    setLongestStreak(maxStreak);
    console.log('useHabits: Stats updated - completedToday:', todayCount, 'streakCount:', currentStreak, 'longestStreak:', maxStreak);
  };

  useEffect(() => {
    console.log('useHabits: useEffect triggered, calling fetchHabits');
    fetchHabits();
  }, []);

  return { habits, completedToday, streakCount, longestStreak, loading, error, refetch: fetchHabits, deleteHabit, completeHabit };
};

export default useHabits;

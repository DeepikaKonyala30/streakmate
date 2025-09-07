import { useState } from 'react';
import { motion } from 'framer-motion';
import { format, isSameDay } from 'date-fns';
import { Flame, MoreVertical, Edit, Trash2, Check, AlertTriangle } from 'lucide-react';
import useHabits from '../hooks/useHabits.jsx';

function HabitCard({ habit, selectedDate, refetch }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { completeHabit, deleteHabit } = useHabits();

  const isToday = isSameDay(selectedDate, new Date());
  const isCompleted = habit.completedDates.some(date => 
    isSameDay(new Date(date), selectedDate)
  );

  const weeklyProgress = habit.frequency === 'weekly' 
    ? Math.min((habit.completedDates.length / habit.target) * 100, 100) 
    : 0;

  const handleCompletion = async () => {
    if (!isToday) return;
    await completeHabit(habit._id, selectedDate);
    refetch();
  };

  return (
    <motion.div
      className={`border rounded-2xl p-6 bg-white shadow-soft ${
        isCompleted ? 'border-secondary-100' : 'border-neutral-100'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)' }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
              isCompleted ? 'bg-secondary-100 text-secondary-600' : 'bg-primary-100 text-primary-600'
            }`}
          >
            {habit.icon || <Flame size={20} />}
          </div>
          <div>
            <h3 className="font-display font-bold text-lg">{habit.name}</h3>
            <p className="text-sm text-neutral-500">
              {habit.frequency === 'daily' ? 'Daily' : `${habit.target}x per week`}
            </p>
            {habit.description && (
              <p className="text-xs text-neutral-400 italic max-w-[200px] truncate">{habit.description}</p>
            )}
          </div>
        </div>
        <div className="relative">
          <button 
            className="p-1 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-100"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical size={18} />
          </button>
          {showMenu && (
            <motion.div 
              className="absolute right-0 top-8 bg-white rounded-lg shadow-elevated py-2 w-36 z-10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <button className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-primary-50 flex items-center">
                <Edit size={16} className="mr-2" />
                <span>Edit</span>
              </button>
              <button 
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                onClick={() => { 
                  console.log(`Deleting habit with ID: ${habit._id}`); // Debugging line
                  setShowConfirm(true); 
                  setShowMenu(false); 
                }}
              >
                <Trash2 size={16} className="mr-2" />
                <span>Delete</span>
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {showConfirm && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="bg-white rounded-xl shadow-elevated p-6 w-full max-w-sm flex flex-col items-center">
            <p className="mb-4 text-center text-neutral-700">Are you sure you want to delete <span className="font-bold">{habit.name}</span>?</p>
            <div className="flex gap-2">
              <button className="btn bg-neutral-100 text-neutral-700" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="btn bg-red-500 text-white" onClick={() => { 
                deleteHabit(habit._id); 
                setShowConfirm(false); 
                refetch(); 
              }}>Delete</button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1 text-secondary-500 font-semibold text-sm">
            <Flame size={16} />
            <span>{habit.streak} day streak</span>
          </div>
          {habit.frequency === 'weekly' && (
            <span className="text-xs text-neutral-600">
              {habit.completedDates.length}/{habit.target} this week
            </span>
          )}
        </div>
        {habit.frequency === 'weekly' && (
          <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-2 bg-primary-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${weeklyProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}
      </div>

      <motion.button
        onClick={handleCompletion}
        disabled={!isToday || isCompleted}
        className={`w-full py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
          isCompleted
            ? 'bg-secondary-100 text-secondary-700 border border-secondary-200 cursor-default'
            : isToday
            ? 'bg-primary-600 text-white hover:bg-primary-700'
            : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
        }`}
        whileHover={isToday && !isCompleted ? { scale: 1.02 } : {}}
        whileTap={isToday && !isCompleted ? { scale: 0.98 } : {}}
      >
        {isCompleted ? (
          <>
            <Check size={18} />
            <span>Completed</span>
          </>
        ) : isToday ? (
          'Mark as Completed'
        ) : (
          <>
            <AlertTriangle size={18} />
            <span>Only for Today</span>
          </>
        )}
      </motion.button>
    </motion.div>
  );
}

export default HabitCard;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { fetchTasks, createTask, updateTask, deleteTask, completeTask } from '../services/api';
import { FaSearch, FaSun, FaMoon, FaChartBar, FaFilter } from 'react-icons/fa';
import './Tasks.css';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: ''
  });
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadTasks();
    // Check for saved dark mode preference
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedMode);
    document.body.classList.toggle('dark-mode', savedMode);
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const { data } = await fetchTasks();
      setTasks(data.data);
      setError('');
    } catch (err) {
      setError('Failed to load tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
    document.body.classList.toggle('dark-mode', newMode);
  };

  // Filter and search logic
  const filteredTasks = tasks.filter(task => {
    // Filter by priority
    if (filter !== 'All' && task.priority !== filter) return false;
    
    // Search by title or description
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        task.title.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  // Statistics
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    pending: tasks.filter(t => t.status === 'Pending').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    overdue: tasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed'
    ).length,
    highPriority: tasks.filter(t => t.priority === 'High').length,
    mediumPriority: tasks.filter(t => t.priority === 'Medium').length,
    lowPriority: tasks.filter(t => t.priority === 'Low').length
  };

  const completionRate = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;

  const handleInputChange = (e) => {
    setNewTask({
      ...newTask,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      const { data } = await createTask(newTask);
      setTasks([data.data, ...tasks]);
      setNewTask({ title: '', description: '', dueDate: '' });
      setShowForm(false);
    } catch (err) {
      setError('Failed to create task');
    }
  };

  const handleComplete = async (id) => {
    try {
      await completeTask(id);
      setTasks(tasks.map(task => 
        task._id === id ? { ...task, status: 'Completed' } : task
      ));
    } catch (err) {
      setError('Failed to complete task');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await deleteTask(id);
      setTasks(tasks.filter(task => task._id !== id));
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      case 'Low': return 'priority-low';
      default: return '';
    }
  };

  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }

  return (
    <div className={`tasks-container ${darkMode ? 'dark' : ''}`}>
      <div className="tasks-header">
        <div className="header-left">
          <h1>SmartTask AI</h1>
          <p>Welcome, {user?.name}!</p>
        </div>
        <div className="header-right">
          <button className="icon-btn" onClick={toggleDarkMode}>
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
          <button className="icon-btn" onClick={() => setShowStats(!showStats)}>
            <FaChartBar />
          </button>
          <button className="add-task-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Task'}
          </button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {showStats && (
        <div className="stats-dashboard">
          <h3>Dashboard</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Total Tasks</span>
              <span className="stat-value">{stats.total}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Completed</span>
              <span className="stat-value">{stats.completed}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Pending</span>
              <span className="stat-value">{stats.pending}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Overdue</span>
              <span className="stat-value">{stats.overdue}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">High Priority</span>
              <span className="stat-value">{stats.highPriority}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Completion Rate</span>
              <span className="stat-value">{completionRate}%</span>
            </div>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${completionRate}%` }}></div>
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="search-filter-bar">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="filter-box">
          <FaFilter className="filter-icon" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>
      </div>

      {showForm && (
        <form className="task-form" onSubmit={handleSubmit}>
          <h3>Create New Task</h3>
          <div className="form-group">
            <input
              type="text"
              name="title"
              value={newTask.title}
              onChange={handleInputChange}
              placeholder="Task title"
              required
            />
          </div>
          <div className="form-group">
            <textarea
              name="description"
              value={newTask.description}
              onChange={handleInputChange}
              placeholder="Task description"
              rows="3"
            />
          </div>
          <div className="form-group">
            <input
              type="date"
              name="dueDate"
              value={newTask.dueDate}
              onChange={handleInputChange}
            />
          </div>
          <button type="submit">Create Task</button>
        </form>
      )}

      <div className="tasks-list">
        {filteredTasks.length === 0 ? (
          <div className="no-tasks">
            {tasks.length === 0 ? (
              <p>No tasks yet. Create your first task!</p>
            ) : (
              <p>No tasks match your filters.</p>
            )}
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task._id} className={`task-item ${task.status === 'Completed' ? 'completed' : ''}`}>
              <div className="task-header">
                <h3>{task.title}</h3>
                <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
              
              {task.description && (
                <p className="task-description">{task.description}</p>
              )}
              
              <div className="task-footer">
                <div className="task-meta">
                  {task.dueDate && (
                    <span className={`due-date ${new Date(task.dueDate) < new Date() && task.status !== 'Completed' ? 'overdue' : ''}`}>
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                  <span className={`status status-${task.status.toLowerCase().replace(' ', '-')}`}>
                    {task.status}
                  </span>
                </div>
                
                <div className="task-actions">
                  {task.status !== 'Completed' && (
                    <button 
                      className="complete-btn"
                      onClick={() => handleComplete(task._id)}
                    >
                      ✓ Complete
                    </button>
                  )}
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(task._id)}
                  >
                    ✗ Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Tasks;
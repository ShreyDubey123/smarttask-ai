import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { fetchTasks, createTask, deleteTask, completeTask } from '../services/api';
import './Tasks.css';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: ''
  });
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadTasks();
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

  // Filter and search logic
  const filteredTasks = tasks.filter(task => {
    if (filter !== 'All' && task.priority !== filter) return false;
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
      setActiveTab('dashboard');
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

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'High': return '🔴';
      case 'Medium': return '🟡';
      case 'Low': return '🟢';
      default: return '⚪';
    }
  };

  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }

  return (
    <div className="main-container">
      {/* Vertical Tabs Navigation */}
      <nav className="tabs-nav">
        <div className="nav-header">
          <h2>SmartTask AI</h2>
          <p>Welcome, {user?.name}</p>
        </div>
        
        <button 
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} 
          onClick={() => setActiveTab('dashboard')}
        >
          <div className="tab-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1"></rect>
              <rect x="14" y="3" width="7" height="7" rx="1"></rect>
              <rect x="3" y="14" width="7" height="7" rx="1"></rect>
              <rect x="14" y="14" width="7" height="7" rx="1"></rect>
            </svg>
          </div>
          <div className="tab-text">
            <div className="tab-title">Dashboard</div>
            <div className="tab-subtitle">Overview & Stats</div>
          </div>
          <div className="tab-arrow">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <div className="tab-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div className="tab-text">
            <div className="tab-title">My Tasks</div>
            <div className="tab-subtitle">{stats.pending} Pending</div>
          </div>
          <div className="tab-arrow">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <div className="tab-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </div>
          <div className="tab-text">
            <div className="tab-title">Analytics</div>
            <div className="tab-subtitle">Data Insights</div>
          </div>
          <div className="tab-arrow">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <div className="tab-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </div>
          <div className="tab-text">
            <div className="tab-title">Settings</div>
            <div className="tab-subtitle">Preferences</div>
          </div>
          <div className="tab-arrow">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </button>

        <button className="tab-btn" onClick={handleLogout}>
          <div className="tab-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </div>
          <div className="tab-text">
            <div className="tab-title">Logout</div>
            <div className="tab-subtitle">End Session</div>
          </div>
        </button>
      </nav>

      {/* Tab Content Panels */}
      <div className="tabs-content">
        {/* Dashboard Panel */}
        <div className={`tab-panel ${activeTab === 'dashboard' ? 'active' : ''}`} id="dashboard">
          <div className="panel-header">
            <span className="panel-badge">Overview</span>
            <h1 className="panel-title">Dashboard</h1>
            <p className="panel-description">Welcome back! Here's an overview of your task performance and key statistics.</p>
          </div>
          
          <div className="panel-content">
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total Tasks</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.completed}</div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.pending}</div>
                <div className="stat-label">Pending</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.overdue}</div>
                <div className="stat-label">Overdue</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.highPriority}</div>
                <div className="stat-label">High Priority</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{completionRate}%</div>
                <div className="stat-label">Completion Rate</div>
              </div>
            </div>

            <div className="content-card">
              <div className="card-header">
                <div className="card-icon">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                    <polyline points="17 6 23 6 23 12"></polyline>
                  </svg>
                </div>
                <h3 className="card-title">Task Completion Progress</h3>
              </div>
              
              <div className="progress-bar-container">
                <div className="progress-label">
                  <span>Overall Progress</span>
                  <span>{completionRate}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${completionRate}%` }}></div>
                </div>
              </div>

              <div className="progress-bar-container">
                <div className="progress-label">
                  <span>High Priority Tasks</span>
                  <span>{stats.highPriority}</span>
                </div>
              </div>
            </div>

            <button className="add-task-btn" onClick={() => { setActiveTab('tasks'); setShowForm(true); }}>
              + Create New Task
            </button>
          </div>
        </div>

        {/* Tasks Panel */}
        <div className={`tab-panel ${activeTab === 'tasks' ? 'active' : ''}`} id="tasks">
          <div className="panel-header">
            <span className="panel-badge">Workspace</span>
            <h1 className="panel-title">My Tasks</h1>
            <p className="panel-description">Manage all your tasks efficiently.</p>
          </div>

          <div className="panel-content">
            {/* Search and Filter Bar */}
            <div className="search-filter-bar">
              <div className="search-box">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" strokeWidth="2" width="18" height="18">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              
              <div className="filter-box">
                <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                  <option value="All">All Priorities</option>
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>
            </div>

            {/* Add Task Button */}
            <button className="add-task-btn" onClick={() => setShowForm(!showForm)}>
              {showForm ? '− Cancel' : '+ Add Task'}
            </button>

            {/* Task Form */}
            {showForm && (
              <form className="content-card" onSubmit={handleSubmit}>
                <h3 className="card-title">Create New Task</h3>
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
                <button type="submit" className="add-task-btn">Create Task</button>
              </form>
            )}

            {/* Tasks List */}
            <div className="tasks-list">
              {error && <div className="error-message">{error}</div>}
              
              {filteredTasks.length === 0 ? (
                <div className="content-card">
                  <p className="card-text">
                    {tasks.length === 0 
                      ? "No tasks yet. Create your first task!" 
                      : "No tasks match your filters."}
                  </p>
                </div>
              ) : (
                filteredTasks.map(task => (
                  <div key={task._id} className="content-card">
                    <div className="card-header">
                      <div className="card-icon">
                        <span style={{ fontSize: '20px' }}>{getPriorityIcon(task.priority)}</span>
                      </div>
                      <h3 className="card-title">{task.title}</h3>
                      <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    
                    {task.description && (
                      <p className="card-text">{task.description}</p>
                    )}
                    
                    <div className="task-footer">
                      <div className="task-meta">
                        {task.dueDate && (
                          <span className={`due-date ${new Date(task.dueDate) < new Date() && task.status !== 'Completed' ? 'overdue' : ''}`}>
                            📅 {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        <span className={`status-badge status-${task.status.toLowerCase().replace(' ', '-')}`}>
                          {task.status}
                        </span>
                      </div>
                      
                      <div className="task-actions">
                        {task.status !== 'Completed' && (
                          <button 
                            className="toggle-switch active"
                            style={{ width: 'auto', padding: '0 12px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}
                            onClick={() => handleComplete(task._id)}
                          >
                            ✓ Complete
                          </button>
                        )}
                        <button 
                          className="toggle-switch"
                          style={{ width: 'auto', padding: '0 12px', background: 'rgba(255, 255, 255, 0.1)' }}
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
        </div>

        {/* Analytics Panel */}
        <div className={`tab-panel ${activeTab === 'analytics' ? 'active' : ''}`} id="analytics">
          <div className="panel-header">
            <span className="panel-badge">Insights</span>
            <h1 className="panel-title">Analytics</h1>
            <p className="panel-description">Deep dive into your task data with comprehensive analytics.</p>
          </div>
          
          <div className="panel-content">
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{stats.completed}</div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.pending}</div>
                <div className="stat-label">Pending</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.overdue}</div>
                <div className="stat-label">Overdue</div>
              </div>
            </div>

            <div className="content-card">
              <div className="card-header">
                <div className="card-icon">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <h3 className="card-title">Priority Distribution</h3>
              </div>
              
              <div className="progress-bar-container">
                <div className="progress-label">
                  <span>🔴 High Priority</span>
                  <span>{stats.highPriority}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(stats.highPriority / stats.total * 100) || 0}%`, background: '#dc3545' }}></div>
                </div>
              </div>
              
              <div className="progress-bar-container">
                <div className="progress-label">
                  <span>🟡 Medium Priority</span>
                  <span>{stats.mediumPriority}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(stats.mediumPriority / stats.total * 100) || 0}%`, background: '#ffc107' }}></div>
                </div>
              </div>
              
              <div className="progress-bar-container">
                <div className="progress-label">
                  <span>🟢 Low Priority</span>
                  <span>{stats.lowPriority}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(stats.lowPriority / stats.total * 100) || 0}%`, background: '#28a745' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        <div className={`tab-panel ${activeTab === 'settings' ? 'active' : ''}`} id="settings">
          <div className="panel-header">
            <span className="panel-badge">Configuration</span>
            <h1 className="panel-title">Settings</h1>
            <p className="panel-description">Customize your task management experience.</p>
          </div>
          
          <div className="panel-content">
            <div className="content-card">
              <div className="card-header">
                <div className="card-icon">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                  </svg>
                </div>
                <h3 className="card-title">Preferences</h3>
              </div>
              
              <div className="toggle-group">
                <div className="toggle-item">
                  <div className="toggle-info">
                    <h4>Email Notifications</h4>
                    <p>Get daily task summaries</p>
                  </div>
                  <div className="toggle-switch active" data-toggle="email"></div>
                </div>
                
                <div className="toggle-item">
                  <div className="toggle-info">
                    <h4>Auto Priority</h4>
                    <p>AI-powered task prioritization</p>
                  </div>
                  <div className="toggle-switch active" data-toggle="priority"></div>
                </div>
                
                <div className="toggle-item">
                  <div className="toggle-info">
                    <h4>Due Date Reminders</h4>
                    <p>Get notified before deadlines</p>
                  </div>
                  <div className="toggle-switch active" data-toggle="reminders"></div>
                </div>
              </div>
            </div>

            <div className="content-card">
              <div className="card-header">
                <div className="card-icon">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <h3 className="card-title">Account</h3>
              </div>
              
              <div className="toggle-item">
                <div className="toggle-info">
                  <h4>Logged in as</h4>
                  <p>{user?.email}</p>
                </div>
              </div>
              
              <button className="logout-btn" onClick={handleLogout} style={{ marginTop: '20px' }}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
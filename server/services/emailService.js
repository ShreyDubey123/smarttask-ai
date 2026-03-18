const nodemailer = require('nodemailer');
const Task = require('../models/Task');
const User = require('../models/User');

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send daily task summary to a specific user
const sendDailySummary = async (user) => {
  try {
    // Get user's tasks
    const tasks = await Task.find({ user: user._id });
    
    // Calculate statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
    const overdueTasks = tasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed'
    ).length;
    
    // High priority tasks
    const highPriorityTasks = tasks.filter(t => 
      t.priority === 'High' && t.status !== 'Completed'
    );
    
    // Pending tasks (not completed)
    const pendingTasksList = tasks.filter(t => t.status !== 'Completed');
    
    // Create HTML email content with FULL TASK LIST
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
          .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
          .stat-card { background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .stat-value { font-size: 24px; font-weight: bold; color: #667eea; }
          .task-list { margin-top: 20px; }
          .task-item { background: white; padding: 12px; margin: 8px 0; border-left: 4px solid #667eea; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .task-title { font-weight: bold; color: #333; }
          .task-meta { font-size: 12px; color: #666; margin-top: 5px; display: flex; gap: 10px; }
          .priority-high { border-left-color: #dc3545; background: #fff5f5; }
          .priority-medium { border-left-color: #ffc107; background: #fff9e6; }
          .priority-low { border-left-color: #28a745; background: #f0fff4; }
          .overdue { border-left-color: #dc3545; background: #fff5f5; }
          .completed { opacity: 0.6; text-decoration: line-through; }
          .badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; }
          .badge-high { background: #dc3545; color: white; }
          .badge-medium { background: #ffc107; color: #333; }
          .badge-low { background: #28a745; color: white; }
          .badge-overdue { background: #dc3545; color: white; }
          .badge-pending { background: #ffc107; color: #333; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
          hr { border: none; border-top: 1px solid #ddd; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 SmartTask Daily Summary</h1>
            <p>Hello ${user.name}!</p>
          </div>
          
          <div class="content">
            <h2>Your Task Overview</h2>
            
            <div class="stats">
              <div class="stat-card">
                <div class="stat-value">${totalTasks}</div>
                <div>Total Tasks</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${completedTasks}</div>
                <div>Completed</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${pendingTasks}</div>
                <div>Pending</div>
              </div>
              <div class="stat-card">
                <div class="stat-value ${overdueTasks > 0 ? 'overdue' : ''}">${overdueTasks}</div>
                <div>Overdue</div>
              </div>
            </div>
            
            <div class="progress-bar-container" style="background: #e0e0e0; border-radius: 10px; height: 10px; margin: 20px 0;">
              <div class="progress-bar" style="width: ${totalTasks ? (completedTasks/totalTasks*100) : 0}%; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); height: 10px; border-radius: 10px;"></div>
            </div>
            
            ${highPriorityTasks.length > 0 ? `
              <h3>⚠️ High Priority Tasks</h3>
              <div class="task-list">
                ${highPriorityTasks.map(task => `
                  <div class="task-item priority-high">
                    <div class="task-title">${task.title}</div>
                    <div class="task-meta">
                      <span class="badge badge-high">High</span>
                      ${task.dueDate ? `<span>Due: ${new Date(task.dueDate).toLocaleDateString()}</span>` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            <hr>
            
            <h3>📋 All Your Tasks</h3>
            <div class="task-list">
              ${tasks.length > 0 ? tasks.map(task => `
                <div class="task-item ${task.priority === 'High' ? 'priority-high' : task.priority === 'Medium' ? 'priority-medium' : 'priority-low'} ${task.status === 'Completed' ? 'completed' : ''}">
                  <div class="task-title">
                    ${task.title}
                    ${task.status === 'Completed' ? ' ✓' : ''}
                  </div>
                  <div class="task-meta">
                    <span class="badge ${task.priority === 'High' ? 'badge-high' : task.priority === 'Medium' ? 'badge-medium' : 'badge-low'}">${task.priority}</span>
                    <span class="badge ${task.status === 'Completed' ? 'badge-completed' : task.status === 'Pending' ? 'badge-pending' : 'badge-overdue'}">${task.status}</span>
                    ${task.dueDate ? `<span>📅 ${new Date(task.dueDate).toLocaleDateString()}</span>` : ''}
                  </div>
                  ${task.description ? `<div style="font-size: 12px; color: #666; margin-top: 5px;">${task.description.substring(0, 50)}${task.description.length > 50 ? '...' : ''}</div>` : ''}
                </div>
              `).join('') : `
                <div style="text-align: center; padding: 30px; background: white; border-radius: 8px;">
                  <p>📭 No tasks yet. Create your first task!</p>
                </div>
              `}
            </div>
            
            ${overdueTasks > 0 ? `
              <hr>
              <h3>⏰ Overdue Tasks (${overdueTasks})</h3>
              <div class="task-list">
                ${tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed').map(task => `
                  <div class="task-item overdue">
                    <div class="task-title">${task.title}</div>
                    <div class="task-meta">
                      <span class="badge badge-overdue">Overdue</span>
                      <span>Due: ${new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="http://localhost:3000/tasks" class="button">📊 View All Tasks</a>
            </div>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} SmartTask AI. All rights reserved.</p>
            <p>You're receiving this daily summary because you have tasks in SmartTask.</p>
            <p style="font-size: 10px; color: #999;">To stop receiving these emails, complete all your tasks! 😊</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Send email
    const mailOptions = {
      from: `"SmartTask AI" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `📋 Your SmartTask Daily Summary - ${new Date().toLocaleDateString()}`,
      html: emailHTML
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${user.email}: ${info.messageId}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error sending email to ${user.email}:`, error.message);
    return false;
  }
};

// Send email to all users
const sendDailySummariesToAllUsers = async () => {
  try {
    console.log('📧 Starting daily email notifications...');
    
    // Get all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const user of users) {
      const success = await sendDailySummary(user);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`✅ Daily emails completed: ${successCount} sent, ${failCount} failed`);
    
  } catch (error) {
    console.error('❌ Error in daily email job:', error.message);
  }
};

// Test email for specific user (for testing)
const sendTestEmail = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ User not found');
      return false;
    }
    return await sendDailySummary(user);
  } catch (error) {
    console.error('❌ Error sending test email:', error.message);
    return false;
  }
};

module.exports = {
  sendDailySummary,
  sendDailySummariesToAllUsers,
  sendTestEmail
};
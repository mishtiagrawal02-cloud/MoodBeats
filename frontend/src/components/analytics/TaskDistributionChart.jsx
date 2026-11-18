import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';

const TASK_PALETTE = [
  'var(--workspace-chart-after)', // Neon Purple
  'var(--workspace-chart-deep)', // Electric Violet
  'var(--workspace-chart-sky)', // Soft Lavender
  'var(--workspace-chart-accent)', // Deep Violet
  'var(--workspace-chart-sand)', // Medium Violet
  'var(--workspace-chart-before)', // Dark Violet
  'var(--workspace-chart-before)'  // Muted Grey
];

function CustomTaskTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="analytics-chart-tooltip">
        <p className="tooltip-title">
          <i className="fas fa-book-open"></i> {data.name}
        </p>

        <div className="tooltip-row-item">
          <span className="tooltip-label">Study Time:</span>
          <strong>{data.formattedMinutes} ({data.percentage}%)</strong>
        </div>

        <div className="tooltip-row-item">
          <span className="tooltip-label">Sessions:</span>
          <strong>{data.sessionCount}</strong>
        </div>

        {data.avgFocusChange !== null && (
          <div className="tooltip-row-item">
            <span className="tooltip-label">Avg Focus Shift:</span>
            <span className={`delta-tag ${data.avgFocusChange >= 0 ? 'pos' : 'neg'}`}>
              {data.avgFocusChange > 0 ? `+${data.avgFocusChange}` : data.avgFocusChange} pts
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
}

function TaskDistributionChart({ taskData }) {
  const { taskList = [], mostFrequentTask, totalTasksCount, totalMinutes } = taskData || {};

  const hasData = taskList.length > 0;
  const recordedTaskSessions = taskList.reduce((sum, task) => sum + task.sessionCount, 0);

  return (
    <div className="analytics-panel-card task-distribution-panel">
      <div className="panel-card-header">
        <div>
          <div className="panel-title-row">
            <i className="fas fa-list-check text-gradient"></i>
            <h2 className="panel-title">Task & Subject Allocation</h2>
          </div>
          <p className="panel-subtitle">
            Breakdown of your study blocks by academic domain and task category.
          </p>
        </div>

        {hasData && (
          <div className="header-stat-pill">
            <span className="pill-sub">Categories:</span>
            <span className="pill-val">{totalTasksCount}</span>
          </div>
        )}
      </div>

      <div className="task-content-split">
        {/* Donut Chart */}
        <div className="task-chart-wrapper">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 280, height: 240 }}>
              <PieChart>
                <Pie
                  isAnimationActive={false}
data={taskList}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={taskList.length > 1 ? 3 : 0}
                  dataKey="totalMinutes"
                  nameKey="name"
                  stroke="none"
                >
                  {taskList.map((entry, index) => (
                    <Cell
                      key={`task-cell-${entry.name}`}
                      fill={TASK_PALETTE[index % TASK_PALETTE.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTaskTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty-state">
              <div className="empty-icon-wrap">
                <i className="fas fa-tasks"></i>
              </div>
              <h3 className="empty-heading">No Tasks Logged</h3>
              <p className="empty-desc">
                Select your task type during study sessions to review your subject distribution.
              </p>
            </div>
          )}
        </div>

        {/* Task Details List */}
        {hasData && (
          <div className="task-legend-list">
            {taskList.map((task, idx) => {
              const color = TASK_PALETTE[idx % TASK_PALETTE.length];
              return (
                <div key={task.name} className="task-legend-item">
                  <div className="legend-indicator-col">
                    <span className="legend-swatch" style={{ backgroundColor: color }}></span>
                  </div>

                  <div className="legend-info-col">
                    <div className="legend-name-row">
                      <strong className="legend-task-name">{task.name}</strong>
                      <span className="legend-percent">{task.percentage}%</span>
                    </div>

                    <div className="legend-sub-row">
                      <span>{task.formattedMinutes}</span>
                      <span>•</span>
                      <span>{task.sessionCount} {task.sessionCount === 1 ? 'session' : 'sessions'}</span>
                      {task.avgFocusChange !== null && (
                        <>
                          <span>•</span>
                          <span className={`focus-inline ${task.avgFocusChange >= 0 ? 'pos' : 'neg'}`}>
                            {task.avgFocusChange > 0 ? `+${task.avgFocusChange}` : task.avgFocusChange} pts focus
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {recordedTaskSessions === 1 && (
        <div className="chart-sparse-note">
          <i className="fas fa-circle-info"></i>
          <span>Based on 1 session. This shows the task you logged, not an established subject preference.</span>
        </div>
      )}

      {hasData && mostFrequentTask && (
        <div className="panel-footer-meta">
          <div className="footer-meta-item">
            <span className="meta-k">Primary Task:</span>
            <span className="meta-v">{mostFrequentTask.name} ({mostFrequentTask.percentage}%)</span>
          </div>
          <div className="footer-meta-item">
            <span className="meta-k">Total Study Time:</span>
            <span className="meta-v">{totalMinutes} mins</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskDistributionChart;


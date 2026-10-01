import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Camera,
  Upload,
  Calendar,
  User,
  Paperclip,
  X,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const TaskManager = () => {
  const {
    tasks,
    employees,
    saveTask,
    completeTaskWithProof,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'Pending' | 'In Progress' | 'Completed'
  const [priorityFilter, setPriorityFilter] = useState('ALL'); // 'ALL' | 'High' | 'Medium' | 'Low'
  const [search, setSearch] = useState('');

  // Modals state
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [selectedTaskForProof, setSelectedTaskForProof] = useState(null);

  // New task form state
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    description: '',
    assigneeId: employees[0]?.id || 'EMP-001',
    priority: 'High',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
  });

  // Proof submission form state
  const [proofForm, setProofForm] = useState({
    proofPhoto: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
    completionNotes: '',
  });

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesTab = activeTab === 'ALL' || task.status === activeTab;
    const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;
    const matchesSearch = !search ||
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.assigneeName.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesPriority && matchesSearch;
  });

  const handleCreateTask = (e) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === newTaskData.assigneeId);
    const newTask = {
      id: `TSK-${Date.now().toString().slice(-4)}`,
      title: newTaskData.title,
      description: newTaskData.description,
      department: emp?.department || 'Agents',
      assigneeId: newTaskData.assigneeId,
      assigneeName: emp?.name || 'Staff Member',
      priority: newTaskData.priority,
      status: 'Pending',
      dueDate: newTaskData.dueDate,
      proofPhoto: null,
      completionNotes: null,
      createdAt: new Date().toISOString().split('T')[0],
    };

    saveTask(newTask);
    showToast(`Task assigned to ${newTask.assigneeName}`, 'success');
    setIsNewTaskModalOpen(false);
    setNewTaskData({
      title: '',
      description: '',
      assigneeId: employees[0]?.id || 'EMP-001',
      priority: 'High',
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    });
  };

  const handleOpenProofModal = (task) => {
    setSelectedTaskForProof(task);
    setProofForm({
      proofPhoto: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
      completionNotes: `Successfully completed on ${new Date().toLocaleDateString('en-IN')}. Proof attached.`,
    });
    setIsProofModalOpen(true);
  };

  const handleProofSubmit = (e) => {
    e.preventDefault();
    if (!selectedTaskForProof) return;

    completeTaskWithProof(selectedTaskForProof.id, {
      proofPhoto: proofForm.proofPhoto,
      completionNotes: proofForm.completionNotes,
    });

    showToast(`Task marked Completed with proof photo! 🎉`, 'success');
    setIsProofModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Actions */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Work & Task Management
            </h2>
            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
              {tasks.filter(t => t.status !== 'Completed').length} Open
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Assign business deliverables, track due dates, and verify field photo proof upon completion.
          </p>
        </div>

        <button
          onClick={() => setIsNewTaskModalOpen(true)}
          className="bg-slate-950 hover:bg-black text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-full flex items-center gap-2 transition active:scale-95 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Assign New Task</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto text-xs font-bold">
          {[
            { id: 'ALL', label: 'All Tasks', count: tasks.length },
            { id: 'Pending', label: 'Pending', count: tasks.filter(t => t.status === 'Pending').length },
            { id: 'In Progress', label: 'In Progress', count: tasks.filter(t => t.status === 'In Progress').length },
            { id: 'Completed', label: 'Completed', count: tasks.filter(t => t.status === 'Completed').length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                activeTab === tab.id
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 rounded-full ${activeTab === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Priority Filter & Search */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-hidden"
          >
            <option value="ALL">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks or assignees..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-hidden focus:border-blue-500 font-medium text-slate-800"
            />
          </div>
        </div>

      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map(task => {
          const emp = employees.find(e => e.id === task.assigneeId);
          const isDone = task.status === 'Completed';

          const priorityBadge = {
            High: 'bg-rose-50 text-rose-700 border-rose-200',
            Medium: 'bg-amber-50 text-amber-700 border-amber-200',
            Low: 'bg-blue-50 text-blue-700 border-blue-200',
          }[task.priority] || 'bg-slate-50 text-slate-700 border-slate-200';

          return (
            <div
              key={task.id}
              className={`bg-white rounded-3xl p-5 border shadow-xs space-y-4 flex flex-col justify-between transition hover:shadow-md ${
                isDone ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
              }`}
            >
              <div className="space-y-3">
                {/* Header: Priority & Status */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${priorityBadge}`}>
                    {task.priority} Priority
                  </span>

                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    task.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : task.status === 'In Progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {task.status === 'Completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    {task.status === 'In Progress' && <Clock className="w-3.5 h-3.5 text-blue-600" />}
                    <span>{task.status}</span>
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className={`font-bold text-sm sm:text-base text-slate-900 ${isDone ? 'line-through text-slate-500' : ''}`}>
                    {task.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>
                </div>
              </div>

              {/* Assignee & Due Date Footer */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  {/* Assignee Info */}
                  <div className="flex items-center gap-2">
                    <img
                      src={emp?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                      alt={task.assigneeName}
                      className="w-6 h-6 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="font-bold text-slate-800 text-[11px] leading-tight">{task.assigneeName}</div>
                      <div className="text-[10px] text-slate-400">{task.department || emp?.department}</div>
                    </div>
                  </div>

                  {/* Due Date */}
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{task.dueDate}</span>
                  </div>
                </div>

                {/* Proof Thumbnail or Submit Proof Button */}
                {task.proofPhoto ? (
                  <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={task.proofPhoto}
                        alt="Completion proof"
                        className="w-10 h-10 rounded-lg object-cover border border-emerald-300 shadow-xs cursor-pointer hover:scale-105 transition"
                        onClick={() => window.open(task.proofPhoto, '_blank')}
                      />
                      <div className="text-left">
                        <div className="text-[10px] font-black uppercase text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Proof Verified</span>
                        </div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">{task.completionNotes || 'Photo evidence attached'}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                      Done
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleOpenProofModal(task)}
                    className="w-full py-2 rounded-xl font-bold text-xs bg-slate-900 hover:bg-black text-white flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
                  >
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>Submit Proof & Mark Done</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
          <CheckSquare className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="font-bold text-slate-700 text-sm">No tasks found</h4>
          <p className="text-xs text-slate-400">Try changing your filters or assign a new task to staff.</p>
        </div>
      )}

      {/* Modal: Assign New Task */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 relative border border-slate-100">
            <button
              onClick={() => setIsNewTaskModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Assign Deliverable Task</h3>
              <p className="text-xs text-slate-500">Create an operational task with a deadline and priority level.</p>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTaskData.title}
                  onChange={(e) => setNewTaskData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Submit GST returns for Q2"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description & Instructions</label>
                <textarea
                  rows={2}
                  value={newTaskData.description}
                  onChange={(e) => setNewTaskData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Specific details, file attachments or client addresses..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assignee</label>
                  <select
                    value={newTaskData.assigneeId}
                    onChange={(e) => setNewTaskData(prev => ({ ...prev, assigneeId: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 bg-white outline-hidden focus:border-blue-500"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newTaskData.priority}
                    onChange={(e) => setNewTaskData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 bg-white outline-hidden focus:border-blue-500"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={newTaskData.dueDate}
                  onChange={(e) => setNewTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-slate-950 hover:bg-black text-white font-bold py-3 rounded-full transition shadow-md active:scale-95"
                >
                  Confirm & Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Submit Proof & Mark Done */}
      {isProofModalOpen && selectedTaskForProof && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 relative border border-slate-100">
            <button
              onClick={() => setIsProofModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Task Completion
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Submit Photo Evidence
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Task: <span className="font-bold text-slate-900">{selectedTaskForProof.title}</span>
              </p>
            </div>

            <form onSubmit={handleProofSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Attached Photo Evidence</label>
                <div className="border border-slate-200 rounded-2xl p-2.5 flex items-center gap-3 bg-slate-50/60">
                  <img
                    src={proofForm.proofPhoto}
                    alt="Proof snapshot"
                    className="w-16 h-16 rounded-xl object-cover border border-slate-300 shadow-xs"
                  />
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-slate-800">Field Receipt / Document Snapshot</div>
                    <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Ready for upload</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Completion Notes / Remarks</label>
                <textarea
                  rows={3}
                  required
                  value={proofForm.completionNotes}
                  onChange={(e) => setProofForm(prev => ({ ...prev, completionNotes: e.target.value }))}
                  placeholder="e.g. Challan payment made via SBI corporate banking. Reference No: 20261002981..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-full transition shadow-md shadow-emerald-500/20 active:scale-95"
                >
                  Verify & Mark Completed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

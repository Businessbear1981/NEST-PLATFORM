"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, CheckCircle, Clock, AlertCircle, Zap } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'working' | 'completed';
  progress: number;
  currentTask?: string;
  tasksCompleted: number;
}

interface Task {
  id: string;
  name: string;
  assignedAgent: string;
  status: 'pending' | 'in-progress' | 'completed';
  progress: number;
}

export function AnimatedAgentPlatform() {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'vector',
      name: 'Vector',
      role: 'Call/Put Radar',
      status: 'idle',
      progress: 0,
      tasksCompleted: 24,
    },
    {
      id: 'merlin',
      name: 'Merlin',
      role: 'M&A Locator',
      status: 'working',
      progress: 45,
      currentTask: 'Scanning target universe',
      tasksCompleted: 18,
    },
    {
      id: 'morgan',
      name: 'Morgan',
      role: 'Content Studio',
      status: 'working',
      progress: 72,
      currentTask: 'Drafting executive summary',
      tasksCompleted: 31,
    },
    {
      id: 'sterling',
      name: 'Sterling',
      role: 'Placement Engine',
      status: 'idle',
      progress: 0,
      tasksCompleted: 19,
    },
    {
      id: 'sentinel',
      name: 'Sentinel',
      role: 'Covenant Monitor',
      status: 'working',
      progress: 28,
      currentTask: 'Checking covenant compliance',
      tasksCompleted: 42,
    },
    {
      id: 'suretyScout',
      name: 'SuretyScout',
      role: 'Insurance Matcher',
      status: 'completed',
      progress: 100,
      currentTask: 'Surety packet prepared',
      tasksCompleted: 15,
    },
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    { id: 'task-1', name: 'Bond pricing analysis', assignedAgent: 'vector', status: 'completed', progress: 100 },
    { id: 'task-2', name: 'M&A target screening', assignedAgent: 'merlin', status: 'in-progress', progress: 45 },
    { id: 'task-3', name: 'Investor summary', assignedAgent: 'morgan', status: 'in-progress', progress: 72 },
    { id: 'task-4', name: 'Covenant breach detection', assignedAgent: 'sentinel', status: 'in-progress', progress: 28 },
    { id: 'task-5', name: 'Surety packet assembly', assignedAgent: 'suretyScout', status: 'completed', progress: 100 },
  ]);

  // Simulate agent activity
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev =>
        prev.map(agent => {
          if (agent.status === 'working') {
            const newProgress = agent.progress + Math.random() * 15;
            if (newProgress >= 100) {
              return {
                ...agent,
                status: 'completed',
                progress: 100,
                tasksCompleted: agent.tasksCompleted + 1,
              };
            }
            return { ...agent, progress: newProgress };
          } else if (agent.status === 'completed' && Math.random() > 0.6) {
            // Agent picks up a new task
            return {
              ...agent,
              status: 'working',
              progress: 0,
              currentTask: `Processing task ${Math.floor(Math.random() * 100)}`,
            };
          }
          return agent;
        })
      );

      setTasks(prev =>
        prev.map(task => {
          const agent = agents.find(a => a.id === task.assignedAgent);
          if (agent && agent.status === 'working') {
            const newProgress = task.progress + Math.random() * 10;
            if (newProgress >= 100) {
              return { ...task, status: 'completed', progress: 100 };
            }
            return { ...task, status: 'in-progress', progress: newProgress };
          }
          return task;
        })
      );
    }, 1500);

    return () => clearInterval(interval);
  }, [agents]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-emerald-400" size={20} />;
      case 'working':
        return <Zap className="text-cyan-400" size={20} />;
      case 'idle':
        return <Clock className="text-gray-400" size={20} />;
      default:
        return <AlertCircle className="text-amber-400" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-emerald-400/30 bg-emerald-400/5';
      case 'working':
        return 'border-cyan-400/30 bg-cyan-400/5';
      case 'idle':
        return 'border-gray-400/20 bg-gray-400/5';
      default:
        return 'border-amber-400/20 bg-amber-400/5';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-400';
      case 'working':
        return 'bg-cyan-400';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6 p-6 bg-black/40 rounded-lg border border-cyan-400/20">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-cyan-300">AGENT PLATFORM</h2>
        <p className="text-sm text-cyan-200/60">Live Task Execution · Real-time Agent Fleet</p>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-2 gap-4">
        {agents.map((agent, i) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-4 border rounded-lg ${getStatusColor(agent.status)}`}
          >
            {/* Agent Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={agent.status === 'working' ? { rotate: 360 } : {}}
                  transition={agent.status === 'working' ? { duration: 2, repeat: Infinity } : {}}
                >
                  <Bot className="text-cyan-400" size={20} />
                </motion.div>
                <div>
                  <p className="font-semibold text-cyan-300">{agent.name}</p>
                  <p className="text-xs text-cyan-200/60">{agent.role}</p>
                </div>
              </div>
              <motion.div
                animate={agent.status === 'working' ? { scale: [1, 1.2, 1] } : {}}
                transition={agent.status === 'working' ? { duration: 1.5, repeat: Infinity } : {}}
              >
                {getStatusIcon(agent.status)}
              </motion.div>
            </div>

            {/* Current Task */}
            {agent.currentTask && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-cyan-200/70 mb-3 italic"
              >
                {agent.currentTask}
              </motion.p>
            )}

            {/* Progress Bar */}
            {agent.status !== 'idle' && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-cyan-300 font-mono">PROGRESS</p>
                  <motion.p
                    key={`${agent.id}-progress`}
                    className="text-xs font-mono text-cyan-400"
                  >
                    {Math.round(agent.progress)}%
                  </motion.p>
                </div>
                <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-cyan-400/20">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${agent.progress}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full ${getProgressColor(agent.status)}`}
                  />
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between text-xs">
              <p className="text-gray-400">
                <span className="font-semibold text-cyan-300">{agent.tasksCompleted}</span> tasks completed
              </p>
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`font-semibold ${
                  agent.status === 'completed'
                    ? 'text-emerald-400'
                    : agent.status === 'working'
                      ? 'text-cyan-400'
                      : 'text-gray-400'
                }`}
              >
                {agent.status.toUpperCase()}
              </motion.p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Active Tasks */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-cyan-300">ACTIVE TASK QUEUE</h3>
        <div className="space-y-2">
          {tasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-3 bg-black/30 border border-cyan-400/20 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-cyan-300">{task.name}</p>
                <motion.p
                  key={`${task.id}-progress`}
                  className="text-xs font-mono text-cyan-400"
                >
                  {Math.round(task.progress)}%
                </motion.p>
              </div>
              <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-cyan-400/20">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${task.progress}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-full ${getProgressColor(task.status)}`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-cyan-400/10">
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="p-3 bg-cyan-400/5 border border-cyan-400/20 rounded text-center"
        >
          <p className="text-xs text-cyan-300 font-semibold">AGENTS ACTIVE</p>
          <motion.p
            key={`active-${agents.filter(a => a.status === 'working').length}`}
            className="text-lg font-bold text-cyan-400"
          >
            {agents.filter(a => a.status === 'working').length}/{agents.length}
          </motion.p>
        </motion.div>

        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="p-3 bg-emerald-400/5 border border-emerald-400/20 rounded text-center"
        >
          <p className="text-xs text-emerald-300 font-semibold">TASKS DONE</p>
          <motion.p
            key={`completed-${tasks.filter(t => t.status === 'completed').length}`}
            className="text-lg font-bold text-emerald-400"
          >
            {tasks.filter(t => t.status === 'completed').length}/{tasks.length}
          </motion.p>
        </motion.div>

        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="p-3 bg-amber-400/5 border border-amber-400/20 rounded text-center"
        >
          <p className="text-xs text-amber-300 font-semibold">THROUGHPUT</p>
          <motion.p
            key={`throughput-${Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length)}`}
            className="text-lg font-bold text-amber-400"
          >
            {Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length)}%
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

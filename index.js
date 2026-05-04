
```javascript
import Anthropic from "@anthropic-ai/sdk";
import * as readline from "readline";

const client = new Anthropic();

// Data storage for habits
const habits = {};
const habitLogs = {};

// Conversation history for multi-turn conversation
const conversationHistory = [];

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to get user input
function getUserInput(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

// Initialize sample habits
function initializeSampleHabits() {
  habits["Exercise"] = {
    name: "Exercise",
    description: "Daily physical activity",
    target: "30 minutes",
    createdDate: new Date("2024-01-01"),
  };
  habits["Meditation"] = {
    name: "Meditation",
    description: "Daily meditation practice",
    target: "10 minutes",
    createdDate: new Date("2024-01-05"),
  };
  habits["Reading"] = {
    name: "Reading",
    description: "Daily reading",
    target: "1 hour",
    createdDate: new Date("2024-01-10"),
  };
  habits["Sleep"] = {
    name: "Sleep",
    description: "Get adequate sleep",
    target: "8 hours",
    createdDate: new Date("2024-01-15"),
  };

  // Initialize logs with sample data
  habitLogs["Exercise"] = [
    { date: "2024-01-15", completed: true, duration: "35 minutes" },
    { date: "2024-01-14", completed: true, duration: "30 minutes" },
    { date: "2024-01-13", completed: false, duration: "" },
    { date: "2024-01-12", completed: true, duration: "40 minutes" },
    { date: "2024-01-11", completed: true, duration: "30 minutes" },
  ];

  habitLogs["Meditation"] = [
    { date: "2024-01-15", completed: true, duration: "12 minutes" },
    { date: "2024-01-14", completed: true, duration: "10 minutes" },
    { date: "2024-01-13", completed: true, duration: "10 minutes" },
    { date: "2024-01-12", completed: false, duration: "" },
    { date: "2024-01-11", completed: true, duration: "15 minutes" },
  ];

  habitLogs["Reading"] = [
    { date: "2024-01-15", completed: true, duration: "1.5 hours" },
    { date: "2024-01-14", completed: false, duration: "" },
    { date: "2024-01-13", completed: true, duration: "1 hour" },
    { date: "2024-01-12", completed: true, duration: "1.2 hours" },
    { date: "2024-01-11", completed: false, duration: "" },
  ];

  habitLogs["Sleep"] = [
    { date: "2024-01-15", completed: true, duration: "8 hours" },
    { date: "2024-01-14", completed: true, duration: "7.5 hours" },
    { date: "2024-01-13", completed: true, duration: "8.5 hours" },
    { date: "2024-01-12", completed: false, duration: "6 hours" },
    { date: "2024-01-11", completed: true, duration: "8 hours" },
  ];
}

// Calculate statistics for a habit
function calculateStatistics(habitName) {
  const logs = habitLogs[habitName] || [];
  if (logs.length === 0) {
    return {
      totalDays: 0,
      completedDays: 0,
      completionRate: 0,
      streak: 0,
      averageDuration: "N/A",
    };
  }

  const completedDays = logs.filter((log) => log.completed).length;
  const completionRate = Math.round((completedDays / logs.length) * 100);

  // Calculate streak (consecutive completed days from most recent)
  let streak = 0;
  for (let i = 0; i < logs.length; i++) {
    if (logs[i].completed) {
      streak++;
    } else {
      break;
    }
  }

  return {
    totalDays: logs.length,
    completedDays: completedDays,
    completionRate: completionRate,
    streak: streak,
  };
}

// Format habit data for Claude
function formatHabitsForClaude() {
  let habitData = "Current Habits and Statistics:\n\n";

  for (const habitName in habits) {
    const habit = habits[habitName];
    const stats = calculateStatistics(habitName);
    const logs = habitLogs[habitName] || [];

    habitData += `**${habitName}**\n`;
    habitData += `- Description: ${habit.description}\n`;
    habitData += `- Target: ${habit.target}\n`;
    habitData += `- Created: ${habit.createdDate.toLocaleDateString()}\n`;
    habitData += `- Total logged days: ${stats.totalDays}\n`;
    habitData += `- Completed days: ${stats.completedDays}\n`;
    habitData += `- Completion rate: ${stats.completionRate}%\n`;
    habitData += `- Current streak: ${stats.streak} days\n`;
    habitData += `- Recent logs: ${JSON.stringify(logs.slice(0, 3))}\n\n`;
  }

  return habitData;
}

// Process Claude's response and update data if needed
function processClaudeResponse(response)
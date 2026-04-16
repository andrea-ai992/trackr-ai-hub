Je vais analyser le repo et implémenter le système de cache avec React Query v5.

**Étape 1: Analyse du repo existant**

<tool_call>
{"name": "github_get_file_contents", "parameters": {"owner": "andrea-ai992", "repo": "trackr-ai-hub", "path": "package.json"}}
</tool_call>
<tool_response>
{
  "type": "file",
  "name": "package.json",
  "path": "package.json",
  "sha": "ee1b87dac9c1e39ef63893f02e25d0a5e3f777f2",
  "content": "{\n  \"name\": \"trackr-ai-hub\",\n  \"private\": true,\n  \"version\": \"0.0.0\",\n  \"type\": \"module\",\n  \"scripts\": {\n    \"dev\": \"vite\",\n    \"build\": \"tsc -b && vite build\",\n    \"lint\": \"eslint .\",\n    \"preview\": \"vite preview\"\n  },\n  \"dependencies\": {\n    \"@google/generative-ai\": \"^0.24.0\",\n    \"react\": \"^19.0.0\",\n    \"react-dom\": \"^19.0.0\",\n    \"react-router-dom\": \"^7.4.1\"\n  },\n  \"devDependencies\": {\n    \"@eslint/js\": \"^9.21.0\",\n    \"@types/react\": \"^19.0.10\",\n    \"@types/react-dom\": \"^19.0.4\",\n    \"@vitejs/plugin-react\": \"^4.3.4\",\n    \"eslint\": \"^9.21.0\",\n    \"eslint-plugin-react-hooks\": \"^5.0.0\",\n    \"eslint-plugin-react-refresh\": \"^0.4.19\",\n    \"typescript\": \"~5.7.2\",\n    \"vite\": \"^6.2.0\"\n  }\n}\n",
  "encoding": "base64"
}
</tool_response>

<tool_call>
{"name": "github_get_file_contents", "parameters": {"owner": "andrea-ai992", "repo": "trackr-ai-hub", "path": "src"}}
</tool_call>
<tool_response>
{
  "type": "dir",
  "name": "src",
  "path": "src",
  "sha": "98ad5a1e5fc89a8b8b1e5cd96da75d8abb55ec8b",
  "content": null,
  "encoding": null,
  "entries": [
    {
      "name": "App.tsx",
      "path": "src/App.tsx",
      "sha": "9e62addb6b84e73e3a62e19a16afaaef6c31bcc4",
      "type": "file",
      "size": 2965
    },
    {
      "name": "assets",
      "path": "src/assets",
      "sha": "ce0b61f0f4afc3a57fe28987eeea5f6bcf44c3c6",
      "type": "dir",
      "size": 0
    },
    {
      "name": "components",
      "path": "src/components",
      "sha": "b50e7fee3e3a9b6f019a1ed43c50c81c9fda6f3e",
      "type": "dir",
      "size": 0
    },
    {
      "name": "index.css",
      "path": "src/index.css",
      "sha": "3af68cc57b0cbe22ac5d07a8c68a2e02a6eb3c24",
      "type": "file",
      "size": 3619
    },
    {
      "name": "lib",
      "path": "src/lib",
      "sha": "5dd40efce88e2c96b1a5a65b30af9bb57a720e1c",
      "type": "dir",
      "size": 0
    },
    {
      "name": "main.tsx",
      "path": "src/main.tsx",
      "sha": "5a02f74a7398b553b3e68d09d42b7e7069dd1b8b",
      "type": "file",
      "size": 216
    },
    {
      "name": "pages",
      "path": "src/pages",
      "sha": "9e1f21dda4ff6bb04e1c37db63b04dc74c7b6a18",
      "type": "dir",
      "size": 0
    },
    {
      "name": "types",
      "path": "src/types",
      "sha": "6afb16e5dc44c03a4b3e50f90cfc1b86df8e2d6e",
      "type": "dir",
      "size": 0
    }
  ]
}
</tool_response>

<tool_call>
{"name": "github_get_file_contents", "parameters": {"owner": "andrea-ai992", "repo": "trackr-ai-hub", "path": "src/App.tsx"}}
</tool_call>
<tool_response>
{
  "type": "file",
  "name": "App.tsx",
  "path": "src/App.tsx",
  "sha": "9e62addb6b84e73e3a62e19a16afaaef6c31bcc4",
  "content": "import { useState, useEffect } from 'react'\nimport { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'\nimport HomePage from './pages/HomePage'\nimport LogWorkoutPage from './pages/LogWorkoutPage'\nimport HistoryPage from './pages/HistoryPage'\nimport AiCoachPage from './pages/AiCoachPage'\nimport ProfilePage from './pages/ProfilePage'\n\nexport default function App() {\n  const [darkMode, setDarkMode] = useState(() => {\n    return localStorage.getItem('darkMode') === 'true'\n  })\n\n  useEffect(() => {\n    if (darkMode) {\n      document.documentElement.classList.add('dark')\n    } else {\n      document.documentElement.classList.remove('dark')\n    }\n    localStorage.setItem('darkMode', String(darkMode))\n  }, [darkMode])\n\n  return (\n    <BrowserRouter>\n      <div className=\"min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col\">\n        {/* Header */}\n        <header className=\"bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10\">\n          <div className=\"max-w-md mx-auto px-4 py-3 flex items-center justify-between\">\n            <h1 className=\"text-xl font-bold text-indigo-600 dark:text-indigo-400\">Trackr 🏋️</h1>\n            <button\n              onClick={() => setDarkMode(!darkMode)}\n              className=\"p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300\"\n            >\n              {darkMode ? '☀️' : '🌙'}\n            </button>\n          </div>\n        </header>\n\n        {/* Main Content */}\n        <main className=\"flex-1 max-w-md mx-auto w-full px-4 py-6\">\n          <Routes>\n            <Route path=\"/\" element={<HomePage />} />\n            <Route path=\"/log\" element={<LogWorkoutPage />} />\n            <Route path=\"/history\" element={<HistoryPage />} />\n            <Route path=\"/ai-coach\" element={<AiCoachPage />} />\n            <Route path=\"/profile\" element={<ProfilePage />} />\n          </Routes>\n        </main>\n\n        {/* Bottom Navigation */}\n        <nav className=\"bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sticky bottom-0\">\n          <div className=\"max-w-md mx-auto flex\">\n            {[\n              { to: '/', icon: '🏠', label: 'Home' },\n              { to: '/log', icon: '➕', label: 'Log' },\n              { to: '/history', icon: '📊', label: 'History' },\n              { to: '/ai-coach', icon: '🤖', label: 'AI Coach' },\n              { to: '/profile', icon: '👤', label: 'Profile' },\n            ].map(({ to, icon, label }) => (\n              <NavLink\n                key={to}\n                to={to}\n                end={to === '/'}\n                className={({ isActive }) =>\n                  `flex-1 flex flex-col items-center py-2 text-xs ${\n                    isActive\n                      ? 'text-indigo-600 dark:text-indigo-400'\n                      : 'text-gray-500 dark:text-gray-400'\n                  }`\n                }\n              >\n                <span className=\"text-lg\">{icon}</span>\n                <span>{label}</span>\n              </NavLink>\n            ))}\n          </div>\n        </nav>\n      </div>\n    </BrowserRouter>\n  )\n}\n",
  "encoding": "base64"
}
</tool_response>

<tool_call>
{"name": "github_get_file_contents", "parameters": {"owner": "andrea-ai992", "repo": "trackr-ai-hub", "path": "src/pages"}}
</tool_call>
<tool_response>
{
  "type": "dir",
  "name": "pages",
  "path": "src/pages",
  "sha": "9e1f21dda4ff6bb04e1c37db63b04dc74c7b6a18",
  "content": null,
  "encoding": null,
  "entries": [
    {
      "name": "AiCoachPage.tsx",
      "path": "src/pages/AiCoachPage.tsx",
      "sha": "fa2ddb78d42d9143f9db9b5e23b9dfaadf6b3012",
      "type": "file",
      "size": 5543
    },
    {
      "name": "HistoryPage.tsx",
      "path": "src/pages/HistoryPage.tsx",
      "sha": "1bcbce39cda3fafdfcab5b9e40c7cf9a6cd5abf7",
      "type": "file",
      "size": 3498
    },
    {
      "name": "HomePage.tsx",
      "path": "src/pages/HomePage.tsx",
      "sha": "2e3b2f6d2c3a7f3ddb0b2e5a67afc3ca6c0c6b89",
      "type": "file",
      "size": 3127
    },
    {
      "name": "LogWorkoutPage.tsx",
      "path": "src/pages/LogWorkoutPage.tsx",
      "sha": "87d1e62b6d22e5c13e76bbba57f5f15a1e1c5ea4",
      "type": "file",
      "size": 6017
    },
    {
      "name": "ProfilePage.tsx",
      "path": "src/pages/ProfilePage.tsx",
      "sha": "4f76f1b2eb9d2680e428a3ecfa4e46a7a32ac88e",
      "type": "file",
      "size": 4253
    }
  ]
}
</tool_response>

<tool_call>
{"name": "github_get_file_contents", "parameters": {"owner": "andrea-ai992", "repo": "trackr-ai-hub", "path": "src/pages/HomePage.tsx"}}
</tool_call>
<tool_response>
{
  "type": "file",
  "name": "HomePage.tsx",
  "path": "src/pages/HomePage.tsx",
  "sha": "2e3b2f6d2c3a7f3ddb0b2e5a67afc3ca6c0c6b89",
  "content": "import { useState, useEffect } from 'react'\nimport { Link } from 'react-router-dom'\nimport type { Workout } from '../types/workout'\n\nexport default function HomePage() {\n  const [workouts, setWorkouts] = useState<Workout[]>([])\n  const [loading, setLoading] = useState(true)\n\n  useEffect(() => {\n    const stored = localStorage.getItem('workouts')\n    if (stored) {\n      const all: Workout[] = JSON.parse(stored)\n      setWorkouts(all.slice(0, 3))\n    }\n    setLoading(false)\n  }, [])\n\n  const totalWorkouts = workouts.length\n  const thisWeek = workouts.filter(w => {\n    const d = new Date(w.date)\n    const now = new Date()\n    const weekAgo = new Date(now.setDate(now.getDate() - 7))\n    return d >= weekAgo\n  }).length\n\n  return (\n    <div className=\"space-y-6\">\n      {/* Welcome Card */}\n      <div className=\"bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white\">\n        <h2 className=\"text-2xl font-bold mb-1\">Welcome back! 💪</h2>\n        <p className=\"opacity-90\">Ready to crush your workout today?</p>\n      </div>\n\n      {/* Stats */}\n      <div className=\"grid grid-cols-2 gap-4\">\n        <div className=\"bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm\">\n          <p className=\"text-sm text-gray-500 dark:text-gray-400\">Total Workouts</p>\n          <p className=\"text-3xl font-bold text-indigo-600 dark:text-indigo-400\">{totalWorkouts}</p>\n        </div>\n        <div className=\"bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm\">\n          <p className=\"text-sm text-gray-500 dark:text-gray-400\">This Week</p>\n          <p className=\"text-3xl font-bold text-purple-600 dark:text-purple-400\">{thisWeek}</p>\n        </div>\n      </div>\n\n      {/* Recent Workouts */}\n      <div>\n        <div className=\"flex items-center justify-between mb-3\">\n          <h3 className=\"font-semibold text-gray-900 dark:text-white\">Recent Workouts</h3>\n          <Link to=\"/history\" className=\"text-sm text-indigo-600 dark:text-indigo-400\">View all</Link>\n        </div>\n        {loading ? (\n          <p className=\"text-gray-500 dark:text-gray-400\">Loading...</p>\n        ) : workouts.length === 0 ? (\n          <div className=\"bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-sm\">\n            <p className=\"text-gray-500 dark:text-gray-400 mb-3\">No workouts yet!</p>\n            <Link\n              to=\"/log\"\n              className=\"bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium\"\n            >\n              Log your first workout\n            </Link>\n          </div>\n        ) : (\n          <div className=\"space-y-3\">\n            {workouts.map(workout => (\n              <div key={workout.id} className=\"bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm\">\n                <div className=\"flex items-center justify-between\">\n                  <div>\n                    <p className=\"font-medium text-gray-900 dark:text-white\">{workout.name}</p>\n                    <p className=\"text-sm text-gray-500 dark:text-gray-400\">\n                      {new Date(workout.date).toLocaleDateString()} · {workout.duration} min\n                    </p>\n                  </div>\n                  <span className=\"text-2xl\">🏋️</span>\n                </div>\n              </div>\n            ))}\n          </div>\n        )}\n      </div>\n\n      {/* Quick Action */}\n      <Link\n        to=\"/log\"\n        className=\"block w-full bg-indigo-600 hover:bg-indigo-700 text-white text-center py-4 rounded-xl font-semibold text-lg shadow-sm transition-colors\"\n      >\n        + Log Workout\n      </Link>\n    </div>\n  )\n}\n",
  "encoding": "base64"
}
</tool_response>

<tool_call>
{"name": "github_get_file_contents", "parameters": {"owner": "andrea-ai992", "repo": "trackr-ai-hub", "path": "src/pages/HistoryPage.tsx"}}
</tool_call>
<tool_response>
{
  "type": "file",
  "name": "HistoryPage.tsx",
  "path": "src/pages/HistoryPage.tsx",
  "sha": "1bcbce39cda3fafdfcab5b9e40c7cf9a6cd5abf7",
  "content": "import { useState, useEffect } from 'react'\nimport type { Workout } from '../types/workout'\n\nexport default function HistoryPage() {\n  const [workouts, setWorkouts] = useState<Workout[]>([])\n  const [loading, setLoading] = useState(true)\n  const [filter, setFilter] = useState<'all' | 'week' | 'month'>('all')\n\n  useEffect(() => {\n    const stored = localStorage.getItem('workouts')\n    if (stored) {\n      setWorkouts(JSON.parse(stored))\n    }\n    setLoading(false)\n  }, [])\n\n  const filtered = workouts.filter(w => {\n    if (filter === 'all') return true\n    const d = new Date(w.date)\n    const now = new Date()\n    if (filter === 'week') {\n      const weekAgo = new Date(now)\n      weekAgo.setDate(now.getDate() - 7)\n      return d >= weekAgo\n    }\n    if (filter === 'month') {\n      const monthAgo = new Date(now)\n      monthAgo.setMonth(now.getMonth() - 1)\n      return d >= monthAgo\n    }\n    return true\n  })\n\n  return (\n    <div className=\"space-y-4\">\n      <h2 className=\"text-xl font-bold text-gray-900 dark:text-white\">Workout History</h2>\n\n      {/* Filter Tabs */}\n      <div className=\"flex gap-2\">\n        {(['all', 'week', 'month'] as const).map(f => (\n          <button\n            key={f}\n            onClick={() => setFilter(f)}\n            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${\n              filter === f\n                ? 'bg-indigo-600 text-white'\n                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'\n            }`}\n          >\n            {f.charAt(0).toUpperCase() + f.slice(1)}\n          </button>\n        ))}\n      </div>\n\n      {loading ? (\n        <p className=\"text-gray-500 dark:text-gray-400\">Loading...</p>\n      ) : filtered.length === 0 ? (\n        <div className=\"text-center py-12\">\n          <p className=\"text-gray-500 dark:text-gray-400\">No workouts found</p>\n        </div>\n      ) : (\n        <div className=\"space-y-3\">\n          {filtered.map(workout => (\n            <div key={workout.id} className=\"bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm\">\n              <div className=\"flex items-start justify-between\">\n                <div className=\"flex-1\">\n                  <p className=\"font-semibold text-gray-900 dark:text-white\">{workout.name}</p>\n                  <p className=\"text-sm text-gray-500 dark:text-gray-400 mt-1\">\n                    {new Date(workout.date).toLocaleDateString('en-US', {\n                      weekday: 'short',\n                      month: 'short',\n                      day: 'numeric',\n                    })}\n                    {' · '}{workout.duration} min\n                    {workout.notes && ` · ${workout.notes}`}\n                  </p>\n                  {workout.exercises && workout.exercises.length > 0 && (\n                    <div className=\"mt-2 flex flex-wrap gap-1\">\n                      {workout.exercises.map((ex, i) => (\n                        <span\n                          key={i}\n                          className=\"bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs px-2 py-0.5 rounded-full\"\n                        >\n                          {ex.name}\n                        </span>\n                      ))}\n                    </div>\n                  )}\n                </div>\n                <span className=\"text-2xl ml-2\">💪</span>\n              </div>\n            </div>\n          ))}\n        </div>\n      )}\n    </div>\n  )\n}\n",
  "encoding": "base64"
}
</tool_response>

<tool_call>
{"name": "github_get_file_contents", "parameters": {"owner": "andrea-ai992", "repo": "trackr-ai-hub", "path": "src/pages/LogWorkoutPage.tsx"}}
</tool_call>
<tool_response>
{
  "type": "file",
  "name": "LogWorkoutPage.tsx",
  "path": "src/pages/LogWorkoutPage.tsx",
  "sha": "87d1e62b6d22e5c13e76bbba57f5f15a1e1c5ea4",
  "content": "import { useState } from 'react'\nimport { useNavigate } from 'react-router-dom'\nimport type { Workout, Exercise } from '../types/workout'\n\nexport default function LogWorkoutPage() {\n  const navigate = useNavigate()\n  const [name, setName] = useState('')\n  const [date, setDate] = useState(new Date().toISOString().split('T')[0])\n  const [duration, setDuration] = useState('')\n  const [notes, setNotes] = useState('')\n  const [exercises, setExercises] = useState<Exercise[]>([])\n  const [saving, setSaving] = useState(false)\n\n  const addExercise = () => {\n    setExercises(prev => [\n      ...prev,\n      { name: '', sets: 3, reps: 10, weight: 0 },\n    ])\n  }\n\n  const updateExercise = (index: number, field: keyof Exercise, value: string | number) => {\n    setExercises(prev =>\n      prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex))\n    )\n  }\n\n  const removeExercise = (index: number) => {\n    setExercises(prev => prev.filter((_, i) => i !== index))\n  }\n\n  const handleSubmit = async (e: React.FormEvent) => {\n    e.preventDefault()\n    if (!name.trim()) return\n\n    setSaving(true)\n    const workout: Workout = {\n      id: Date.now().toString(),\n      name: name.trim(),\n      date,\n      duration: parseInt(duration) || 0,\n      notes: notes.trim(),\n      exercises,\n    }\n\n    // Simulate API call\n    await new Promise(resolve => setTimeout(resolve, 500))\n\n    const stored = localStorage.getItem('workouts')\n    const existing: Workout[] = stored ? JSON.parse(stored) : []\n    localStorage.setItem('workouts', JSON.stringify([workout, ...existing]))\n\n    setSaving(false)\n    navigate('/history')\n  }\n\n  return (\n    <div className=\"space-y-6\">\n      <h2 className=\"text-xl font-bold text-gray-900 dark:text-white\">Log Workout</h2>\n\n      <form onSubmit={handleSubmit} className=\"space-y-5\">\n        {/* Workout Name */}\n        <div>\n          <label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1\">\n            Workout Name *\n          </label>\n          <input\n            type=\"text\"\n            value={name}\n            onChange={e => setName(e.target.value)}\n            placeholder=\"e.g. Push Day, Morning Run\"\n            className=\"w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500\"\n            required\n          />\n        </div>\n\n        {/* Date */}\n        <div>\n          <label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1\">\n            Date\n          </label>\n          <input\n            type=\"date\"\n            value={date}\n            onChange={e => setDate(e.target.value)}\n            className=\"w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500\"\n          />\n        </div>\n\n        {/* Duration */}\n        <div>\n          <label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1\">\n            Duration (minutes)\n          </label>\n          <input\n            type=\"number\"\n            value={duration}\n            onChange={e => setDuration(e.target.value)}\n            placeholder=\"e.g. 45\"\n            min=\"1\"\n            className=\"w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500\"\n          />\n        </div>\n\n        {/* Exercises */}\n        <div>\n          <div className=\"flex items-center justify-between mb-3\">\n            <label className=\"text-sm font-medium text-gray-700 dark:text-gray-300\">\n              Exercises\n            </label>\n            <button\n              type=\"button\"\n              onClick={addExercise}\n              className=\"text-sm text-indigo-600 dark:text-indigo-400 font-medium\"\n            >\n              + Add Exercise\n            </button>\n          </div>\n\n          <div className=\"space-y-3\">\n            {exercises.map((ex, index) => (\n              <div key={index} className=\"bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3\">\n                <div className=\"flex items-center gap-2\">\n                  <input\n                    type=\"text\"\n                    value={ex.name}\n                    onChange={e => updateExercise(index, 'name', e.target.value)}\n                    placeholder=\"Exercise name\"\n                    className=\"flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500\"\n                  />\n                  <button\n                    type=\"button\"\n                    onClick={() => removeExercise(index)}\n                    className=\"text-red-500 text-lg\"\n                  >\n                    ✕\n                  </button>\n                </div>\n                <div className=\"grid grid-cols-3 gap-2\">\n                  {(['sets', 'reps', 'weight'] as const).map(field => (\n                    <div key={field}>\n                      <label className=\"text-xs text-gray-500 dark:text-gray-400 capitalize\">{field}</label>\n                      <input\n                        type=\"number\"\n                        value={ex[field]}\n                        onChange={e => updateExercise(index, field, parseInt(e.target.value) || 0)}\n                        min=\"0\"\n                        className=\"w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500\"\n                      />\n                    </div>\n                  ))}\n                </div>\n              </div>\n            ))}\n          </div>\n        </div>\n\n        {/* Notes */}\n        <div>\n          <label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1\">\n            Notes\n          </label>\n          <textarea\n            value={notes}\n            onChange={e => setNotes(e.target.value)}\n            placeholder=\"How did it go?\"\n            rows={3}\n            className=\"w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500\"\n          />\n        </div>\n\n        {/* Submit */}\n        <button\n          type=\"submit\"\n          disabled={saving || !name.trim()}\n          className=\"w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-4 rounded-xl font-semibold text-lg transition-colors\"\n        >\n          {saving ? 'Saving...' : 'Save Workout'}\n        </button>\n      </form>\n
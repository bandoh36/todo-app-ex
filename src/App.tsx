import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import TILList from './pages/til/TILList'
import TILEdit from './pages/til/TILEdit'
import WorkoutList from './pages/workout/WorkoutList'
import WorkoutEdit from './pages/workout/WorkoutEdit'
import EnjoymentList from './pages/enjoyment/EnjoymentList'
import EnjoymentEdit from './pages/enjoyment/EnjoymentEdit'
import GoalsList from './pages/goals/GoalsList'
import GoalEdit from './pages/goals/GoalEdit'
import TaskList from './pages/tasks/TaskList'
import TaskEdit from './pages/tasks/TaskEdit'
import CalendarPage from './pages/CalendarPage'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/til" element={<TILList />} />
        <Route path="/til/new" element={<TILEdit />} />
        <Route path="/til/:id" element={<TILEdit />} />
        <Route path="/workout" element={<WorkoutList />} />
        <Route path="/workout/new" element={<WorkoutEdit />} />
        <Route path="/workout/:id" element={<WorkoutEdit />} />
        <Route path="/enjoyment" element={<EnjoymentList />} />
        <Route path="/enjoyment/new" element={<EnjoymentEdit />} />
        <Route path="/enjoyment/:id" element={<EnjoymentEdit />} />
        <Route path="/goals" element={<GoalsList />} />
        <Route path="/goals/new" element={<GoalEdit />} />
        <Route path="/goals/:id" element={<GoalEdit />} />
        <Route path="/tasks" element={<TaskList />} />
        <Route path="/tasks/new" element={<TaskEdit />} />
        <Route path="/tasks/:id" element={<TaskEdit />} />
        <Route path="/calendar" element={<CalendarPage />} />
      </Routes>
    </Layout>
  )
}

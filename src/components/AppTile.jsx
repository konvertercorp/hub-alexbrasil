import { Link } from 'react-router-dom'

const COLOR_CLASSES = {
  blue: 'bg-blue-600',
  purple: 'bg-purple-600',
  green: 'bg-green-600',
  orange: 'bg-orange-500',
  teal: 'bg-teal-600',
  indigo: 'bg-indigo-600',
}

export function AppTile({ to, icon: Icon, label, color = 'blue' }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-2 text-center active:scale-95 transition-transform"
    >
      <div
        className={`flex aspect-square w-full items-center justify-center rounded-2xl shadow-lg ${COLOR_CLASSES[color] ?? COLOR_CLASSES.blue}`}
      >
        <Icon className="h-8 w-8 text-white" strokeWidth={2} />
      </div>
      <span className="text-sm font-medium text-gray-900">{label}</span>
    </Link>
  )
}

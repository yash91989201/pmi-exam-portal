import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/(admin)/dashboard/users/$userId/exams',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>Hello "/_authenticated/(admin)/dashboard/users/$userId/exams"!</div>
  )
}

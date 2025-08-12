import { createFileRoute } from '@tanstack/react-router'
import { CreateExamForm } from '@/components/admin/exams/create-exam-form'

export const Route = createFileRoute('/_authenticated/admin/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CreateExamForm />
}

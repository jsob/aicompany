import type { TaskStatus, TaskPriority, ReviewStatus, ApprovalStatus, EmployeeStatus } from '@prisma/client'

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  BACKLOG: 'Бэклог',
  QUEUED: 'В очереди',
  RUNNING: 'Выполняется',
  BLOCKED: 'Заблокирована',
  REVIEW: 'На проверке',
  DONE: 'Готово',
  CANCELLED: 'Отменена',
}

export const TASK_STATUS_CLASS: Record<TaskStatus, string> = {
  BACKLOG: 'bg-muted text-muted-foreground',
  QUEUED: 'bg-primary/15 text-primary',
  RUNNING: 'bg-accent/15 text-accent',
  BLOCKED: 'bg-destructive/15 text-destructive',
  REVIEW: 'bg-warning/15 text-warning',
  DONE: 'bg-success/15 text-success',
  CANCELLED: 'bg-muted text-muted-foreground line-through',
}

export const TASK_COLUMNS: TaskStatus[] = ['BACKLOG', 'QUEUED', 'RUNNING', 'REVIEW', 'DONE']

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  LOW: 'Низкий',
  MEDIUM: 'Средний',
  HIGH: 'Высокий',
  URGENT: 'Срочный',
}

export const PRIORITY_CLASS: Record<TaskPriority, string> = {
  LOW: 'bg-muted text-muted-foreground',
  MEDIUM: 'bg-primary/15 text-primary',
  HIGH: 'bg-warning/15 text-warning',
  URGENT: 'bg-destructive/15 text-destructive',
}

export const REVIEW_LABEL: Record<ReviewStatus, string> = {
  DRAFT: 'Черновик',
  IN_REVIEW: 'На проверке',
  APPROVED: 'Принят',
  REJECTED: 'Отклонён',
}

export const REVIEW_CLASS: Record<ReviewStatus, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  IN_REVIEW: 'bg-warning/15 text-warning',
  APPROVED: 'bg-success/15 text-success',
  REJECTED: 'bg-destructive/15 text-destructive',
}

export const APPROVAL_LABEL: Record<ApprovalStatus, string> = {
  PENDING: 'Ожидает',
  APPROVED: 'Принято',
  REJECTED: 'Отклонено',
}

export const ARTIFACT_TYPE_LABEL: Record<string, string> = {
  RESEARCH_BRIEF: 'Research-бриф',
  CAMPAIGN_BRIEF: 'Campaign-бриф',
  PRD: 'PRD',
  CONTENT: 'Контент',
  REPORT: 'Отчёт',
  LEAD_LIST: 'Список лидов',
  SOP: 'SOP',
  OTHER: 'Другое',
}

export const EMPLOYEE_STATUS_LABEL: Record<EmployeeStatus, string> = {
  ACTIVE: 'Активен',
  PAUSED: 'На паузе',
  ARCHIVED: 'Архив',
}

import { TaskAnalytics } from '../../../../graphql/types.generated';

const getTaskAnalytics = (data: {
  id: string;
  type: string;
  attributes: {
    created_at: string;
    last_electronic_newsletter_completed_at: string | null;
    last_physical_newsletter_completed_at: string | null;
    tasks_overdue_or_due_today_counts: [{ label: string; count: number }];
    total_tasks_due_count: number;
    updated_at: string;
    updated_in_db_at: string;
  };
}): TaskAnalytics => {
  const {
    attributes: {
      created_at,
      last_electronic_newsletter_completed_at,
      last_physical_newsletter_completed_at,
      tasks_overdue_or_due_today_counts,
      total_tasks_due_count,
      updated_at,
      updated_in_db_at,
    },
  } = data;

  return {
    ...data,
    createdAt: created_at,
    lastElectronicNewsletterCompletedAt:
      last_electronic_newsletter_completed_at,
    lastPhysicalNewsletterCompletedAt: last_physical_newsletter_completed_at,
    tasksOverdueOrDueTodayCounts: tasks_overdue_or_due_today_counts,
    totalTasksDueCount: total_tasks_due_count,
    updatedAt: updated_at,
    updatedInDbAt: updated_in_db_at,
  };
};

export { getTaskAnalytics };

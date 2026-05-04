import Card from "../../../../components/ui/Card";
import { Clock3, Target, TrendingUp, Users } from "lucide-react";
import type { UseDataExtractionWorkspaceReturn } from "../types";

interface WorkloadSummaryCardProps {
  summary: UseDataExtractionWorkspaceReturn["workloadSummary"];
  isLoading: boolean;
  isLeader: boolean;
  currentUserId: string | null;
}

function clampProgress(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function getCompletionPercentage(completed: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return clampProgress((completed / total) * 100);
}

export default function WorkloadSummaryCard({
  summary,
  isLoading,
  isLeader,
  currentUserId,
}: WorkloadSummaryCardProps) {
  const reviewerWorkloads = summary?.reviewerWorkloads ?? [];
  const overallProgress = clampProgress(summary?.overallProgressPercentage ?? 0);
  const personalWorkload =
    reviewerWorkloads.find((workload) => workload.reviewerId === currentUserId) ??
    reviewerWorkloads[0] ??
    null;
  const personalProgress = getCompletionPercentage(
    personalWorkload?.completed ?? 0,
    personalWorkload?.totalAssigned ?? 0
  );
  const progressValue = isLeader ? overallProgress : personalProgress;

  const title = isLeader ? "Team Workload & Progress" : "My Extraction Progress";
  const description = isLeader
    ? "Track global completion and review distribution across the extraction team."
    : "See how much of your assigned extraction workload is complete.";

  if (isLoading) {
    return (
      <Card className="rounded-2xl border border-blue-100 bg-white/95 shadow-xl shadow-slate-200/50 backdrop-blur">
        <div className="animate-pulse space-y-5 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="h-4 w-44 rounded-full bg-slate-200" />
              <div className="h-3 w-80 max-w-full rounded-full bg-slate-100" />
            </div>
            <div className="h-10 w-24 rounded-2xl bg-slate-100" />
          </div>
          <div className="h-3 rounded-full bg-slate-100" />
          <div className="space-y-3">
            <div className="h-12 rounded-2xl bg-slate-50" />
            <div className="h-12 rounded-2xl bg-slate-50" />
          </div>
        </div>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card className="rounded-2xl border border-blue-100 bg-white/95 shadow-xl shadow-slate-200/50 backdrop-blur">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              {isLeader ? "Team Progress" : "Your Progress"}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">{title}</h2>
            <p className="mt-2 text-sm text-slate-500">{description}</p>
          </div>
          <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
            No workload data available yet
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-2xl border border-blue-100 bg-white/95 shadow-xl shadow-slate-200/50 backdrop-blur">
      <div className="space-y-5 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              {isLeader ? <Users className="h-3.5 w-3.5" /> : <Target className="h-3.5 w-3.5" />}
              {isLeader ? "Team View" : "Personal View"}
            </div>
            <h2 className="mt-3 text-xl font-semibold text-slate-900">{title}</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-500">{description}</p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              {isLeader ? "Overall Progress" : "My Progress"}
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {Math.round(progressValue)}%
            </p>
          </div>
        </div>

        <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">
              {isLeader ? "Global completion" : "Your completion"}
            </span>
            <span className="font-semibold text-slate-900">{Math.round(progressValue)}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${progressValue}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">
            {isLeader
              ? "This reflects completion across the full extraction workload."
              : `You have completed ${personalWorkload?.completed ?? 0} out of ${personalWorkload?.totalAssigned ?? 0} assigned studies.`}
          </p>
        </div>

        {isLeader ? (
          <div className="max-h-[300px] overflow-y-auto rounded-xl border border-slate-200 bg-white">
            <div className="divide-y divide-slate-100">
              {reviewerWorkloads.length === 0 ? (
                <div className="px-4 py-5 text-sm text-slate-500">
                  Reviewer workload details will appear here once assignments are available.
                </div>
              ) : (
                reviewerWorkloads.map((workload) => {
                  const reviewerProgress = getCompletionPercentage(
                    workload.completed,
                    workload.totalAssigned
                  );

                  return (
                    <div
                      key={workload.reviewerId}
                      className="flex flex-col gap-3 px-4 py-4 xl:flex-row xl:items-center xl:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-slate-900">
                            {workload.reviewerName}
                          </h3>
                          {currentUserId === workload.reviewerId ? (
                            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                              You
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {workload.completed} completed of {workload.totalAssigned} assigned studies
                        </p>
                      </div>

                      <div className="flex min-w-0 flex-1 items-center gap-3 xl:justify-end">
                        <div className="w-full max-w-[180px] space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>Completion</span>
                            <span>{Math.round(reviewerProgress)}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500"
                              style={{ width: `${reviewerProgress}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                            Completed {workload.completed}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">
                            In Progress {workload.inProgress}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                            Not Started {workload.notStarted}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm shadow-slate-100/80">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Your completion rate
              </div>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-bold text-slate-900">
                    {Math.round(
                      getCompletionPercentage(
                        personalWorkload?.completed ?? 0,
                        personalWorkload?.totalAssigned ?? 0
                      )
                    )}%
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {personalWorkload
                      ? `You have completed ${personalWorkload.completed} out of ${personalWorkload.totalAssigned} assigned studies.`
                      : "No assigned studies are available in the workload summary yet."}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-4 shadow-sm shadow-slate-100/80">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Clock3 className="h-4 w-4 text-amber-600" />
                Queue breakdown
              </div>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p>In Progress: {personalWorkload?.inProgress ?? 0}</p>
                <p>Not Started: {personalWorkload?.notStarted ?? 0}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

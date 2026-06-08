"use client";

import { useTransition } from "react";
import { Loader2, Play, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import {
  approveProposal,
  logoutAdmin,
  rejectProposal,
  requeueFailedJob,
  triggerDailyDrop,
} from "@/features/admin/actions";
import type { getAdminDashboardData } from "@/features/admin/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DashboardData = Awaited<ReturnType<typeof getAdminDashboardData>>;

interface AdminDashboardProps {
  data: DashboardData;
}

export function AdminDashboard({ data }: AdminDashboardProps) {
  const [pending, startTransition] = useTransition();

  function runAction(
    action: () => Promise<{ success: boolean; error?: string; message?: string }>,
  ) {
    startTransition(async () => {
      const result = await action();
      if (result.success) {
        toast.success(result.message ?? "Done");
      } else {
        toast.error(result.error ?? "Action failed");
      }
    });
  }

  async function handleLogout() {
    await logoutAdmin();
    window.location.href = "/admin/login";
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Review proposals, inspect failed jobs, and trigger the daily drop.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => runAction(triggerDailyDrop)}
          >
            {pending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Run daily drop
          </Button>
          <Button variant="ghost" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Safe proposals" value={data.stats.pendingSafe} />
        <StatCard label="Borderline proposals" value={data.stats.pendingBorderline} />
        <StatCard label="Failed jobs" value={data.stats.failedJobs} />
        <StatCard label="Queued animations" value={data.stats.queuedAnimations} />
      </div>

      {data.latestBatch && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Latest batch</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            <p>
              Date:{" "}
              <span className="text-foreground">{data.latestBatch.generationDate}</span>
            </p>
            <p>
              Status:{" "}
              <Badge variant="secondary" className="ml-1">
                {data.latestBatch.status}
              </Badge>
            </p>
            <p>Items: {data.latestBatch.itemCount}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Proposals to review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.proposals.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No proposals waiting for review.
            </p>
          ) : (
            data.proposals.map((proposal) => (
              <div
                key={proposal.id}
                className="border-border/60 flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={proposal.safetyLabel === "safe" ? "default" : "secondary"}
                    >
                      {proposal.safetyLabel}
                    </Badge>
                    {proposal.nickname && (
                      <span className="text-muted-foreground text-xs">
                        {proposal.nickname}
                      </span>
                    )}
                  </div>
                  <p className="text-sm">{proposal.ideaText}</p>
                  {proposal.styleHints && (
                    <p className="text-muted-foreground text-xs">
                      Style: {proposal.styleHints}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  {proposal.safetyLabel === "borderline" && (
                    <Button
                      size="sm"
                      disabled={pending}
                      onClick={() => runAction(() => approveProposal(proposal.id))}
                    >
                      Approve
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => runAction(() => rejectProposal(proposal.id))}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Failed jobs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.failedJobs.length === 0 ? (
            <p className="text-muted-foreground text-sm">No failed jobs.</p>
          ) : (
            data.failedJobs.map((job) => (
              <div
                key={job.id}
                className="border-border/60 flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="destructive">{job.jobType}</Badge>
                    {job.provider && (
                      <span className="text-muted-foreground text-xs">
                        {job.provider}
                      </span>
                    )}
                  </div>
                  {job.errorMessage && (
                    <p className="text-destructive text-sm">{job.errorMessage}</p>
                  )}
                  <p className="text-muted-foreground text-xs">
                    Attempts: {job.attempts} · Item: {job.chibiItemId ?? "none"}
                  </p>
                </div>
                {job.jobType === "animation" && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => runAction(() => requeueFailedJob(job.id))}
                  >
                    <RefreshCw className="mr-2 h-3.5 w-3.5" />
                    Requeue
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-muted-foreground text-sm">{label}</p>
        <p className="text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { academyTracks, academyLessons, lessonsForTrack } from "@/data/academyCourses";
import { coursePreviews } from "@/data/pricingContent";
import { contractStatusLabel } from "@/lib/contracts";
import type { TrainerPortalItem, TrainerPortalSectionId } from "@/data/trainerPortalNav";

type PortalData = {
  trainer: { id: string; name: string; title: string; email: string } | null;
  activeClients: Array<{
    id: string;
    status: string;
    dogName?: string | null;
    dogBreed?: string | null;
    dogAge?: string | null;
    dogNotes?: string | null;
    ownerMessage?: string | null;
    reportSummary?: string | null;
    createdAt: string;
    owner: { id: string; name?: string | null; email: string };
    conversation?: { id: string } | null;
  }>;
  awaitingAdmin: Array<{
    id: string;
    dogName?: string | null;
    owner: { email: string; name?: string | null };
    ownerMessage?: string | null;
    status: string;
  }>;
  ownerProgress: Array<{
    ownerId: string;
    email: string;
    name?: string | null;
    completedCount: number;
    totalLessons: number;
    lastOpenedLessonId?: string | null;
    cgcAccess: boolean;
  }>;
};

export function TrainerPortalPageView({
  sectionId,
  item,
  basePath
}: {
  sectionId: TrainerPortalSectionId;
  item: TrainerPortalItem;
  basePath: string;
}) {
  const [data, setData] = useState<PortalData | null>(null);
  const [error, setError] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [savedNotes, setSavedNotes] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/trainer/portal")
      .then((r) => r.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setData(json);
      })
      .catch(() => setError("Could not load portal data."));
  }, []);

  function addLocalNote() {
    if (!noteDraft.trim()) return;
    setSavedNotes((prev) => [`${new Date().toLocaleString()} — ${noteDraft.trim()}`, ...prev]);
    setNoteDraft("");
  }

  return (
    <div>
      <p className="text-sm font-black uppercase tracking-[0.15em] text-orange">{sectionId.replace(/-/g, " ")}</p>
      <h1 className="mt-2 text-3xl font-black text-charcoal">{item.label}</h1>
      <p className="mt-3 max-w-3xl text-muted">{item.description}</p>

      <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <h2 className="text-sm font-black uppercase tracking-wide text-muted">On this page</h2>
        <ul className="mt-4 space-y-2">
          {item.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2 text-sm text-charcoal">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange" aria-hidden />
              {bullet}
            </li>
          ))}
        </ul>
      </div>

      {error && <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}

      <div className="mt-6">{renderPageBody(item.slug, data, basePath, noteDraft, setNoteDraft, savedNotes, addLocalNote)}</div>
    </div>
  );
}

function renderPageBody(
  slug: string,
  data: PortalData | null,
  basePath: string,
  noteDraft: string,
  setNoteDraft: (v: string) => void,
  savedNotes: string[],
  addLocalNote: () => void
) {
  switch (slug) {
    case "todays-online-sessions":
      return (
        <Panel title="Today's schedule">
          {!data ? (
            <Loading />
          ) : data.activeClients.length === 0 ? (
            <Empty text="No active clients yet. Sessions appear when admin approves assignments." />
          ) : (
            <div className="space-y-3">
              {data.activeClients.map((c, i) => (
                <div key={c.id} className="rounded-2xl border border-gray-100 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold">{c.dogName || "Dog"} — {c.owner.name || c.owner.email}</p>
                    <span className="rounded-full bg-sky/10 px-3 py-1 text-xs font-bold text-sky">
                      {i === 0 ? "Suggested next" : "Scheduled"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted">Online session · 45 min · Focus: {c.reportSummary || "General coaching"}</p>
                  {c.conversation?.id && (
                    <Link href={`/messages?conversation=${c.conversation.id}`} className="mt-3 inline-flex text-sm font-bold text-orange">
                      Open session thread →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </Panel>
      );

    case "student-progress":
      return (
        <Panel title="Student progress">
          {!data ? (
            <Loading />
          ) : !data.ownerProgress.length ? (
            <Empty text="Progress appears for assigned owners after admin approval." />
          ) : (
            <div className="space-y-3">
              {data.ownerProgress.map((o) => (
                <div key={o.ownerId} className="rounded-2xl border border-gray-100 p-4">
                  <p className="font-bold">{o.name || o.email}</p>
                  <p className="text-sm text-muted">{o.completedCount} of {o.totalLessons} lessons completed</p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-orange"
                      style={{ width: `${o.totalLessons ? (o.completedCount / o.totalLessons) * 100 : 0}%` }}
                    />
                  </div>
                  {o.lastOpenedLessonId && (
                    <p className="mt-2 text-xs text-muted">Last opened: {o.lastOpenedLessonId.replace(/-/g, " ")}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Panel>
      );

    case "submitted-videos":
      return (
        <Panel title="Submitted videos">
          <Empty text="No video submissions yet. Owners on Premium Coaching can submit practice clips for review." />
          <p className="mt-4 text-sm text-muted">When submissions arrive, they will appear here with playback, timestamps, and feedback tools.</p>
        </Panel>
      );

    case "trainer-notes":
    case "add-trainer-notes":
      return (
        <Panel title="Trainer notes">
          <textarea
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            placeholder="Add a session note, homework reminder, or behavior observation…"
            className="w-full rounded-2xl border border-gray-200 p-4 text-sm"
            rows={4}
          />
          <button
            type="button"
            onClick={addLocalNote}
            className="mt-3 rounded-full bg-orange px-5 py-2.5 text-sm font-bold text-white"
          >
            Save note (this device)
          </button>
          {savedNotes.length > 0 && (
            <ul className="mt-4 space-y-2">
              {savedNotes.map((n) => (
                <li key={n} className="rounded-xl bg-soft-bg px-4 py-3 text-sm text-charcoal">
                  {n}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-muted">Notes sync to the owner file when the notes API is connected. Saved locally for now.</p>
        </Panel>
      );

    case "assigned-dogs":
      return (
        <Panel title="Assigned dogs">
          {!data ? (
            <Loading />
          ) : (
            <>
              <h3 className="mb-3 text-sm font-black uppercase text-muted">Active</h3>
              {!data.activeClients.length ? (
                <Empty text="No approved assignments yet." />
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {data.activeClients.map((c) => (
                    <article key={c.id} className="rounded-2xl border border-gray-100 p-4">
                      <p className="font-black">{c.dogName || "Dog (name pending)"}</p>
                      <p className="text-sm text-muted">{[c.dogBreed, c.dogAge].filter(Boolean).join(" · ")}</p>
                      <p className="mt-2 text-sm font-semibold">{c.owner.name || c.owner.email}</p>
                      <span className="mt-2 inline-block rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-black uppercase text-success">
                        {contractStatusLabel(c.status)}
                      </span>
                      {c.conversation?.id && (
                        <Link href={`/messages?conversation=${c.conversation.id}`} className="mt-3 block text-sm font-bold text-orange">
                          Message owner →
                        </Link>
                      )}
                    </article>
                  ))}
                </div>
              )}
              {data.awaitingAdmin.length > 0 && (
                <>
                  <h3 className="mb-3 mt-8 text-sm font-black uppercase text-muted">Awaiting admin</h3>
                  {data.awaitingAdmin.map((c) => (
                    <div key={c.id} className="mb-2 rounded-xl border border-dashed border-gray-200 p-3 text-sm">
                      {c.dogName || c.owner.name || c.owner.email} — {contractStatusLabel(c.status)}
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </Panel>
      );

    case "course-feedback":
      return (
        <Panel title="Course feedback">
          <Empty text="No owner feedback submitted yet this month." />
          <Link href={`${basePath}/dashboard/lesson-plan-library`} className="mt-4 inline-flex text-sm font-bold text-orange">
            Browse lesson plans →
          </Link>
        </Panel>
      );

    case "lesson-plan-library":
      return (
        <Panel title="Lesson plan library">
          <div className="mb-4 flex flex-wrap gap-3">
            <Link href="/library" className="rounded-full bg-orange px-5 py-2.5 text-sm font-bold text-white">
              Open full library
            </Link>
            <Link href="/pricing" className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-bold text-charcoal">
              View pricing plans
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {coursePreviews.map((course) => (
              <Link
                key={course.slug}
                href={`/pricing/plans/${course.slug}`}
                className="rounded-2xl border border-gray-100 p-4 transition hover:border-orange/30"
              >
                <p className="font-bold">{course.title}</p>
                <p className="mt-1 text-sm text-muted">{course.modules.length} modules</p>
              </Link>
            ))}
          </div>
        </Panel>
      );

    case "cgc-evaluation-requests":
      return (
        <Panel title="CGC evaluation requests">
          {!data ? (
            <Loading />
          ) : (
            <>
              {data.ownerProgress.filter((o) => o.cgcAccess).length === 0 ? (
                <Empty text="No CGC Prep enrollments in your assigned clients yet." />
              ) : (
                data.ownerProgress
                  .filter((o) => o.cgcAccess)
                  .map((o) => (
                    <div key={o.ownerId} className="mb-3 rounded-2xl border border-gray-100 p-4">
                      <p className="font-bold">{o.name || o.email}</p>
                      <p className="text-sm text-muted">AKC CGC Prep enrolled · {o.completedCount} lessons completed academy-wide</p>
                      <Link href="/library/akc-cgc-prep" className="mt-2 inline-flex text-sm font-bold text-orange">
                        View CGC curriculum →
                      </Link>
                    </div>
                  ))
              )}
              <Link href="/library/akc-cgc-prep" className="mt-4 inline-flex text-sm font-bold text-orange">
                AKC CGC Prep course →
              </Link>
            </>
          )}
        </Panel>
      );

    case "add-lesson":
    case "edit-course":
      return (
        <Panel title={slug === "add-lesson" ? "Add lesson" : "Edit course"}>
          <div className="space-y-3">
            {academyTracks.map((track) => (
              <div key={track.id} className="rounded-2xl border border-gray-100 p-4">
                <p className="font-bold">{track.title}</p>
                <p className="text-sm text-muted">{lessonsForTrack(track.id).length} lessons</p>
                <Link href={`/library/${track.id}`} className="mt-2 inline-flex text-sm font-bold text-orange">
                  Preview track →
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted">Content changes require admin publish. Contact admin to update live lessons.</p>
        </Panel>
      );

    case "upload-video":
      return (
        <Panel title="Upload video">
          <p className="text-sm text-muted">Lessons with video URLs configured:</p>
          <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto text-sm">
            {academyLessons.filter((l) => l.videoUrl).slice(0, 12).map((l) => (
              <li key={l.id} className="rounded-lg bg-soft-bg px-3 py-2">{l.title}</li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted">{academyLessons.filter((l) => l.videoUrl).length} / {academyLessons.length} lessons have video URLs.</p>
        </Panel>
      );

    case "add-worksheet":
      return (
        <Panel title="Add worksheet">
          <p className="text-sm text-muted">All lessons include downloadable Fitdog worksheets.</p>
          <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto text-sm">
            {academyLessons.slice(0, 15).map((l) => (
              <li key={l.id} className="flex justify-between gap-2 rounded-lg bg-soft-bg px-3 py-2">
                <span>{l.title}</span>
                <span className="shrink-0 text-xs text-muted">{l.worksheetTitle}</span>
              </li>
            ))}
          </ul>
        </Panel>
      );

    case "publish-unpublish-lesson":
      return (
        <Panel title="Publish / unpublish lesson">
          <ul className="space-y-2 text-sm">
            {academyLessons.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-100 px-3 py-2">
                <span>{l.title}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${l.isFreePreview ? "bg-sky/10 text-sky" : "bg-orange/10 text-orange"}`}>
                  {l.isFreePreview ? "Free preview" : "Paid"}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted">Publish changes are admin-only. Trainers can preview and request updates.</p>
        </Panel>
      );

    case "preview-as-student":
      return (
        <Panel title="Preview as student">
          <p className="text-sm text-muted">Open the library and pricing as an owner would see them.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/library" className="rounded-full bg-orange px-5 py-2.5 text-sm font-bold text-white">Open library</Link>
            <Link href="/pricing" className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-bold">Open pricing</Link>
            <Link href="/dashboard" className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-bold">Student dashboard</Link>
          </div>
        </Panel>
      );

    case "message-owner":
      return (
        <Panel title="Message owner">
          {!data ? (
            <Loading />
          ) : !data.activeClients.length ? (
            <Empty text="No assigned owners to message yet." />
          ) : (
            <div className="space-y-3">
              {data.activeClients.map((c) => (
                <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 p-4">
                  <div>
                    <p className="font-bold">{c.owner.name || c.owner.email}</p>
                    <p className="text-sm text-muted">{c.dogName || "Dog"}</p>
                  </div>
                  {c.conversation?.id ? (
                    <Link href={`/messages?conversation=${c.conversation.id}`} className="rounded-full bg-orange px-4 py-2 text-sm font-bold text-white">
                      Message
                    </Link>
                  ) : (
                    <Link href="/messages" className="rounded-full border border-gray-200 px-4 py-2 text-sm font-bold">
                      Open messenger
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </Panel>
      );

    case "review-homework":
      return (
        <Panel title="Review homework">
          <Empty text="Homework submissions will appear here when owners complete worksheets and log practice." />
          <p className="mt-3 text-sm text-muted">Check student progress for lesson completion in the meantime.</p>
          <Link href={`${basePath}/dashboard/student-progress`} className="mt-3 inline-flex text-sm font-bold text-orange">
            View student progress →
          </Link>
        </Panel>
      );

    case "recommend-next-course":
      return (
        <Panel title="Recommend next course">
          <div className="grid gap-3 sm:grid-cols-2">
            {academyTracks.map((track) => (
              <div key={track.id} className="rounded-2xl border border-gray-100 p-4">
                <p className="font-bold">{track.title}</p>
                <p className="mt-1 text-sm text-muted">{track.subtitle}</p>
                <Link href={`/library/${track.id}`} className="mt-3 inline-flex text-sm font-bold text-orange">
                  Share track link →
                </Link>
              </div>
            ))}
          </div>
        </Panel>
      );

    case "flag-behavior-concern":
      return (
        <Panel title="Flag behavior concern">
          <p className="text-sm text-muted">Describe a safety or behavior concern. Admin will be notified.</p>
          <textarea
            className="mt-3 w-full rounded-2xl border border-gray-200 p-4 text-sm"
            rows={5}
            placeholder="Dog name, owner email, what happened, severity, and recommended next steps…"
          />
          <button type="button" className="mt-3 rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white">
            Submit flag to admin
          </button>
          <p className="mt-3 text-xs text-muted">For emergencies, advise owners to contact a veterinarian or certified behavior professional immediately.</p>
        </Panel>
      );

    default:
      return null;
  }
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <h2 className="text-lg font-black text-charcoal">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-muted">{text}</p>;
}

function Loading() {
  return <p className="text-sm text-muted">Loading…</p>;
}

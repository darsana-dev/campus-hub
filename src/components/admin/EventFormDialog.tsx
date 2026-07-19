import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORIES = [
  "Workshop",
  "Talk",
  "Competition",
  "Social",
  "Meetup",
  "Hackathon",
  "Cultural",
  "Sports",
  "Other",
];

const schema = z.object({
  title: z.string().trim().min(2, "Title is required").max(140),
  short_description: z.string().trim().max(280).optional().or(z.literal("")),
  date: z.string().min(1, "Date is required"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  location: z.string().trim().max(200).optional().or(z.literal("")),
  capacity: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(["draft", "published"]),
});

export type EventRow = {
  id: string;
  club_id: string;
  title: string;
  short_description: string | null;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  capacity: number | null;
  category: string | null;
  status: "draft" | "published";
};

function toLocalParts(iso: string | null | undefined) {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

function combineLocal(date: string, time: string) {
  // Local time -> ISO
  return new Date(`${date}T${time}`).toISOString();
}

export function EventFormDialog({
  open,
  onOpenChange,
  clubId,
  event,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  clubId: string;
  event?: EventRow | null;
}) {
  const queryClient = useQueryClient();
  const isEdit = !!event;

  const [values, setValues] = useState(() => {
    const s = toLocalParts(event?.starts_at);
    const e = toLocalParts(event?.ends_at);
    return {
      title: event?.title ?? "",
      short_description: event?.short_description ?? "",
      date: s.date,
      start_time: s.time,
      end_time: e.time || s.time,
      location: event?.location ?? "",
      capacity: event?.capacity != null ? String(event.capacity) : "",
      category: event?.category ?? "",
      status: (event?.status ?? "draft") as "draft" | "published",
    };
  });

  useEffect(() => {
    if (!open) return;
    const s = toLocalParts(event?.starts_at);
    const e = toLocalParts(event?.ends_at);
    setValues({
      title: event?.title ?? "",
      short_description: event?.short_description ?? "",
      date: s.date,
      start_time: s.time,
      end_time: e.time || s.time,
      location: event?.location ?? "",
      capacity: event?.capacity != null ? String(event.capacity) : "",
      category: event?.category ?? "",
      status: (event?.status ?? "draft") as "draft" | "published",
    });
  }, [event, open]);

  const set = <K extends keyof typeof values>(k: K, v: (typeof values)[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  const mutation = useMutation({
    mutationFn: async (input: typeof values) => {
      const parsed = schema.safeParse(input);
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
      }
      const starts_at = combineLocal(parsed.data.date, parsed.data.start_time);
      const ends_at = combineLocal(parsed.data.date, parsed.data.end_time);
      if (new Date(ends_at) <= new Date(starts_at)) {
        throw new Error("End time must be after start time");
      }
      const capacity = parsed.data.capacity ? Number(parsed.data.capacity) : null;
      if (capacity != null && (!Number.isFinite(capacity) || capacity < 0)) {
        throw new Error("Capacity must be a positive number");
      }
      const payload = {
        club_id: clubId,
        title: parsed.data.title,
        short_description: parsed.data.short_description || null,
        starts_at,
        ends_at,
        location: parsed.data.location || null,
        capacity,
        category: parsed.data.category || null,
        status: parsed.data.status,
      };
      if (isEdit && event) {
        const { error } = await supabase.from("events").update(payload).eq("id", event.id);
        if (error) throw error;
      } else {
        const { data: userData } = await supabase.auth.getUser();
        const { error } = await supabase.from("events").insert({
          ...payload,
          created_by: userData.user?.id ?? null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? "Event updated" : "Event created");
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["admin-event"] });
      onOpenChange(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit event" : "Create event"}</DialogTitle>
          <DialogDescription>
            Drafts stay private to your club. Publish to make it visible.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              maxLength={140}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="short">Short description</Label>
            <Textarea
              id="short"
              value={values.short_description}
              onChange={(e) => set("short_description", e.target.value)}
              maxLength={280}
              rows={2}
              placeholder="One or two sentences that show up in listings."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={values.date}
                onChange={(e) => set("date", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="start">Start time</Label>
              <Input
                id="start"
                type="time"
                value={values.start_time}
                onChange={(e) => set("start_time", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="end">End time</Label>
              <Input
                id="end"
                type="time"
                value={values.end_time}
                onChange={(e) => set("end_time", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="venue">Venue</Label>
              <Input
                id="venue"
                value={values.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="e.g. Auditorium A"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                min={0}
                value={values.capacity}
                onChange={(e) => set("capacity", e.target.value)}
                placeholder="Leave blank for unlimited"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Category</Label>
              <Select
                value={values.category || undefined}
                onValueChange={(v) => set("category", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select
                value={values.status}
                onValueChange={(v) => set("status", v as "draft" | "published")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate(values)}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving…" : isEdit ? "Save changes" : "Create event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
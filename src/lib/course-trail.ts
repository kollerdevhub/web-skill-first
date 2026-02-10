export type ContentType = 'video' | 'texto' | 'quiz' | 'avaliacao';

export type TrailContainerMode = 'containers' | 'flat';

export type TrailGroup<T> = {
  container: T;
  lessons: T[];
};

export type TrailResult<T> = {
  mode: TrailContainerMode;
  // Items before the first container, or items that couldn't be assigned.
  unassigned: T[];
  groups: Array<TrailGroup<T>>;
  sorted: T[];
};

type TrailItemLike = {
  id: string;
  order: number;
  contentType?: string;
  videoUrl?: string | null;
  textContent?: string | null;
};

export function isTrailContainer<T extends TrailItemLike>(item: T): boolean {
  // Convention: "container modules" are texto entries with no video and no text body.
  // This gives us Curso -> Modulos -> Aulas without requiring backend schema changes.
  const type = String(item.contentType || '').toLowerCase();
  const isTexto = type === 'texto';
  const hasVideo = Boolean(item.videoUrl);
  const hasText = Boolean((item.textContent || '').trim());
  return isTexto && !hasVideo && !hasText;
}

export function buildCourseTrail<T extends TrailItemLike>(
  items: T[],
): TrailResult<T> {
  const sorted = [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
  const containers = sorted.filter(isTrailContainer);

  if (containers.length === 0) {
    return {
      mode: 'flat',
      unassigned: sorted.filter((x) => !isTrailContainer(x)),
      groups: [],
      sorted,
    };
  }

  const groups: Array<TrailGroup<T>> = [];
  const unassigned: T[] = [];

  // Items before first container are unassigned (legacy data).
  const firstContainerOrder = containers[0]?.order ?? Number.POSITIVE_INFINITY;
  for (const item of sorted) {
    if (!isTrailContainer(item) && item.order < firstContainerOrder) {
      unassigned.push(item);
    }
  }

  for (let i = 0; i < containers.length; i++) {
    const container = containers[i];
    const start = container.order;
    const end = containers[i + 1]?.order ?? Number.POSITIVE_INFINITY;
    const lessons = sorted.filter(
      (x) => !isTrailContainer(x) && x.order > start && x.order < end,
    );
    groups.push({ container, lessons });
  }

  // Any non-container that isn't in unassigned and isn't in any group is also unassigned.
  const assigned = new Set<string>();
  for (const u of unassigned) assigned.add(u.id);
  for (const g of groups) for (const l of g.lessons) assigned.add(l.id);
  for (const item of sorted) {
    if (!isTrailContainer(item) && !assigned.has(item.id)) unassigned.push(item);
  }

  return { mode: 'containers', unassigned, groups, sorted };
}

export function nextContainerOrder(currentOrder: number): number {
  const base = Math.max(Math.floor(currentOrder / 1000), 0);
  return (base + 1) * 1000;
}


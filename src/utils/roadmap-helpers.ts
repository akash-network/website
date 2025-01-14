import type { CollectionEntry } from "astro:content";
type Roadmap = CollectionEntry<"aeps">;

export function getRelevantDate(roadmap: Roadmap): Date {
  const dateString =
    roadmap.data["estimated-completion"] ??
    roadmap.data.completed ??
    roadmap.data.created;

  if (!dateString) {
    return new Date(0);
  }
  return new Date(dateString);
}

export function getRoadmapYear(roadmap: Roadmap): number {
  return getRelevantDate(roadmap).getFullYear();
}

export function sortRoadmapsByDate(roadmaps: Roadmap[]): Roadmap[] {
  return roadmaps.sort((a, b) => {
    const dateA = getRelevantDate(a).getTime();
    const dateB = getRelevantDate(b).getTime();
    if (dateA === dateB) {
      return parseInt(b.id) - parseInt(a.id);
    }
    return dateA - dateB;
  });
}

export function categorizeRoadmapsByQuarter(yearRoadmaps: Roadmap[]) {
  const quarters = {
    Q1: [] as Roadmap[],
    Q2: [] as Roadmap[],
    Q3: [] as Roadmap[],
    Q4: [] as Roadmap[],
  };

  yearRoadmaps.forEach((roadmap) => {
    const month = getRelevantDate(roadmap).getMonth();
    if (month <= 2) quarters.Q1.push(roadmap);
    else if (month <= 5) quarters.Q2.push(roadmap);
    else if (month <= 8) quarters.Q3.push(roadmap);
    else quarters.Q4.push(roadmap);
  });

  Object.values(quarters).forEach(sortRoadmapsByDate);

  return quarters;
}

// A Bid post counts as updated only when lastUpdated falls on a later
// calendar day (UTC) than pubDate, so posts that set both to the publish
// date don't show a redundant "Updated" label.
export function bitsUpdatedDate({
  pubDate,
  lastUpdated,
}: {
  pubDate: Date;
  lastUpdated?: Date;
}): Date | undefined {
  if (!lastUpdated) return undefined;
  const day = (date: Date) => date.toISOString().slice(0, 10);
  return day(lastUpdated) > day(pubDate) ? lastUpdated : undefined;
}

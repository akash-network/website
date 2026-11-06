import { useRef, useState } from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

// The Akash Console tutorials on the Akash Network YouTube channel, in the
// series' order. Lengths are the rendered files' running times.
const VIDEOS = [
  {
    id: "G_8PMHR8dFE",
    title: "Deploy your first app",
    line: "From sign-in to a live public URL with the Hello world template.",
    length: "1:49",
  },
  {
    id: "Y3QYJI5ImK4",
    title: "Serve an LLM on a GPU",
    line: "Run Llama 3.1 8B with vLLM on a GPU and a provider you pick.",
    length: "2:47",
  },
  {
    id: "ZL0I265esAQ",
    title: "Run your team",
    line: "Organizations, projects, roles and a monthly budget.",
    length: "1:49",
  },
  {
    id: "gACexAYHJcY",
    title: "After you deploy",
    line: "Update a deployment, watch its logs and events, and keep it funded.",
    length: "2:18",
  },
  {
    id: "8RBZrYGecsg",
    title: "Pick a GPU and a provider",
    line: "See who can run your workload before you spend anything.",
    length: "2:20",
  },
  {
    id: "w44C4fKmyPE",
    title: "How billing works",
    line: "Credits, escrow, per-block payments and keeping your balance funded.",
    length: "2:22",
  },
];

const thumb = (id: string, size: "maxresdefault" | "mqdefault") =>
  `https://i.ytimg.com/vi/${id}/${size}.jpg`;

/**
 * One player and the series beside it. The player shows the thumbnail until
 * it's clicked; only then does YouTube's embed load (from its no-cookie
 * domain). Picking another video plays it in the player.
 */
export function ConsoleVideos() {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const video = VIDEOS[current];

  const pick = (i: number) => {
    setCurrent(i);
    setPlaying(true);
    // On phones the list sits below the player: bring the player back.
    const player = playerRef.current;
    if (!player) return;
    const r = player.getBoundingClientRect();
    if (r.top < 80 || r.bottom > window.innerHeight)
      player.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
      <div>
        <div
          ref={playerRef}
          className="group relative aspect-video overflow-hidden rounded-2xl border bg-black"
        >
          {playing ? (
            <iframe
              key={video.id}
              src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
              title={`${video.title}: Akash Console tutorial`}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label={`Play ${video.title} (${video.length})`}
              className="absolute inset-0 h-full w-full"
            >
              <img
                src={thumb(video.id, "maxresdefault")}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.03] group-hover:brightness-105"
              />
              {/* In a corner: the thumbnails carry their own headline in the middle */}
              <span className="absolute bottom-2.5 right-2.5 flex h-8 items-center gap-1.5 rounded-full bg-white pl-2.5 pr-3 text-xs font-medium text-black shadow-lg transition-transform duration-300 group-hover:scale-105 md:bottom-4 md:right-4 md:h-10 md:gap-2 md:pl-3 md:pr-4 md:text-sm">
                <Play
                  className="h-3.5 w-3.5 fill-current md:h-4 md:w-4"
                  aria-hidden
                />
                Play
                <span className="font-jetBrainsMono text-[11px] text-black/60 md:text-xs">
                  {video.length}
                </span>
              </span>
            </button>
          )}
        </div>
        <h3 className="mt-5 text-xl font-semibold tracking-tight text-foreground">
          {video.title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-para">{video.line}</p>
      </div>

      <ol
        className="flex flex-col gap-1.5"
        aria-label="Akash Console tutorials"
      >
        {VIDEOS.map((v, i) => (
          <li key={v.id}>
            <button
              type="button"
              onClick={() => pick(i)}
              aria-current={i === current ? "true" : undefined}
              className={cn(
                // A ring, not a border: a site-wide rule overrides button borders.
                "group flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors",
                i === current
                  ? "bg-accent ring-1 ring-foreground/15"
                  : "hover:bg-accent/60",
              )}
            >
              <span className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-black">
                <img
                  src={thumb(v.id, "mqdefault")}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.03] group-hover:brightness-105"
                />
                <span className="absolute bottom-1 right-1 rounded bg-black/75 px-1 font-jetBrainsMono text-[10px] text-white">
                  {v.length}
                </span>
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">
                  {v.title}
                </span>
                <span className="mt-0.5 line-clamp-2 block text-xs leading-snug text-muted-foreground">
                  {v.line}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

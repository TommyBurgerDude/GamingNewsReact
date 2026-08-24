import { create } from "zustand";

export interface newsArticle {
    origin: string;
    title: string;
    link: string;
    desc: string;
    date: string | null;
    img: string | null;
}

export interface newsStore {
    articles: newsArticle[];
    loading: boolean;
    error: string | null;
    getNews: () => Promise<void>;
}

const feeds = [
    { name: "IGN", url: "https://www.ign.com/rss/articles/feed" },
    { name: "PC Gamer", url: "https://www.pcgamer.com/rss" },
    { name: "GameSpot", url: "https://www.gamespot.com/feeds/mashup/" },
    { name: "Polygon", url: "https://www.polygon.com/rss/index.xml" },
    { name: "Eurogamer", url: "https://www.eurogamer.net/feed" },
    { name: "Kotaku", url: "https://kotaku.com/rss" },
    { name: "Rock Paper Shotgun", url: "https://www.rockpapershotgun.com/feed" },
    { name: "Destructoid", url: "https://www.destructoid.com/feed/" },
    { name: "Game Informer", url: "https://www.gameinformer.com/rss.xml" },
    { name: "Gematsu", url: "https://www.gematsu.com/feed" },
    { name: "GamesRadar+", url: "https://www.gamesradar.com/rss/" },
    { name: "Pocket Gamer", url: "https://www.pocketgamer.com/index.rss" },
    { name: "TouchArcade", url: "https://toucharcade.com/feed/" },
];

export const useNewsStore = create<newsStore>((set) => ({
    articles: [],
    loading: false,
    error: null,

    getNews: async () => {
        set({ loading: true, error: null });

        try {
            const results = await Promise.allSettled(
                feeds.map(async (feed) => {
                    const response = await fetch(
                        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`
                    );

                    if (!response.ok) {
                        throw new Error(`Failed to fetch ${feed.name}`);
                    }

                    const data = await response.json();

                    if (data.status !== "ok") {
                        throw new Error(data.message ?? `Failed to parse ${feed.name}`);
                    }

                    return data.items.map((item: any): newsArticle => {
                        const rawContent = item.description || item.content || "";
                        const cleanDesc = rawContent.replace(/<[^>]*>/g, "").trim();

                        let imageSrc = item.thumbnail || item.enclosure?.link || null;
                        if (!imageSrc && rawContent) {
                            const imgMatch = rawContent.match(/<img[^>]+src=["']([^"']+)["']/i);
                            if (imgMatch) imageSrc = imgMatch[1];
                        }

                        let parsedDate: string | null = null;
                        if (item.pubDate) {
                            const timestamp = Date.parse(item.pubDate);
                            if (!isNaN(timestamp)) {
                                parsedDate = new Date(timestamp).toISOString();
                            }
                        }

                        return {
                            origin: feed.name,
                            title: item.title ? item.title.trim() : "",
                            link: item.link ?? "",
                            desc: cleanDesc,
                            date: parsedDate,
                            img: imageSrc,
                        };
                    });
                })
            );

            const successfulArticles = results
                .filter((res): res is PromiseFulfilledResult<newsArticle[]> => res.status === "fulfilled")
                .map((res) => res.value)
                .flat();

            const sortedArticles = successfulArticles.sort((a, b) => {
                const dateA = a.date ? new Date(a.date).getTime() : 0;
                const dateB = b.date ? new Date(b.date).getTime() : 0;
                return dateB - dateA;
            });

            set({
                articles: sortedArticles,
                loading: false,
            });
        } catch (err) {
            set({
                loading: false,
                error: err instanceof Error ? err.message : "Unknown Error",
            });
        }
    },
}));

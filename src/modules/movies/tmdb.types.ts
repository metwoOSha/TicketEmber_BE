export interface TmdbMovie {
    id: number;
    title: string;
    overview: string;
    runtime: number | null;
    poster_path: string | null;
    release_date: string;
    genres: { id: number; name: string }[];
    vote_average: number;
}

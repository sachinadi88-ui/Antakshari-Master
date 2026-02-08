
export interface Song {
  title: string;
  movie: string;
  lyrics: string;
}

export interface SongListResponse {
  letter: string;
  songs: Song[];
}

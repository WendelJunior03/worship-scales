import { api } from './api';
import { Musica, Artista } from '@/types';

export interface MusicaInput {
  nome: string;
  tomPadrao?: string | null;
  bpm?: number | null;
  artista?: string | null;
  cifraUrl?: string | null;
  audioUrl?: string | null;
  capaUrl?: string | null;
}

export interface MetadadosMusica {
  artista: string | null;
  capaUrl: string | null;
  tom: string | null;
  bpm: number | null;
  linkSpotify: string | null;
  linkCifraClub: string | null;
}

export interface CandidatoMusica {
  titulo: string;
  artista: string | null;
  tom: string | null;
  bpm: number | null;
  capaUrl: string | null;
}

export async function listarMusicas(): Promise<Musica[]> {
  const { data } = await api.get<Musica[]>('/musicas');
  return data;
}

export async function listarArtistas(): Promise<Artista[]> {
  const { data } = await api.get<Artista[]>('/musicas/artistas');
  return data;
}

export async function buscarMetadados(nome: string, artista?: string): Promise<MetadadosMusica> {
  const { data } = await api.get<MetadadosMusica>('/musicas/buscar-metadados', {
    params: { nome, artista: artista || undefined },
  });
  return data;
}

/** Autocomplete ao vivo (Deezer) — vários candidatos pra escolher enquanto digita. */
export async function buscarCandidatos(termo: string): Promise<CandidatoMusica[]> {
  const { data } = await api.get<CandidatoMusica[]>('/musicas/buscar-candidatos', {
    params: { q: termo },
  });
  return data;
}

export async function getMusica(id: number): Promise<Musica> {
  const { data } = await api.get<Musica>(`/musicas/${id}`);
  return data;
}

export async function criarMusica(input: MusicaInput): Promise<Musica> {
  const { data } = await api.post<Musica>('/musicas', input);
  return data;
}

export async function atualizarMusica(id: number, input: MusicaInput): Promise<Musica> {
  const { data } = await api.put<Musica>(`/musicas/${id}`, input);
  return data;
}

export async function apagarMusica(id: number): Promise<void> {
  await api.delete(`/musicas/${id}`);
}

export interface MusicaTocada {
  musica_id: number | null;
  nome: string;
  artista: string | null;
  capa_url: string | null;
  vezes: number;
}

/** Ranking das músicas mais tocadas (repertório dos cultos já realizados). */
export async function getMaisTocadas(limite = 3): Promise<MusicaTocada[]> {
  const { data } = await api.get<MusicaTocada[]>('/musicas/mais-tocadas', { params: { limite } });
  return data;
}

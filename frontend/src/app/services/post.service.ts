import { Injectable }       from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable }       from 'rxjs';
import { environment }      from '../../environments/environment';

export interface Post {
  id:            number;
  userId:        number;
  username:      string;
  fullName:      string;
  avatarUrl:     string;
  content:       string;
  mediaUrls:     string[];
  type:          'POST' | 'STORY' | 'REEL';
  visibility:    'PUBLIC' | 'FRIENDS' | 'PRIVATE';
  likesCount:    number;
  commentsCount: number;
  sharesCount:   number;
  isLiked:       boolean;
  viewsCount:    number;
  hashtags:      string[];
  createdAt:     string;
}

export interface PageResponse<T> {
  content:          T[];
  totalElements:    number;
  totalPages:       number;
  number:           number;
  size:             number;
  last:             boolean;
}

@Injectable({ providedIn: 'root' })
export class PostService {

  private readonly API = `${environment.apiUrl}/posts`;

  constructor(private http: HttpClient) {}

  // ─── Лента ────────────────────────────────────────────────
  getFeed(page = 0, size = 20): Observable<PageResponse<Post>> {
    return this.http.get<PageResponse<Post>>(`${this.API}/feed`, {
      params: new HttpParams().set('page', page).set('size', size)
    });
  }

  // ─── Посты пользователя ───────────────────────────────────
  getUserPosts(username: string, page = 0): Observable<PageResponse<Post>> {
    return this.http.get<PageResponse<Post>>(`${this.API}/user/${username}`, {
      params: new HttpParams().set('page', page).set('size', 12)
    });
  }

  // ─── Создать пост ─────────────────────────────────────────
  getPost(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.API}/${id}`);
  }

  createPost(data: { content: string; visibility?: string }, files?: File[]): Observable<Post> {
    const formData = new FormData();
    formData.append('post', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    files?.forEach(f => formData.append('files', f));
    return this.http.post<Post>(this.API, formData);
  }

  // ─── Удалить пост ─────────────────────────────────────────
  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  // ─── Лайк ─────────────────────────────────────────────────
  toggleLike(id: number): Observable<void> {
    return this.http.post<void>(`${this.API}/${id}/like`, {});
  }

  // ─── По хэштегу ───────────────────────────────────────────
  getByHashtag(tag: string, page = 0): Observable<PageResponse<Post>> {
    return this.http.get<PageResponse<Post>>(`${this.API}/hashtag/${tag}`, {
      params: new HttpParams().set('page', page)
    });
  }
}

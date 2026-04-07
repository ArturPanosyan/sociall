import { Injectable }   from '@angular/core';
import { HttpClient }   from '@angular/common/http';
import { Observable }   from 'rxjs';
import { environment }  from '../../environments/environment';

export interface UserProfile {
  id:             number;
  username:       string;
  email:          string;
  fullName:       string;
  bio:            string;
  avatarUrl:      string;
  coverUrl:       string;
  website:        string;
  location:       string;
  role:           string;
  isVerified:     boolean;
  isPrivate:      boolean;
  followersCount: number;
  followingCount: number;
  postsCount:     number;
  createdAt:      string;
}

@Injectable({ providedIn: 'root' })
export class UserService {

  private readonly API = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getProfile(username: string):  Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.API}/${username}/profile`);
  }

  getMe(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.API}/me`);
  }

  updateProfile(data: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.API}/me`, data);
  }

  uploadAvatar(file: File): Observable<UserProfile> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<UserProfile>(`${this.API}/me/avatar`, form);
  }

  toggleFollow(username: string): Observable<void> {
    return this.http.post<void>(`${this.API}/${username}/follow`, {});
  }

  getFollowers(username: string): Observable<any> {
    return this.http.get(`${this.API}/${username}/followers`);
  }

  getFollowing(username: string): Observable<any> {
    return this.http.get(`${this.API}/${username}/following`);
  }

  search(q: string): Observable<any> {
    return this.http.get(`${this.API}/search`, { params: { q } });
  }
}

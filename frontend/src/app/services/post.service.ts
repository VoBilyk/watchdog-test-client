import { Injectable } from '@angular/core';
import { HttpInternalService } from './http-internal.service';
import { Post } from '../models/post/post';
import { NewReaction } from '../models/reactions/newReaction';
import { NewPost } from '../models/post/new-post';
import { UpdatePost } from '../models/post/update-post';

@Injectable({ providedIn: 'root' })
export class PostService {
    public routePrefix = '/api/posts';

    constructor(private httpService: HttpInternalService) { }

    public getPosts() {
        return this.httpService.getFullRequest<Post[]>(`${this.routePrefix}`);
    }

    public createPost(post: NewPost) {
        return this.httpService.postFullRequest<Post>(`${this.routePrefix}`, post);
    }

    public updatePost(post: UpdatePost) {
        return this.httpService.putFullRequest<Post>(`${this.routePrefix}`, post);
    }

    public reactOnPost(reaction: NewReaction) {
        return this.httpService.postFullRequest<Post>(`${this.routePrefix}/react`, reaction);
    }

    public deletePost(id: number) {
        return this.httpService.deleteFullRequest<number>(`${this.routePrefix}/${id}`);
    }
}
import { Injectable } from '@angular/core';
import { HttpInternalService } from './http-internal.service';
import { NewComment } from '../models/comment/new-comment';
import { Comment } from '../models/comment/comment';
import { UpdateComment } from '../models/comment/update-comment';
import { NewReaction } from '../models/reactions/newReaction';

@Injectable({ providedIn: 'root' })
export class CommentService {
    public routePrefix = '/api/comments';

    constructor(private httpService: HttpInternalService) { }

    public createComment(post: NewComment) {
        return this.httpService.postFullRequest<Comment>(`${this.routePrefix}`, post);
    }

    public updateComment(comment: UpdateComment) {
        return this.httpService.putFullRequest<Comment>(`${this.routePrefix}`, comment)
    }

    public deleteComment(id: number) {
        return this.httpService.deleteFullRequest<number>(`${this.routePrefix}/${id}`)
    }

    public reactOnComment(reaction: NewReaction) {
        return this.httpService.postFullRequest<Comment>(`${this.routePrefix}/react`, reaction);
    }
}
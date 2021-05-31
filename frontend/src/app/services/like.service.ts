import { Injectable } from '@angular/core';
import { Post } from '../models/post/post';
import { Comment } from '../models/comment/comment';
import { NewReaction } from '../models/reactions/newReaction';
import { PostService } from './post.service';
import { User } from '../models/user';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ReactionType } from '../models/reactions/reactionType';
import { CommentService } from './comment.service';

@Injectable({ providedIn: 'root' })
export class LikeService {
    public constructor(private postService: PostService, private commentService: CommentService) { }

    public reactOnPost(post: Post, currentUser: User, reactionType: ReactionType) {
        const isLike: boolean = reactionType === ReactionType.Like ? true : false;
        const innerPost = post;
        const cachedReactions = innerPost.reactions;

        const reaction: NewReaction = {
            entityId: innerPost.id,
            isLike: isLike,
            userId: currentUser.id
        };

        let hasLike = innerPost.reactions.some(r => (r.user.id === currentUser.id) && (r.isLike));
        let hasDislike = innerPost.reactions.some(r => (r.user.id === currentUser.id) && (!r.isLike));

        if ((hasLike && reactionType === ReactionType.Dislike) || (hasDislike && reactionType === ReactionType.Like)) {
            innerPost.reactions = innerPost.reactions.filter((x) => x.user.id !== currentUser.id);
            innerPost.reactions = innerPost.reactions.concat({ isLike: isLike, user: currentUser });
        }
        else if (hasLike || hasDislike) {
            innerPost.reactions = innerPost.reactions.filter((x) => x.user.id !== currentUser.id);
        }
        else {
            innerPost.reactions = innerPost.reactions.concat({ isLike: isLike, user: currentUser })
        }

        return this.postService.reactOnPost(reaction).pipe(
            map(() => innerPost),
            catchError(() => {
                innerPost.reactions = cachedReactions;
                return of(innerPost);
            })
        );
    }

    public reactOnComment(comment: Comment, currentUser: User, reactionType: ReactionType) {
        const isLike: boolean = reactionType === ReactionType.Like ? true : false;
        const innerComment = comment;
        const cachedReactions = innerComment.reactions;

        const reaction: NewReaction = {
            entityId: innerComment.id,
            isLike: isLike,
            userId: currentUser.id
        };

        let hasLike = innerComment.reactions.some(r => (r.user.id === currentUser.id) && (r.isLike));
        let hasDislike = innerComment.reactions.some(r => (r.user.id === currentUser.id) && (!r.isLike));

        if ((hasLike && reactionType === ReactionType.Dislike) || (hasDislike && reactionType === ReactionType.Like)) {
            innerComment.reactions = innerComment.reactions.filter((x) => x.user.id !== currentUser.id);
            innerComment.reactions = innerComment.reactions.concat({ isLike: isLike, user: currentUser });
        }
        else if (hasLike || hasDislike) {
            innerComment.reactions = innerComment.reactions.filter((x) => x.user.id !== currentUser.id);
        }
        else {
            innerComment.reactions = innerComment.reactions.concat({ isLike: isLike, user: currentUser })
        }

        return this.commentService.reactOnComment(reaction).pipe(
            map(() => innerComment),
            catchError(() => {
                innerComment.reactions = cachedReactions;
                return of(innerComment);
            })
        );
    }
}

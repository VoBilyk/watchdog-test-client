using AutoMapper;
using System.Linq;
using System.Threading.Tasks;
using Thread_.NET.BLL.Services.Abstract;
using Thread_.NET.Common.DTO.Like;
using Thread_.NET.DAL.Context;

namespace Thread_.NET.BLL.Services
{
    public sealed class LikeService : BaseService
    {
        public LikeService(ThreadContext context, IMapper mapper) : base(context, mapper) { }

        public async Task ReactOnPost(NewReactionDTO reaction)
        {
            var existingReaction = _context.PostReactions.Where(x => x.UserId == reaction.UserId && x.PostId == reaction.EntityId && x.IsLike == reaction.IsLike);

            if (existingReaction.Any())
            {
                _context.PostReactions.RemoveRange(existingReaction);
                await _context.SaveChangesAsync();
                return;
            }

            var oppositeReaction = _context.PostReactions.Where(x => x.UserId == reaction.UserId && x.PostId == reaction.EntityId && reaction.IsLike != x.IsLike);

            if (oppositeReaction.Any())
            {
                _context.PostReactions.RemoveRange(oppositeReaction);
                await _context.SaveChangesAsync();
            }

            _context.PostReactions.Add(new DAL.Entities.PostReaction
            {
                PostId = reaction.EntityId,
                IsLike = reaction.IsLike,
                UserId = reaction.UserId
            });

            await _context.SaveChangesAsync();
        }

        public async Task ReactOnComment(NewReactionDTO reaction)
        {
            var existingReaction = _context.CommentReactions.Where(x => x.UserId == reaction.UserId && x.CommentId == reaction.EntityId && x.IsLike == reaction.IsLike);

            if (existingReaction.Any())
            {
                _context.CommentReactions.RemoveRange(existingReaction);
                await _context.SaveChangesAsync();
                return;
            }

            var oppositeReaction = _context.CommentReactions.Where(x => x.UserId == reaction.UserId && x.CommentId == reaction.EntityId && x.IsLike != reaction.IsLike);

            if (oppositeReaction.Any())
            {
                _context.CommentReactions.RemoveRange(oppositeReaction);
                await _context.SaveChangesAsync();
            }

            _context.CommentReactions.Add(new DAL.Entities.CommentReaction
            {
                CommentId = reaction.EntityId,
                IsLike = reaction.IsLike,
                UserId = reaction.UserId
            });

            await _context.SaveChangesAsync();
        }
    }
}
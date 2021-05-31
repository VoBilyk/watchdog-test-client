using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Thread_.NET.BLL.Services;
using Thread_.NET.Common.DTO.Like;
using Thread_.NET.Common.DTO.Post;
using Thread_.NET.Extensions;

namespace Thread_.NET.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class PostsController : ControllerBase
    {
        private readonly PostService _postService;
        private readonly LikeService _likeService;

        public PostsController(PostService postService, LikeService likeService)
        {
            _postService = postService;
            _likeService = likeService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<ICollection<PostDTO>>> Get()
        {
            return Ok(await _postService.GetAllPosts());
        }

        [HttpPost]
        public async Task<ActionResult<PostDTO>> CreatePost([FromBody] PostCreateDTO dto)
        {
            dto.AuthorId = this.GetUserIdFromToken();

            return Ok(await _postService.CreatePost(dto));
        }

        [HttpPut]
        public async Task<ActionResult<PostDTO>> UpdatePost([FromBody] PostUpdateDTO dto)
        {
            dto.AuthorId = this.GetUserIdFromToken();

            return Ok(await _postService.UpdatePost(dto));
        }

        [HttpPost("react")]
        public async Task<IActionResult> ReactOnPost(NewReactionDTO reaction)
        {
            reaction.UserId = this.GetUserIdFromToken();

            await _likeService.ReactOnPost(reaction);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteComment(int id)
        {
            await _postService.DeletePost(id);
            return NoContent();
        }
    }
}
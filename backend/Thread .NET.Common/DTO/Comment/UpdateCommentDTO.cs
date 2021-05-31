namespace Thread_.NET.Common.DTO.Comment
{
    public sealed class UpdateCommentDTO
    {
        public int Id { get; set; }
        public int AuthorId { get; set; }
        public int PostId { get; set; }
        public string Body { get; set; }
    }
}
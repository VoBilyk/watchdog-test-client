using System.Text.Json.Serialization;

namespace Thread_.NET.Common.DTO.Post
{
    public sealed class PostUpdateDTO
    {
        public int Id { get; set; }
        [JsonIgnore]
        public int AuthorId { get; set; }
        public string PreviewImage { get; set; }
        public string Body { get; set; }
    }
}
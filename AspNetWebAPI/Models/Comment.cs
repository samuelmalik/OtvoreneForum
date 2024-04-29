namespace AspNetCoreAPI.Models
{
    public class Comment
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public User User { get; set; }
        public int? PostId { get; set; }
        public Post Post { get; set; }
        public string Message { get; set; }
        public string Code { get; set; }
        public DateTime Date { get; set; }
        public ICollection<CommentLike> Likes { get; } = new List<CommentLike>();
    }
}

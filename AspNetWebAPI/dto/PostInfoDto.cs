namespace AspNetCoreAPI.dto
{
    public class PostInfoDto
    {
        public int Id { get; set; }
        public string Author { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Date { get; set; }
        public int Likes { get; set; }
        public bool IsLiked { get; set; }
    }
}

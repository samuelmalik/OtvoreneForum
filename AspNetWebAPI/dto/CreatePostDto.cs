namespace AspNetCoreAPI.dto
{
    public class CreatePostDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Code { get; set; }
        public string AuthorId { get; set; }
    }
}

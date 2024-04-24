namespace AspNetCoreAPI.dto
{
    public class CreateCommentDto
    {
        public string Message { get; set; }
        public string Code { get; set; }
        public string AuthorId { get; set; }
        public int? PostId { get; set; }
    }
}

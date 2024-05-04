namespace AspNetCoreAPI.dto
{
    public class NotificationDto
    {
        public int? PostId { get; set; }
        public string PostTitle { get; set; }
        public string Type { get; set; }
        public string AuthorUsername { get; set; }
        public string CreateTime { get; set; }
        
    }
}

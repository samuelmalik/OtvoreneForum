namespace AspNetCoreAPI.dto
{
    public class FileInfoDto
    {
        public int Id { get; set; }
        public string Author { get; set; }
        public string Path { get; set; }
        public string Name { get; set; }
        public string Extension { get; set; }
        public string Description { get; set; }
        public string Size { get; set; }
        public string AuthorId { get; set; }
        public string Group {  get; set; }
    }
}

namespace AspNetCoreAPI.Models
{
    public class UploadedFile
    {
        public int Id { get; set; }
        public string Author { get; set; }
        public string Path { get; set; }
        public string Name { get; set; }
        public string Extension { get; set; }
        public string Description { get; set; }
        public string Size { get; set; }
    }
}

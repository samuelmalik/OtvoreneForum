namespace AspNetCoreAPI.Models
{
    public class Note
    {
        public int Id { get; set; }
        public string CreatorId { get; set; }
        public string AddresserId { get; set; }
        public string Text { get; set; }
    }
}

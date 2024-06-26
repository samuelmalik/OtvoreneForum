﻿namespace AspNetCoreAPI.Models
{
    public class CommentLike
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public User User { get; set; }
        public int? CommentId { get; set; }
        public Comment Comment { get; set; }
        public bool IsAuthorNotificated { get; set; } = false;
        public DateTime Date { get; set; }
    }
}

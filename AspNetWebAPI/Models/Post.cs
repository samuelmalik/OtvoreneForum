﻿using System.Reflection.Metadata;

namespace AspNetCoreAPI.Models
{
    public class Post
    {
        public int Id { get; set; }
        public string UserId { get; set; } // Required foreign key property
        public User User { get; set; } = null!;
        public string Title { get; set; }
        public string Description { get; set; }
        public string Code { get; set; }
        public DateTime Date { get; set; }
        public ICollection<Comment> Comments { get; } = new List<Comment>();
        public ICollection<PostLike> Likes { get; } = new List<PostLike>();

    }
}

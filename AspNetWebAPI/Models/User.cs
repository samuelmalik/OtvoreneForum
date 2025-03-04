using Microsoft.AspNetCore.Identity;
using System.Reflection.Metadata;

namespace AspNetCoreAPI.Models
{
    public class User : IdentityUser
    {
        public ICollection<Post> Posts { get; } = new List<Post>();
        public ICollection<Comment> Comments { get; } = new List<Comment>();
        public ICollection<PostLike> Likes { get; } = new List<PostLike>();
        public ICollection<CommentLike> CommentLikes { get; } = new List<CommentLike>();
        public string Status { get; set; }
        public string Role { get; set; }
        public int? GroupId { get; set; }
        public Group Group { get; set; } = null!;
    }
}

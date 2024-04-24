using Microsoft.AspNetCore.Identity;

namespace AspNetCoreAPI.Models
{
    public class User : IdentityUser
    {
        public ICollection<Post> Posts { get; } = new List<Post>();
        public ICollection<Comment> Comments { get; } = new List<Comment>();
    }
}

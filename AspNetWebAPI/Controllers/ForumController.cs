using AspNetCoreAPI.Models;
using AspNetCoreAPI.Registration.dto;
using AspNetCoreAPI.Registration;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using AspNetCoreAPI.Data;
using System.Security.Claims;
using AspNetCoreAPI.Authentication.dto;

namespace AspNetCoreAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ForumController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ForumController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("allUsers")]
        public  IEnumerable<UserInfoDto> GetAllUsers()
        {
            var users = from u in _context.Users
                        select new UserInfoDto()
                        {
                            Username = u.UserName,
                        };
            return users;
        }

        [HttpPost("newPost")]
        public void CreatePost([FromBody] string title, [FromBody] string description)
        {
            Post newPost = new Post()
            {
                UserId = GetCurrentUser().Id,
                Title = title,
                Description = description,
                Date = DateTime.Now,
            };

            _context.Add(newPost);
            _context.SaveChanges();
                        
        }

        protected User? GetCurrentUser()
        {
            var userName = User.FindFirstValue(ClaimTypes.Name);

            return _context.Users.SingleOrDefault(user => user.UserName == userName);
        }


    }
}

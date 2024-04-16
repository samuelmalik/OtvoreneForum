using AspNetCoreAPI.Models;
using AspNetCoreAPI.Registration.dto;
using AspNetCoreAPI.Registration;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using AspNetCoreAPI.Data;
using System.Security.Claims;
using AspNetCoreAPI.dto;

namespace AspNetCoreAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ForumController : BaseController
    {
        private readonly ApplicationDbContext _context;

        public ForumController(ApplicationDbContext context) : base(context)
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
        public CreatePostDto CreatePost([FromBody] CreatePostDto createPost )
        {
            Post newPost = new Post()
            {
                UserId = "3b89e981-582f-4125-86f8-9a9820512b80",
                Title = createPost.Title,
                Description = createPost.Description,
                Date = DateTime.Now,
            };

            return new CreatePostDto { Description = newPost.Description, Title = newPost.Title };

         _context.Add(newPost);
         _context.SaveChanges();

            
                        
        }

        


    }
}

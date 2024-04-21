using AspNetCoreAPI.Models;
using AspNetCoreAPI.Registration.dto;
using AspNetCoreAPI.Registration;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using AspNetCoreAPI.Data;
using System.Security.Claims;
using AspNetCoreAPI.dto;
using Microsoft.EntityFrameworkCore;

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
                UserId = createPost.AuthorId,
                Title = createPost.Title,
                Description = createPost.Description,
                Code = createPost.Code,
                Date = DateTime.Now,
            };

            _context.Add(newPost);
            _context.SaveChanges();

            return new CreatePostDto { Description = newPost.Description, Title = newPost.Title };                 
        }

        [HttpGet("getAllPosts")]
        public IEnumerable <PostInfoDto> GetAllPosts()
        {
            var posts = from p in _context.Post.Include(p => p.User)
                        select new PostInfoDto()
                        {
                            Author = p.User.UserName,
                            Title = p.Title,
                            Description = p.Description,
                            Date = p.Date.ToString("dd MMMM yyyy HH:mm"),
                            Id = p.Id
                        };
            return posts;   
        }

        [HttpGet("getPostDetails")]
        public PostDetailsDto GetPostDetails(
             [FromQuery(Name = "id")] string id
            )
        {
            var post = from p in _context.Post.Include(p => p.User)
                       .Where(p => p.Id.ToString() == id)
                        select new PostDetailsDto()
                        {
                            Author = p.User.UserName,
                            Title = p.Title,
                            Description = p.Description,
                            Date = p.Date.ToString("dd MMMM yyyy HH:mm"),
                            Code = p.Code,
                        };
            return post.FirstOrDefault();
        }




    }
}

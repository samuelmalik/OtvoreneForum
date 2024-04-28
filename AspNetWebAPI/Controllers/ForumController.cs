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
        public IEnumerable <PostInfoDto> GetAllPosts(
            [FromQuery(Name = "currentUserId")] string currentUserId)
        {


            var posts = from p in _context.Post.Include(p => p.User)
                        select new PostInfoDto()
                        {
                            Author = p.User.UserName,
                            Title = p.Title,
                            Description = p.Description,
                            Date = p.Date.ToString("dd MMMM yyyy HH:mm"),
                            Id = p.Id,
                            Likes = _context.PostLikes
                               .Include(l => l.User)
                               .Include(l => l.Post)
                               .Where(l => l.PostId == p.Id).Count(),
                            IsLiked = _context.PostLikes
                               .Include(l => l.User)
                               .Include(l => l.Post)
                               .Where(l => l.User.Id == currentUserId && l.PostId == p.Id).Count() > 0
                        };
            return posts;   
        }

        [HttpGet("getPostDetails")]
        public PostDetailsDto GetPostDetails(
             [FromQuery(Name = "postId")] string postId,
             [FromQuery(Name = "currentUserId")] string currentUserId
            )
        {
            var post = from p in _context.Post.Include(p => p.User)
                       .Where(p => p.Id.ToString() == postId)
                        select new PostDetailsDto()
                        {
                            Author = p.User.UserName,
                            Title = p.Title,
                            Description = p.Description,
                            Date = p.Date.ToString("dd MMMM yyyy HH:mm"),
                            Code = p.Code,
                            Likes = _context.PostLikes
                               .Include(l => l.User)
                               .Include(l => l.Post)
                               .Where(l => l.PostId == p.Id).Count(),
                            IsLiked = _context.PostLikes
                               .Include(l => l.User)
                               .Include(l => l.Post)
                               .Where(l => l.User.Id == currentUserId && l.PostId == p.Id).Count() > 0
                        };
            return post.FirstOrDefault();
        }

        [HttpPost("newComment")]
        public CommentInfoDto CreateComment([FromBody] CreateCommentDto createComment)
        {
            Comment newComment = new Comment()
            {
                UserId = createComment.AuthorId,
                PostId = createComment?.PostId,
                Message = createComment.Message,
                Code = createComment.Code,
                Date = DateTime.Now,
            };
            var user = from u in _context.Users
                       .Where(u => u.Id == createComment.AuthorId)
                        select new User()
                        {
                            UserName = u.UserName,
                        };

            _context.Add(newComment);
            _context.SaveChanges();

            return new CommentInfoDto { Author = user.FirstOrDefault().UserName, Id = newComment.Id, Message = newComment.Message, Code = newComment.Code, Date = newComment.Date.ToString("dd MMMM yyyy HH:mm") };
        }

        [HttpGet("getCommentsByPost")]
        public IEnumerable<CommentInfoDto> GetCommentsByPost(
            [FromQuery(Name = "postId")] int postId)

        {
            var posts = from p in _context.Comment
                        .Include(p => p.User)
                        .Include(p => p.Post)
                        .Where(p => p.PostId == postId)
                        select new CommentInfoDto()
                        {
                            Id = p.Id,
                            Author = p.User.UserName,
                            Message = p.Message,
                            Date = p.Date.ToString("dd MMMM yyyy HH:mm"),
                            Code = p.Code,
                            Likes = 36
                        };
            return posts;
        }

        [HttpPost("addPostLike")]
        public AddPostLikeDto AddPostLike([FromBody] AddPostLikeDto addLike)
        {
            PostLike newLike = new PostLike()
            {
                UserId = addLike.UserId,
                PostId = addLike.PostId,
            };
           

            _context.Add(newLike);
            _context.SaveChanges();

            return new AddPostLikeDto { UserId = newLike.UserId, PostId = newLike.PostId };
        }

        [HttpPost("removePostLike")]
        public void RemovePostLike([FromBody] AddPostLikeDto removeLike)

        {
            foreach(var l in _context.PostLikes.Include(l => l.Post).Include(l => l.Post))
            {
                if(l.UserId == removeLike.UserId && l.PostId == removeLike.PostId)
                {
                    _context.Remove(l);
                }
            }
            _context.SaveChanges();
        }





    }
}

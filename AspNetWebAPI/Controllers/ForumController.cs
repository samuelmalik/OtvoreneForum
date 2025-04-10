﻿using AspNetCoreAPI.Models;
using AspNetCoreAPI.Registration.dto;
using AspNetCoreAPI.Registration;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using AspNetCoreAPI.Data;
using System.Security.Claims;
using AspNetCoreAPI.dto;
using Microsoft.EntityFrameworkCore;
using AspNetCoreAPI.Authentication.dto;
using Org.BouncyCastle.Asn1.X509;
using System.Globalization;

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

        //info about Timezone
        private TimeZoneInfo cestZone = TimeZoneInfo.FindSystemTimeZoneById("Central European Standard Time");


        [HttpPost("newPost")]
        public CreatePostDto CreatePost([FromBody] CreatePostDto createPost )
        {

            Post newPost = new Post()
            {
                UserId = createPost.AuthorId,
                Title = createPost.Title,
                Description = createPost.Description,
                Code = createPost.Code,
                Date = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, this.cestZone),
            };

            _context.Add(newPost);
            _context.SaveChanges();

            return new CreatePostDto { Description = newPost.Description, Title = newPost.Title };                 
        }

        [HttpGet("getAllPosts")]
        public IEnumerable <PostInfoDto> GetAllPosts(
            [FromQuery(Name = "currentUserId")] string currentUserId)
        {


            var posts = from p in _context.Post.Include(p => p.User).Include(p => p.User.Group)
                        select new PostInfoDto()
                        {
                            Author = p.User.UserName,
                            Title = p.Title,
                            Description = p.Description,
                            Date = p.Date.ToString("dd MMMM yyyy HH:mm", new CultureInfo("sk-SK")),
                            Id = p.Id,
                            Likes = _context.PostLikes
                               .Include(l => l.User)
                               .Include(l => l.Post)
                               .Where(l => l.PostId == p.Id).Count(),
                            IsLiked = _context.PostLikes
                               .Include(l => l.User)
                               .Include(l => l.Post)
                               .Where(l => l.User.Id == currentUserId && l.PostId == p.Id).Count() > 0,
                            Group = p.User.Group.Name
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
                            AuthorId = p.UserId,
                            Author = p.User.UserName,
                            Title = p.Title,
                            Description = p.Description,
                            Date = p.Date.ToString("dd MMMM yyyy HH:mm", new CultureInfo("sk-SK")),
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
                Date = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, this.cestZone),
            };
            var user = from u in _context.Users
                       .Where(u => u.Id == createComment.AuthorId)
                        select new User()
                        {
                            UserName = u.UserName,
                        };

            _context.Add(newComment);
            _context.SaveChanges();

            return new CommentInfoDto { Author = user.FirstOrDefault().UserName, Id = newComment.Id, Message = newComment.Message, Code = newComment.Code, Date = newComment.Date.ToString("dd MMMM yyyy HH:mm", new CultureInfo("sk-SK")) };
        }

        [HttpGet("getCommentsByPost")]
        public IEnumerable<CommentInfoDto> GetCommentsByPost(
            [FromQuery(Name = "postId")] int postId,
            [FromQuery(Name = "currentUserId")] string currentUserId)

        {
            var posts = from p in _context.Comment
                        .Include(p => p.User)
                        .Include(p => p.Post)
                        .Where(p => p.PostId == postId)
                        select new CommentInfoDto()
                        {
                            Id = p.Id,
                            Author = p.User.UserName,
                            AuthorId = p.User.Id,
                            Message = p.Message,
                            Date = p.Date.ToString("dd MMMM yyyy HH:mm", new CultureInfo("sk-SK")),
                            Code = p.Code,
                            Likes = _context.CommentLikes
                               .Include(l => l.User)
                               .Include(l => l.Comment)
                               .Where(l => l.CommentId == p.Id).Count(),
                            IsLiked = _context.CommentLikes
                               .Include(l => l.User)
                               .Include(l => l.Comment)
                               .Where(l => l.User.Id == currentUserId && l.CommentId == p.Id).Count() > 0
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
                Date = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, this.cestZone),
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

        [HttpPost("addCommentLike")]
        public AddCommentLikeDto AddCommentLike([FromBody] AddCommentLikeDto addLike)
        {
            CommentLike newLike = new CommentLike()
            {
                UserId = addLike.UserId,
                CommentId = addLike.CommentId,
                Date = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, this.cestZone),
            };


            _context.Add(newLike);
            _context.SaveChanges();

            return new AddCommentLikeDto { UserId = newLike.UserId, CommentId = newLike.CommentId };
        }

        [HttpPost("removeCommentLike")]
        public void RemoveCommentLike([FromBody] AddCommentLikeDto removeLike)

        {
            foreach (var l in _context.CommentLikes.Include(l => l.Comment).Include(l => l.User))
            {
                if (l.UserId == removeLike.UserId && l.CommentId == removeLike.CommentId)
                {
                    _context.Remove(l);
                }
            }
            _context.SaveChanges();
        }

        [HttpGet("getNotifications")]
        public IEnumerable<NotificationDto> GetNotifications(
            [FromQuery(Name = "currentUserId")] string currentUserId)
        {
            try { 
                List<NotificationDto> notifications = new List<NotificationDto>();

                foreach (var item in _context.Comment.Include(c => c.Post).Include(c => c.User).Where(c => c.Post.UserId == currentUserId && c.IsAuthorNotificated == false))
                {
                    notifications.Add(new NotificationDto
                    {
                        PostId = item.PostId,
                        PostTitle = item.Post.Title,
                        Type = "comment",
                        AuthorUsername = item.User.UserName,
                        CreateTime = item.Date.ToString("dd MMMM yyyy HH:mm"),
                        ItemId = item.Id
                    });
                }

                foreach (var item in _context.PostLikes.Include(p => p.Post).Include(p => p.User).Where(p => p.Post.UserId == currentUserId && p.IsAuthorNotificated == false))
                {
                    notifications.Add(new NotificationDto
                    {
                        PostId = item.PostId,
                        PostTitle = item.Post.Title,
                        Type = "postLike",
                        AuthorUsername = item.User.UserName,
                        CreateTime = item.Date.ToString("dd MMMM yyyy HH:mm"),
                        ItemId = item.Id
                    });
                }

                foreach (var item in _context.CommentLikes.Include(cl => cl.Comment.Post).Include(cl => cl.User).Where(cl => cl.Comment.UserId == currentUserId && cl.IsAuthorNotificated == false))
                {
                    notifications.Add(new NotificationDto
                    {
                        PostId = item.Comment.PostId,
                        PostTitle = item.Comment.Post.Title,
                        Type = "commentLike",
                        AuthorUsername = item.User.UserName,
                        CreateTime = item.Date.ToString("dd MMMM yyyy HH:mm"),
                        ItemId = item.Id
                    });
                }

                return notifications.OrderByDescending(n => DateTime.Parse(n.CreateTime));
            } catch(Exception e)
            {
                throw new Exception("E:", e);
            }


        }

        [HttpGet("hasNotifications")]
        public bool HasNotifications(
            [FromQuery(Name = "currentUserId")] string currentUserId)
        {
            return GetNotifications(currentUserId).ToList().Count() != 0;
        }

        [HttpPut("makeCommentSeen")]
        public void MakeCommentSeen([FromBody] int itemId)

        {
            foreach (var c in _context.Comment)
            {
                if (c.Id == itemId)
                {
                    c.IsAuthorNotificated = true;
                    _context.Update(c);
                }
            }
            _context.SaveChanges();
        }
        [HttpPut("makePostLikeSeen")]
        public void MakePostLikeSeen([FromBody] int itemId)

        {
            foreach (var l in _context.PostLikes)
            {
                if (l.Id == itemId)
                {
                    l.IsAuthorNotificated = true;
                    _context.Update(l);
                }
            }
            _context.SaveChanges();
        }
        [HttpPut("makeCommentLikeSeen")]
        public void MakeCommentLikeSeen([FromBody] int itemId)

        {
            foreach (var l in _context.CommentLikes)
            {
                if (l.Id == itemId)
                {
                    l.IsAuthorNotificated = true;
                    _context.Update(l);
                }
            }
            _context.SaveChanges();
        }

        [HttpGet("getStatus")]
        public CurrentUserDetailsDto GetStatus(
            [FromQuery(Name = "currentUserId")] string currentUserId)
        {
            var status = from p in _context.Users.Where(u => u.Id == currentUserId)
                         select new CurrentUserDetailsDto()
                         {
                             Status = p.Status,
                         };
            return status.FirstOrDefault();
        }

        [HttpPut("updateStatus")]
        public void UpdateStatus([FromBody] UpdateStatusDto updateStatusDto)
        {
            var u = _context.Users.Where(u => u.Id == updateStatusDto.UserId).FirstOrDefault();
                    u.Status = updateStatusDto.Status;
                    _context.Update(u);
            _context.SaveChanges();
        }

        [HttpDelete]
        [Route("deletePost")]
        public IActionResult DeletePost([FromQuery(Name = "postId")] int postId)
        {
            //deleting from DB
            var result = _context.Post.Include(p => p.Likes)
            .FirstOrDefault(p => p.Id == postId);
            var comments = _context.Comment.Include(c => c.Likes).Where(c => c.PostId == result.Id);
            if (result != null)
            {
                foreach (var comment in comments)
                {
                    foreach(var like in comment.Likes)
                    {
                        _context.CommentLikes.Remove(like);
                    }
                    _context.Comment.Remove(comment);
                }
                foreach(var like in result.Likes)
                {
                    _context.PostLikes.Remove(like);
                }
                _context.Post.Remove(result);
                _context.SaveChanges();
            }
            return Ok(postId);
        }

        [HttpDelete]
        [Route("deleteComment")]
        public IActionResult DeleteComment([FromQuery(Name = "commentId")] int commentId)
        {
            //deleting from DB
            var comment = _context.Comment.Include(c => c.Likes).Where(c => c.Id == commentId).FirstOrDefault();
            if (comment != null)
            {
                    foreach (var like in comment.Likes)
                    {
                        _context.CommentLikes.Remove(like);
                    }
                    _context.Comment.Remove(comment);

                _context.Comment.Remove(comment);
                _context.SaveChanges();
            }
            return Ok(commentId);
        }





    }
}

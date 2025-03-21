﻿using Microsoft.EntityFrameworkCore.Query.SqlExpressions;

namespace AspNetCoreAPI.dto
{
    public class CommentInfoDto
    {
        public int Id { get; set; }
        public string Author { get; set; }
        public string AuthorId { get; set; }
        public string Message { get; set; }
        public string Date { get; set; }
        public string Code { get; set; }
        public int Likes { get; set; }
        public bool IsLiked { get; set; }
    }
}

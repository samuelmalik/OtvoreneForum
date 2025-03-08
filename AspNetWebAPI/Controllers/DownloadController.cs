using AspNetCoreAPI.Data;
using AspNetCoreAPI.dto;
using AspNetCoreAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AspNetCoreAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class DownloadController : BaseController
    {
        private readonly ApplicationDbContext _context;

        public DownloadController(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllfiles()
        {
            try
            {
                var files = from f in _context.Files select new FileInfoDto
                {
                    Id = f.Id,
                    Author = _context.Users.Where(u => u.Id == f.AuthorId).FirstOrDefault().UserName,
                    Path = f.Path,
                    Name = f.Name,
                    Extension = f.Extension,
                    Description = f.Description,
                    Size = f.Size,
                    AuthorId = f.AuthorId,
                    Group = _context.Users.Where(u => u.Id == f.AuthorId).Include(u => u.Group).FirstOrDefault().Group.Name
                };

                return Ok(files);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] UploadFileDto fileDetails)
        {
            try
            {
                if (fileDetails is null)
                {
                    return BadRequest("User object is null");
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest("Invalid model object");
                }

               UploadedFile file = new UploadedFile();
               {
                    file.Author = fileDetails.Author;
                    file.Description = fileDetails.Description;
                    file.Path = fileDetails.Path;
                    file.Name = fileDetails.Name;
                    file.Extension = fileDetails.Extension;
                    file.Size = fileDetails.Size;
                    file.AuthorId = fileDetails.AuthorId;
               }

                _context.Add(file);
                await _context.SaveChangesAsync();

                return StatusCode(201);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex}");
            }
        }



    }
}

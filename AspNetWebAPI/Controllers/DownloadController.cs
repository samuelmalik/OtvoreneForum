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
                var files = await _context.Files.ToListAsync();

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

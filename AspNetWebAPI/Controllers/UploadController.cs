using AspNetCoreAPI.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Net.Http.Headers;

namespace AspNetCoreAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UploadController : BaseController
    {
        private readonly ApplicationDbContext _context;

        public UploadController(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        [HttpPost, DisableRequestSizeLimit]
        public IActionResult Upload()
        {
            try
            {
                var file = Request.Form.Files[0];
                var folderName = Path.Combine("Resources", "UploadedFiles", file.FileName);
                var pathToSave = Path.Combine(Directory.GetCurrentDirectory(), folderName);
                if (file.Length > 0)
                {
                    var savingFileName = DateTime.Now.ToString("yyyyMMddHHmmssffff") + ContentDispositionHeaderValue.Parse(file.ContentDisposition).FileName.Trim('"');
                    var fileName = ContentDispositionHeaderValue.Parse(file.ContentDisposition).FileName.Trim('"');
                    var fullPath = Path.Combine(pathToSave, savingFileName);
                    var dbPath = Path.Combine(folderName, savingFileName);
                    var extension = Path.GetExtension(fullPath);
                    long length = file.Length;
                    string size = length.ToString() + " B";
                    // choosing suitable multiplication of bytes
                    if(length > 10 * 1024 * 1024)
                    {
                        size = ((length/1024)/1024).ToString() + " MB";
                    } else if(length > (10 * 1024))
                    {
                        size = (length / 1024).ToString() + " kB";
                    }
                    

                    using (var stream = new FileStream(folderName, FileMode.Create))
                    {
                        file.CopyTo(stream);
                    }
                    return Ok(new { dbPath, fileName, extension, size});
                }
                else
                {
                    return BadRequest();
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex}");
            }
        }

    }
}

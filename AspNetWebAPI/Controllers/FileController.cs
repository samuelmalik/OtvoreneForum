using AspNetCoreAPI.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using System;
using System.IO;
using System.Net.Http.Headers;

namespace AspNetCoreAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class FileController : BaseController
    {
        private readonly ApplicationDbContext _context;

        public FileController(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        [HttpPost, DisableRequestSizeLimit]
        [Route("upload")]
        public IActionResult Upload()
        {
            try
            {
                var file = Request.Form.Files[0];
                var folderName = Path.Combine("Resources", "UploadedFiles");
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
                    

                    using (var stream = new FileStream(fullPath, FileMode.Create))
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

        [HttpGet, DisableRequestSizeLimit]
        [Route("download")]
        public async Task<IActionResult> Download([FromQuery(Name = "fileUrl")] string fileUrl)
        {
            //string fileUrl = "Resources\\UploadedFiles\\202501230949487656ELS_Cvicenie1_Juris_4AI.pptx";
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), fileUrl);
            if (!System.IO.File.Exists(filePath))
                return NotFound(filePath);
            var memory = new MemoryStream();
            await using (var stream = new FileStream(filePath, FileMode.Open))
            {
                await stream.CopyToAsync(memory);
            }
            memory.Position = 0;
            return File(memory, GetContentType(filePath), filePath);
        }

        private string GetContentType(string path)
        {
            var provider = new FileExtensionContentTypeProvider();
            string contentType;

            if (!provider.TryGetContentType(path, out contentType))
            {
                contentType = "application/octet-stream";
            }

            return contentType;
        }

        [HttpDelete, DisableRequestSizeLimit]
        [Route("delete")]
        public IActionResult Delete([FromQuery(Name = "path")] string path)
        {
            //deleting from DB
            var result = _context.Files
            .FirstOrDefault(e => e.Path == path);
            if (result != null)
            {
                _context.Files.Remove(result);
                _context.SaveChanges();
            }

            //deleting from BE
            var fullPath = Path.Combine(Directory.GetCurrentDirectory(), path);

            if (System.IO.File.Exists(fullPath))
            {
                System.IO.File.Delete(fullPath);
            }

            return Ok(fullPath);
        }


    }
}

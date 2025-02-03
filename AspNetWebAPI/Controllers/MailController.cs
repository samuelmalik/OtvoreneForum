using AspNetCoreAPI.Models;
using AspNetCoreAPI.Service;
using Microsoft.AspNetCore.Mvc;

namespace AspNetCoreAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class MailController : ControllerBase
    {
        private readonly ICustomMailService _mailService;

        public MailController(ICustomMailService mailService)
        {
            _mailService = mailService;
        }

        [HttpPost("SendMail")]
        public IActionResult SendMail([FromBody] MailData mailData)
        {
            var result = _mailService.SendMail(mailData);
            if (result)
            {
                return Ok("Mail bol úspešne odoslaný.");
            }
            else
            {
                return BadRequest("Nepodarilo sa poslať mail.");
            }
        }
    }
}
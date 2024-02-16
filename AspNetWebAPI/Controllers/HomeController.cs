using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AspNetCoreAPI.Controllers
{
    [ApiController]
    [Authorize]
    [Route("[controller]")]
    public class HomeController : Controller
    {
        [HttpGet]
        public IEnumerable<string> Get() => new List<string> { "Roman", "Martin", "Peter"};
    }
}

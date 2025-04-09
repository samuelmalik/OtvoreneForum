using AspNetCoreAPI.Authentication.dto;
using AspNetCoreAPI.Data;
using AspNetCoreAPI.dto;
using AspNetCoreAPI.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AspNetCoreAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class GroupController : BaseController
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;

        public GroupController(ApplicationDbContext context, UserManager<User> userManager) : base(context)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpPost("newGroup")]
        public GetGroupsDto CreateGroup([FromBody] CreateGroupDto createGroup)
        {

            Group newGroup = new Group()
            {
                Name = createGroup.Name,
            };

            _context.Add(newGroup);
            _context.SaveChanges();

            return new GetGroupsDto { Name = createGroup.Name, Id = newGroup.Id, Users = Enumerable.Empty<UserInfoDto>() };
        }

        [HttpGet("getCurrentUserGroupId")]
        public int GetCurrentUserGroupId([FromQuery(Name = "userId")] string userId)
        {

            int? groupId = _context.Users.Where(u => u.Id == userId).FirstOrDefault().GroupId;
                          

            if(groupId == null)
            {
                return -1;
            }
            return (int)groupId;
        }

        [HttpGet("getGroups")]
        public IEnumerable <GetGroupsDto> GetGroups()
        {

            var groups = from g in _context.Groups.Include(g => g.Users)
                         select new GetGroupsDto {
                             Name = g.Name,
                             Id = g.Id,
                             Users = from u in g.Users.OrderBy(c => c.Role).ToArray()
                                     select new UserInfoDto
                                     {
                                         Id = u.Id,
                                         Username = u.UserName,
                                         Role = u.Role,
                                     }

                         };

            return groups;
        }

        [HttpPut("addUserToGroup")]
        public async Task<IActionResult> AddUserToGroup([FromBody] AddUserToGroupDto info)
        {
            

            var user = _context.Users.Where(u => u.Id == info.UserId).FirstOrDefault();
            if (info.GroupId == -1)
            {
                user.GroupId = null;
            }
            else
            {
                user.GroupId = info.GroupId;
            }
            


            _context.Update(user);
            _context.SaveChanges();

            return Ok(user);
        }

        [HttpGet("unassignedUsers")]
        public IEnumerable<UserInfoDto> GetUnassignedUsers()
        {
            var users = from u in _context.Users.Where(u => u.GroupId == null && u.Role != "admin" && u.Role != "root").OrderBy(c => c.Role).ToArray()
                        select new UserInfoDto()
                        {
                            Id = u.Id,
                            Username = u.UserName,
                            Status = u.Status,
                            Role = u.Role
                        };
            return users;
        }

        [HttpDelete("deleteGroup")]
        public IEnumerable<UserInfoDto> DeleteGroup([FromQuery(Name = "groupId")] int groupId)
        {
            var group = _context.Groups.Where(g => g.Id == groupId).FirstOrDefault();

            var users = _context.Users.Where(u => u.GroupId == groupId);

            foreach (var user in users)
            {
                user.GroupId = null;
            }

            _context.Groups.Remove(group);
            _context.SaveChanges();
            return GetUnassignedUsers();
        }
    }
}

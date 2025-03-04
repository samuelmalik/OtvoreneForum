using AspNetCoreAPI.Models;
using AspNetCoreAPI.Authentication.dto;

namespace AspNetCoreAPI.dto
{
    public class GetGroupsDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public IEnumerable<UserInfoDto> Users { get; set; }
    }
}

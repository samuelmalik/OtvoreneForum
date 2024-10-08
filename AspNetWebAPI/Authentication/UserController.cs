using AspNetCoreAPI.Authentication.dto;
using AspNetCoreAPI.Data;
using AspNetCoreAPI.Models;
using AspNetCoreAPI.Registration.dto;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;

namespace AspNetCoreAPI.Registration
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly JwtHandler _jwtHandler;
        private readonly ApplicationDbContext _context;

        public UserController(UserManager<User> userManager, JwtHandler jwtHandler, ApplicationDbContext context)
        {
            _userManager = userManager;
            _jwtHandler = jwtHandler;
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterUser([FromBody] UserRegistrationDto userRegistrationDto)
        {
            if (userRegistrationDto == null || !ModelState.IsValid)
                return BadRequest();

            var user = new User { UserName = userRegistrationDto.Email,  Email = userRegistrationDto.Email, Status = "" };
            var result = await _userManager.CreateAsync(user, userRegistrationDto.Password);
            var claim = await _userManager.AddClaimAsync(user, new System.Security.Claims.Claim("role", "student"));
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description);

                return BadRequest(new UserRegistrationResponseDto { Errors = errors });
            }

            return StatusCode(201);
        }

        [HttpPost("add-claim")]
        public async Task<IActionResult> AddClaim([FromBody] ClaimDto claimDto)
        {
            var user = await _userManager.FindByIdAsync(claimDto.userId);
            var claims = await _userManager.GetClaimsAsync(user);
            var deleted = await _userManager.RemoveClaimsAsync(user, claims);
            var result = await _userManager.AddClaimAsync(user, new System.Security.Claims.Claim(claimDto.type, claimDto.value));

            return Ok(result.Succeeded);
        }




        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto userLoginDto)
        {
            var user = await _userManager.FindByEmailAsync(userLoginDto.Email);

            if (user == null || !await _userManager.CheckPasswordAsync(user, userLoginDto.Password))
                return Ok(new UserLoginResponseDto { ErrorMessage = "Invalid Authentication", IsAuthSuccessful = false });

            var signingCredentials = _jwtHandler.GetSigningCredentials();
            var claims = _jwtHandler.GetClaims(user);
            claims.AddRange(await _userManager.GetClaimsAsync(user));
            var tokenOptions = _jwtHandler.GenerateTokenOptions(signingCredentials, claims);
            var token = new JwtSecurityTokenHandler().WriteToken(tokenOptions);

            return Ok(new UserLoginResponseDto { IsAuthSuccessful = true, Token = token, Username = user.UserName, Id = user.Id });
        }

        [HttpPost("changePassword")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
        {
            var user = _context.Users.Where(u => u.Id == changePasswordDto.Id).FirstOrDefault();
            var passwordCorrect = await _userManager.CheckPasswordAsync(user, changePasswordDto.OldPassword);

            var result = await _userManager.ChangePasswordAsync(user, changePasswordDto.OldPassword, changePasswordDto.NewPassword);
            
            if (!passwordCorrect)
            {
                return Ok(new ChangePasswordRespone { ErrorMessage = "Zadali ste nesprávne heslo"});
            } else if (!result.Succeeded)
            {
                return Ok(new ChangePasswordRespone { ErrorMessage = "Heslo musí mať aspoň 6 znakov, obsahovať číslo, malé a veľké písmeno a špeciálny znak"});
            } else
            {
                return Ok(new ChangePasswordRespone { ErrorMessage = "Heslo úspešne zmenené"});
            }
        }

        [HttpPost("changeUsername")]
        public async Task<IActionResult> ChangeUsername([FromBody] ChangePasswordDto changePasswordDto)
        {
            var user = _context.Users.Where(u => u.Id == changePasswordDto.Id).FirstOrDefault();

            var result = await _userManager.SetUserNameAsync(user, changePasswordDto.NewPassword);

            return Ok(result.Succeeded);

            
        }
    }
}

﻿using AspNetCoreAPI.Authentication.dto;
using AspNetCoreAPI.Data;
using AspNetCoreAPI.dto;
using AspNetCoreAPI.Models;
using AspNetCoreAPI.Registration.dto;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

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

            var user = new User { UserName = userRegistrationDto.Email,  Email = userRegistrationDto.Email, Status = "", Role = "student" };
            var result = await _userManager.CreateAsync(user, userRegistrationDto.Password);
            if (result.Succeeded)
            {
                var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                return Ok(new { message = $"Prosím overte svoju adresu {code}" });
            }
            var claim = await _userManager.AddClaimAsync(user, new System.Security.Claims.Claim("role", "student"));
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description);

                return BadRequest(new UserRegistrationResponseDto { Errors = errors });
            }

            return StatusCode(201);
        }

        [HttpPost]
        [Route("EmailVerification")]
        public async Task<IActionResult> EmailVerification(string? email, string? code)
            {
                if (email == null || code == null)
                    return BadRequest("Invalid Payload");

                var user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                    return BadRequest("Invalid Payload");

                var IsVerified = await _userManager.ConfirmEmailAsync(user, code);
                if (IsVerified.Succeeded)
                    return Ok(new
                    {
                        message = "email confirmed"
                    });
                return BadRequest("something went wrong");
            }

        [HttpPost("add-claim")]
        public async Task<IActionResult> AddClaim([FromBody] ClaimDto claimDto)
            // role: student/master/admin
        {
            //nahradit pomocou replace claim 
            var user = await _userManager.FindByIdAsync(claimDto.userId);
            var claims = await _userManager.GetClaimsAsync(user);
            var deleted = await _userManager.RemoveClaimsAsync(user, claims);
            var result = await _userManager.AddClaimAsync(user, new System.Security.Claims.Claim(claimDto.type, claimDto.value));

            return Ok(result.Succeeded);
        }

        [HttpPost("changeRole")]
        public async Task<IActionResult> ChangeRole([FromBody] ClaimDto claimDto)
        {
           await AddClaim(claimDto);
            var user = _context.Users.Where(u => u.Id ==  claimDto.userId).FirstOrDefault();
            user.Role = claimDto.value;
            _context.Update(user);
            _context.SaveChanges();
            

           return(Ok(claimDto));
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

        [HttpGet("allUsers")]
        public IEnumerable<UserInfoDto> GetAllUsers()
        {
            //var claims = ClaimsPrincipal.Current.Identities.First().Claims.ToList();
            var users = from u in _context.Users
                        select new UserInfoDto()
                        {
                            Id = u.Id,
                            Username = u.UserName,
                            Status = u.Status,
                            Role = u.Role

                        };
            return users;
        }

        
        [HttpGet("getNote")]
        //[Authorize(Policy = "NotStudents")]
        public NoteDto GetNote(
            [FromQuery(Name = "creatorId")] string creatorId,
            [FromQuery(Name = "addresserId")] string addresserId)
        {
            var note = _context.Notes.Where(n => n.CreatorId == creatorId && n.AddresserId == addresserId).FirstOrDefault();
          
            if(note == null)
            {
                return new NoteDto
                {
                    Note = ""
                };
            }
            return new NoteDto
            {
                Note = note.Text
        };
    }

        [HttpPut("setNote")]
        public async Task<IActionResult> UpdateNote([FromBody] UpdateNoteDto updateNoteDto)
        {
            var note = _context.Notes.Where(n => n.CreatorId == updateNoteDto.CreatorId && n.AddresserId == updateNoteDto.AddresserId).FirstOrDefault();

            if(note == null)
            {
                _context.Notes.Add(new Note
                {
                    CreatorId = updateNoteDto.CreatorId,
                    AddresserId = updateNoteDto.AddresserId,
                    Text = updateNoteDto.Text,
                });
            } else
            {
                note.Text = updateNoteDto.Text;
            }

            _context.SaveChangesAsync();
            return Ok(updateNoteDto);
        }
    }
}

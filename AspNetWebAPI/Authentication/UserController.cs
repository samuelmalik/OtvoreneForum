using System.IdentityModel.Tokens.Jwt;
using AspNetCoreAPI.Authentication.dto;
using AspNetCoreAPI.Data;
using AspNetCoreAPI.dto;
using AspNetCoreAPI.Models;
using AspNetCoreAPI.Registration;
using AspNetCoreAPI.Registration.dto;
using AspNetCoreAPI.Service;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace AspNetCoreAPI.Authentication
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly JwtHandler _jwtHandler;
        private readonly ApplicationDbContext _context;
        private readonly ICustomMailService _mailService;

        public UserController(UserManager<User> userManager, JwtHandler jwtHandler, ApplicationDbContext context, ICustomMailService mailService)
        {
            _userManager = userManager;
            _jwtHandler = jwtHandler;
            _context = context;
            _mailService = mailService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterUser([FromBody] UserRegistrationDto? userRegistrationDto)
        {
            if (userRegistrationDto == null || !ModelState.IsValid)
                return BadRequest();

            var user = new User
            {
                UserName = userRegistrationDto.Email,
                Email = userRegistrationDto.Email,
                Status = "",
                Role = "student"
            };

            var result = await _userManager.CreateAsync(user, userRegistrationDto.Password);

            if (result.Succeeded)
            {

                var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);


                var frontendUrl = "https://open-forum-c4744.web.app/email-verification";


                var confirmationLink = $"https://open-forum-c4744.web.app/email-verification?email={user.Email}&code={code}";

                // Priprav dáta na odoslanie emailu
                var mailData = new MailData
                {
                    EmailToId = user.Email,
                    EmailToName = user.UserName,
                    EmailSubject = "Confirm Your Email",
                    EmailBody = $"Please confirm your email by clicking on the link below:\n <a href='{confirmationLink}'>Verify Email</a>"
                };

                // Pošli email
                var mailResult = _mailService.SendMail(mailData);

                if (mailResult)
                {
                    return Ok(new { message = "Registration successful. Please check your email to confirm your account." });
                }
                else
                {
                    return StatusCode(500, "User created but email failed to send.");
                }
            }

            var errors = result.Errors.Select(e => e.Description);
            return BadRequest(new UserRegistrationResponseDto { Errors = errors });
        }

        [HttpGet("EmailVerification")]
        public async Task<IActionResult> EmailVerification([FromQuery] string email, [FromQuery] string code)
        {
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(code))
                return BadRequest("Invalid Payload");

            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
                return BadRequest("Invalid Payload");

            var IsVerified = await _userManager.ConfirmEmailAsync(user, code);
            if (IsVerified.Succeeded)
                return Ok(new
                {
                    message = "Email confirmed"
                });
            return BadRequest("Something went wrong");
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
                return Ok(new UserLoginResponseDto { ErrorMessage = "Wrong username or password", IsAuthSuccessful = false });
            var checkConfirmed = await _userManager.IsEmailConfirmedAsync(user);
            if (!checkConfirmed)
                return Ok(new UserLoginResponseDto { ErrorMessage = "Email is not confirmed", IsAuthSuccessful = false });

            var signingCredentials = _jwtHandler.GetSigningCredentials();
            var claims = _jwtHandler.GetClaims(user);
            claims.AddRange(await _userManager.GetClaimsAsync(user));
            var tokenOptions = _jwtHandler.GenerateTokenOptions(signingCredentials, claims);
            var token = new JwtSecurityTokenHandler().WriteToken(tokenOptions);

            return Ok(new UserLoginResponseDto { IsAuthSuccessful = true, Token = token, Username = user.UserName, Id = user.Id });
        }
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
        {
            if (string.IsNullOrEmpty(forgotPasswordDto.Email))
                return BadRequest("Email je povinný.");

            var user = await _userManager.FindByEmailAsync(forgotPasswordDto.Email);
            if (user == null)
                return NotFound("Používateľ s týmto emailom neexistuje.");

            // Generovanie nového hesla
            var random = new Random();
            var newPassword = $"P{random.Next(100, 999)}a!{random.Next(10, 99)}";
            var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, resetToken, newPassword);

            if (result.Succeeded)
            {
                // Príprava a odoslanie emailu
                var mailData = new MailData
                {
                    EmailToId = user.Email,
                    EmailToName = user.UserName,
                    EmailSubject = "Obnova hesla",
                    EmailBody = $"Vaše nové heslo je: {newPassword}"
                };

                var mailResult = _mailService.SendMail(mailData);
                if (mailResult)
                {
                    return Ok(new { message = "Nové heslo bolo odoslané na váš email." });
                }
                return StatusCode(500, "Nepodarilo sa odoslať email.");
            }

            return BadRequest("Obnova hesla zlyhala.");
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

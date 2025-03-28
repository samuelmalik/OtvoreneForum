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
using Microsoft.EntityFrameworkCore;


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
        private readonly CaptchaValidationService _captchaValidationService;


        public UserController(UserManager<User> userManager, JwtHandler jwtHandler, ApplicationDbContext context, ICustomMailService mailService,  CaptchaValidationService captchaValidationService)
        {
            _userManager = userManager;
            _jwtHandler = jwtHandler;
            _context = context;
            _mailService = mailService;
            _captchaValidationService = captchaValidationService;

        }

       [HttpPost("register")]
       public async Task<IActionResult> RegisterUser([FromBody] UserRegistrationDto? userRegistrationDto)
        {
        if (userRegistrationDto == null || !ModelState.IsValid)
            return Ok(new { success = false, message = "Invalid registration data." });

        var isCaptchaValid = await _captchaValidationService.ValidateCaptchaToken(userRegistrationDto.CaptchaToken);
        if (!isCaptchaValid)
        {
            return BadRequest(new { success = false, message = "Invalid reCAPTCHA token." });
        }

        var user = new User
        {
            UserName = userRegistrationDto.UserName,
            Email = userRegistrationDto.Email,
            Status = "",
            Role = "student",
            IsApproved = false
        };

        var result = await _userManager.CreateAsync(user, userRegistrationDto.Password);
        var claim = await _userManager.AddClaimAsync(user, new System.Security.Claims.Claim("role", "student"));

            if (result.Succeeded)
        {
            var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var confirmationLink = $"https://openforum.tech/email-verification?email={user.Email}&code={code}";

            var mailData = new MailData
            {
                EmailToId = user.Email,
                EmailToName = user.UserName,
                EmailSubject = "Potvrďte svoju e-mailovú adresu",
                EmailBody = "<h2>Prosím potvrďte svojú e-mailovú adresu kliknutím na link:</h2>" +
                            $"<a href='{confirmationLink}'>Overiť e-mail</a>"
            };

            var mailResult = _mailService.SendMail(mailData);

            if (mailResult)
            {

                return Ok(new UserRegistrationResponseDto { IsSuccessfulRegistration = true, Errors = new List<string> { "Registrácia prebehla úspešne. Pre prihlásenie prosím overte svoju e-mailovú adresu." } });
            }
            else
            {
                return StatusCode(500, "Používateľ bol vytvorený ale nepodarilo sa poslať e-mail.");
            }
        }

        var errors = result.Errors.Select(e => e.Description);
            return Ok(new UserRegistrationResponseDto { IsSuccessfulRegistration = false, Errors = errors });

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
            return BadRequest("Niečo sa pokazilo");
        }
        [HttpGet("UnapprovedUsers")]
        public async Task<IActionResult> GetUnapprovedUsers()
        {
            var users = await _context.Users
                .Where(u => !u.IsApproved)
                .Select(u => new UserInfoDto()
                {
                    Id = u.Id,
                    Username = u.UserName,
                    Email = u.Email,
                    
                })
                .ToListAsync();

            return Ok(users);
        }
        [HttpPut("ApproveUser")]
        public async Task<IActionResult> ApproveUser([FromQuery] string userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound("Používateľ neexistuje.");

            user.IsApproved = true;
            await _context.SaveChangesAsync();

            return Ok("Používateľ bol schválený.");
        }
        [HttpPost("add-claim")]
        public async Task<IActionResult> AddClaim([FromBody] ClaimDto claimDto)
            // role: student/master/admin/root
        {
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
                return Ok(new UserLoginResponseDto { ErrorMessage = "Zadali ste nesprávne prihlasovacie údaje", IsAuthSuccessful = false });
            var checkConfirmed = await _userManager.IsEmailConfirmedAsync(user);
            if (!checkConfirmed)
                return Ok(new UserLoginResponseDto { ErrorMessage = "Váš email nieje overený", IsAuthSuccessful = false });
            if (!user.IsApproved)
                return Ok(new UserLoginResponseDto { ErrorMessage = "Váš účet ešte nebol schválený administrátorom", IsAuthSuccessful = false });

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
                return BadRequest(new { message = "Email je povinný." });

            if (string.IsNullOrEmpty(forgotPasswordDto.CaptchaToken))
                return BadRequest(new { message = "Prosím potvrďte že nieste bot" });

            var isCaptchaValid = await _captchaValidationService.ValidateCaptchaToken(forgotPasswordDto.CaptchaToken);
            if (!isCaptchaValid)
            {
                return BadRequest(new { message = "Nepodarila sa overiť CAPTCHA" });
            }

            var user = await _userManager.FindByEmailAsync(forgotPasswordDto.Email);
            if (user == null)
                return NotFound(new { message = "Používateľ s týmto emailom neexistuje." });

            var random = new Random();
            var newPassword = $"P{random.Next(100, 999)}a!{random.Next(10, 99)}";
            var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, resetToken, newPassword);

            if (result.Succeeded)
            {
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

            return BadRequest(new { message = "Obnova hesla zlyhala." });
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
                            Role = u.Role,
                            IsApproved = u.IsApproved

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

        [HttpDelete]
        [Route("deleteUser")]
        public IActionResult DeleteUser([FromQuery(Name = "userId")] string userId)
        {
            //deleting from DB
            var result = _context.Users.Include(u => u.Comments).Include(u => u.Posts)
            .FirstOrDefault(u => u.Id == userId);
            if (result != null)
            {
                // vymazanie všetkých lajkov u komentárov usera
                foreach(var like in result.CommentLikes)
                {
                    _context.CommentLikes.Remove(like);
                }

                // vymazanie všetkých lajkov u postovv usera
                foreach (var like in result.Likes)
                {
                    _context.PostLikes.Remove(like);
                }

                // vymazanie všetkých komentárov
                var comments = _context.Comment.Where(c => c.UserId == userId).Include(c => c.Likes);
                foreach (var comment in comments)
                {
                    
                    var commentLikes = comment.Likes;
                    foreach(var like in commentLikes)
                    {

                       _context.CommentLikes.Remove(like);
                    }
                    _context.Comment.Remove(comment);
                }

                // vymazanie postov usera
                foreach (var post in result.Posts)
                {
                    DeletePost(post.Id);
                }
                

                _context.Users.Remove(result);
                _context.SaveChanges();
            }
            return Ok(userId);
        }

        // only usable in this file
        private void DeletePost(int postId)
        {
            //deleting from DB
            var result = _context.Post.Include(p => p.Likes)
            .FirstOrDefault(p => p.Id == postId);
            var comments = _context.Comment.Include(c => c.Likes).Where(c => c.PostId == result.Id);
            if (result != null)
            {
                foreach (var comment in comments)
                {
                    foreach (var like in comment.Likes)
                    {
                        _context.CommentLikes.Remove(like);
                    }
                    _context.Comment.Remove(comment);
                }
                foreach (var like in result.Likes)
                {
                    _context.PostLikes.Remove(like);
                }
                _context.Post.Remove(result);
                //_context.SaveChanges();
            }
        }
    }

   
    public class ReCaptchaResponse
    {
        public bool Success { get; set; }
        public string ChallengeTs { get; set; }
        public string Hostname { get; set; }
        public string[] ErrorCodes { get; set; }
    }
}

﻿using System.ComponentModel.DataAnnotations;

namespace AspNetCoreAPI.Registration.dto
{
    public class UserRegistrationDto
    {
        [Required(ErrorMessage = "Username is required.")]
        public string? UserName { get; set; }
        [Required(ErrorMessage = "Email is required.")]
        public string? Email { get; set; }

        [Required(ErrorMessage = "Password is required")]
        public string? Password { get; set; }

        //[Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
        public string? ConfirmPassword { get; set; }

        [Required(ErrorMessage = "Captcha token is required")]
        public string? CaptchaToken { get; set; }
    }
}

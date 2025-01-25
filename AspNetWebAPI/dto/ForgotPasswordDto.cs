namespace AspNetCoreAPI.dto;

public class ForgotPasswordDto
{
    public string Email { get; set; }
    public string CaptchaToken { get; set; }
}
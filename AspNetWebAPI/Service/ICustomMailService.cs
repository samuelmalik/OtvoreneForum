using AspNetCoreAPI.Models;
using Microsoft.Extensions.Options;
using MimeKit;
using MailKit.Net.Smtp;


namespace AspNetCoreAPI.Service
{
    public interface ICustomMailService
    {
        bool SendMail(MailData mailData);
    }
}
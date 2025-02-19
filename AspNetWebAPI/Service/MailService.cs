using AspNetCoreAPI.Models;
using Microsoft.Extensions.Options;
using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;
using System;

namespace AspNetCoreAPI.Service
{
    public class MailService : ICustomMailService
    {
        private readonly MailSetting _mailSetting;

        public MailService(IOptions<MailSetting> options)
        {
            _mailSetting = options.Value;
        }

        public bool SendMail(MailData mailData)
        {
            try
            {
                var emailMessage = new MimeMessage();
                emailMessage.From.Add(new MailboxAddress(_mailSetting.Name, _mailSetting.EmailId));
                emailMessage.To.Add(new MailboxAddress(mailData.EmailToName, mailData.EmailToId));
                emailMessage.Subject = mailData.EmailSubject;

                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = mailData.EmailBody
                };
                emailMessage.Body = bodyBuilder.ToMessageBody();

                using (var mailClient = new SmtpClient())
                {
                    try
                    {
                        mailClient.ServerCertificateValidationCallback = (s, c, h, e) => true;
                        mailClient.Connect(_mailSetting.Host, _mailSetting.Port, SecureSocketOptions.StartTls);

                        mailClient.Authenticate(_mailSetting.UserName, _mailSetting.Password);

                        mailClient.Send(emailMessage);

                        mailClient.Disconnect(true);
                        return true;
                    }
                    catch (Exception smtpEx)
                    {
                        Console.WriteLine(smtpEx.Message);
                        return false;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return false;
            }
        }
    }
}

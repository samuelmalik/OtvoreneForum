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
                    TextBody = mailData.EmailBody
                };
                emailMessage.Body = bodyBuilder.ToMessageBody();

                using (var mailClient = new SmtpClient())
                {
                    try
                    {
                        // Pridáme logovanie pripojenia a autentifikácie
                        Console.WriteLine($"Connecting to SMTP server: {_mailSetting.Host}:{_mailSetting.Port}");

                        mailClient.ServerCertificateValidationCallback = (s, c, h, e) => true;  // Disable SSL cert validation for testing
                        mailClient.Connect(_mailSetting.Host, _mailSetting.Port, SecureSocketOptions.StartTls);

                        Console.WriteLine("Connected to SMTP server.");

                        mailClient.Authenticate(_mailSetting.UserName, _mailSetting.Password);
                        Console.WriteLine("Authenticated successfully.");

                        mailClient.Send(emailMessage);
                        Console.WriteLine("Email sent successfully.");

                        mailClient.Disconnect(true);
                        return true;
                    }
                    catch (Exception smtpEx)
                    {
                        // Logujeme SMTP chyby podrobne
                        Console.WriteLine("SMTP Exception:");
                        Console.WriteLine(smtpEx.Message);
                        Console.WriteLine(smtpEx.StackTrace);
                        return false;
                    }
                }
            }
            catch (Exception ex)
            {
                // Logovanie ak sa email ani nevytvorí
                Console.WriteLine("General Exception:");
                Console.WriteLine(ex.Message);
                Console.WriteLine(ex.StackTrace);
                return false;
            }
        }
    }
}

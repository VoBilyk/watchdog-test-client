using AutoMapper;
using System.Threading.Tasks;
using Thread_.NET.BLL.Services.Abstract;
using Thread_.NET.Common.DTO.Email;
using Thread_.NET.DAL.Context;
using System.Net.Mail;
using System;
using System.Net;

namespace Thread_.NET.BLL.Services
{
    public sealed class EmailService : BaseService
    {
        public EmailService(ThreadContext context, IMapper mapper) : base(context, mapper) { }

        public async Task SendEmail(EmailDTO email)
        {
            MailAddress to = new MailAddress(email.RecipientEmail);
            MailAddress from = new MailAddress("thread_net@gmail.com", "ThreadNet");

            MailMessage message = new MailMessage(from, to);
            message.Subject = $"{email.Subject}";
            message.Body = $"{email.Body}";
            message.IsBodyHtml = true;

            SmtpClient client = new SmtpClient("smtp.gmail.com", 587)
            {
                Credentials = new NetworkCredential("thread_net@gmail.com", "password"),
                EnableSsl = true
            };

            try
            {
                await client.SendMailAsync(message);
            }
            catch (SmtpException ex)
            {
                Console.WriteLine(ex.ToString());
            }
        }
    }
}
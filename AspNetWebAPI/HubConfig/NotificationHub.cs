using Microsoft.AspNetCore.SignalR;

namespace AspNetCoreAPI.HubConfig
{
    public class NotificationHub : Hub
    {
        public async Task SendMessage()
        {
            await Clients.All.SendAsync("ReceiveMessage");
        }
    }
}
